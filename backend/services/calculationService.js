// Calculation Service - Core Backend Logic
// All formulas and business rules from the specification

const { supabaseAdmin } = require('../config/supabase');

class CalculationService {
    
    // =============================================
    // 1. USAGE CONFIDENCE SCORE
    // =============================================
    calculateUsageConfidence(currentScore, response) {
        let newScore = currentScore;
        
        switch (response) {
            case 'yes':
                newScore += 10;
                break;
            case 'no':
                newScore -= 15;
                break;
            case 'ignored':
                newScore -= 5;
                break;
        }
        
        // Clamp between 0 and 100
        return Math.max(0, Math.min(100, newScore));
    }
    
    // =============================================
    // 2. DAYS UNUSED CLASSIFICATION
    // =============================================
    getDaysUnusedCategory(daysUnused) {
        if (daysUnused <= 14) return 'recent';
        if (daysUnused <= 30) return 'cooling';
        if (daysUnused <= 60) return 'concerning';
        return 'stale';
    }
    
    // =============================================
    // 3. NORMALIZED MONTHLY COST
    // =============================================
    calculateMonthlyCost(amount, billingCycle, isShared = false, sharedMembersCount = 1) {
        let monthlyCost = amount;
        
        switch (billingCycle) {
            case 'yearly':
                monthlyCost = amount / 12;
                break;
            case 'quarterly':
                monthlyCost = amount / 3;
                break;
            default: // monthly
                monthlyCost = amount;
        }
        
        // Divide by shared members if applicable
        if (isShared && sharedMembersCount > 1) {
            monthlyCost = monthlyCost / sharedMembersCount;
        }
        
        return Math.round(monthlyCost * 100) / 100;
    }
    
    getCostImpact(monthlyCost) {
        if (monthlyCost < 200) return 'low';
        if (monthlyCost <= 500) return 'medium';
        return 'high';
    }
    
    // =============================================
    // 4. LEAKAGE RISK SCORE (CORE ENGINE)
    // =============================================
    calculateRiskScore(usageConfidence, daysUnused, monthlyCost, autoRenew, isCritical) {
        // Step 1: Base risk from usage
        let usageRisk = 0;
        if (usageConfidence < 30) usageRisk = 40;
        else if (usageConfidence <= 60) usageRisk = 20;
        
        // Step 2: Time penalty
        let timeRisk = 0;
        if (daysUnused > 60) timeRisk = 30;
        else if (daysUnused >= 31) timeRisk = 15;
        
        // Step 3: Cost multiplier
        let costMultiplier = 1.0;
        if (monthlyCost > 500) costMultiplier = 1.5;
        else if (monthlyCost >= 200) costMultiplier = 1.2;
        
        // Step 4: Auto-renew penalty
        let autoRenewRisk = autoRenew ? 10 : 0;
        
        // Step 5: Raw risk
        let rawRisk = (usageRisk + timeRisk + autoRenewRisk) * costMultiplier;
        
        // Step 6: Critical override
        if (isCritical) {
            rawRisk = Math.min(rawRisk, 30);
        }
        
        return Math.round(rawRisk * 100) / 100;
    }
    
    getRiskLevel(riskScore) {
        if (riskScore <= 30) return 'LOW';
        if (riskScore <= 60) return 'MEDIUM';
        return 'HIGH';
    }
    
    // =============================================
    // 5. WASTE CONFIDENCE SCORE
    // =============================================
    calculateWasteConfidence(rawRisk, ignoredCount, intentionalKeep) {
        let wasteConfidence = rawRisk;
        
        // Adjust by behavior
        if (ignoredCount >= 3) {
            wasteConfidence += 10;
        }
        
        if (intentionalKeep) {
            wasteConfidence -= 30;
        }
        
        // Clamp 0-100
        return Math.max(0, Math.min(100, Math.round(wasteConfidence * 100) / 100));
    }
    
    // =============================================
    // 6. MONEY WASTED CALCULATION
    // =============================================
    calculateWastedAmount(monthlyCost, daysUnused) {
        const monthsUnused = Math.floor(daysUnused / 30);
        const wastedAmount = monthlyCost * monthsUnused;
        return Math.round(wastedAmount * 100) / 100;
    }
    
    calculateYearlyBleed(monthlyCost) {
        return Math.round(monthlyCost * 12 * 100) / 100;
    }
    
    // =============================================
    // 7. RENEWAL SHOCK ALERT LOGIC
    // =============================================
    shouldTriggerRenewalAlert(renewalDate, riskLevel) {
        if (!renewalDate) return false;
        
        const today = new Date();
        const renewal = new Date(renewalDate);
        const daysUntilRenewal = Math.ceil((renewal - today) / (1000 * 60 * 60 * 24));
        
        return daysUntilRenewal <= 5 && ['MEDIUM', 'HIGH'].includes(riskLevel);
    }
    
    // =============================================
    // 8. ALERT INTERVAL CALCULATION
    // =============================================
    calculateAlertInterval(ignoredCount) {
        return ignoredCount >= 3 ? 30 : 7;
    }
    
    // =============================================
    // 9. FULL STATE CALCULATION
    // =============================================
    calculateFullState(subscription, currentState = {}) {
        const today = new Date();
        const lastUsedDate = currentState.last_used_date ? new Date(currentState.last_used_date) : today;
        const daysUnused = Math.floor((today - lastUsedDate) / (1000 * 60 * 60 * 24));
        
        const monthlyCost = this.calculateMonthlyCost(
            subscription.amount,
            subscription.billing_cycle,
            subscription.is_shared,
            subscription.shared_members_count
        );
        
        const usageConfidence = currentState.usage_confidence || 50;
        const ignoredCount = currentState.ignored_count || 0;
        const intentionalKeep = currentState.intentional_keep || false;
        
        const riskScore = this.calculateRiskScore(
            usageConfidence,
            daysUnused,
            monthlyCost,
            subscription.auto_renew,
            subscription.is_critical
        );
        
        const riskLevel = this.getRiskLevel(riskScore);
        const wasteConfidence = this.calculateWasteConfidence(riskScore, ignoredCount, intentionalKeep);
        const monthsUnused = Math.floor(daysUnused / 30);
        const wastedAmount = this.calculateWastedAmount(monthlyCost, daysUnused);
        const yearlyBleed = subscription.auto_renew ? this.calculateYearlyBleed(monthlyCost) : 0;
        const alertInterval = this.calculateAlertInterval(ignoredCount);
        
        return {
            usage_confidence: usageConfidence,
            last_used_date: lastUsedDate.toISOString().split('T')[0],
            days_unused: daysUnused,
            monthly_cost: monthlyCost,
            risk_score: riskScore,
            risk_level: riskLevel,
            waste_confidence: wasteConfidence,
            months_unused: monthsUnused,
            wasted_amount: wastedAmount,
            yearly_bleed: yearlyBleed,
            intentional_keep: intentionalKeep,
            ignored_count: ignoredCount,
            alert_interval: alertInterval
        };
    }
    
    // =============================================
    // 10. BUDGET PRESSURE CALCULATION
    // =============================================
    async calculateBudgetPressure(userId) {
        // Get user's budget
        const { data: settings } = await supabaseAdmin
            .from('user_settings')
            .select('monthly_subscription_budget')
            .eq('user_id', userId)
            .single();
        
        if (!settings || !settings.monthly_subscription_budget) {
            return { hasPressure: false };
        }
        
        // Get all subscription states
        const { data: subscriptions } = await supabaseAdmin
            .from('subscriptions')
            .select(`
                id,
                name,
                subscription_state (monthly_cost, waste_confidence)
            `)
            .eq('user_id', userId);
        
        const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
            return sum + (sub.subscription_state?.monthly_cost || 0);
        }, 0);
        
        const budget = settings.monthly_subscription_budget;
        const hasPressure = totalMonthlyCost > budget;
        
        // Sort by waste_confidence if over budget
        let topOffenders = [];
        if (hasPressure) {
            topOffenders = subscriptions
                .filter(s => s.subscription_state)
                .sort((a, b) => b.subscription_state.waste_confidence - a.subscription_state.waste_confidence)
                .slice(0, 3)
                .map(s => ({
                    id: s.id,
                    name: s.name,
                    wasteConfidence: s.subscription_state.waste_confidence,
                    monthlyCost: s.subscription_state.monthly_cost
                }));
        }
        
        return {
            hasPressure,
            budget,
            totalMonthlyCost,
            overage: hasPressure ? totalMonthlyCost - budget : 0,
            topOffenders
        };
    }
}

module.exports = new CalculationService();
