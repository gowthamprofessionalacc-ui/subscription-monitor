// Subscription Service - CRUD and state management
const { supabaseAdmin } = require('../config/supabase');
const calculationService = require('./calculationService');
const { getTheme } = require('../config/ottThemes');

class SubscriptionService {
    
    // =============================================
    // DATE VALIDATION HELPERS
    // =============================================
    getMinimumDaysForBillingCycle(billingCycle) {
        const cycles = {
            'monthly': 30,
            'quarterly': 90,
            'yearly': 365
        };
        return cycles[billingCycle] || 30;
    }
    
    calculateRenewalDate(startDate, billingCycle) {
        const start = new Date(startDate);
        const minDays = this.getMinimumDaysForBillingCycle(billingCycle);
        const renewal = new Date(start);
        renewal.setDate(renewal.getDate() + minDays);
        return renewal.toISOString().split('T')[0];
    }
    
    validateSubscriptionDates(startDate, renewalDate, billingCycle) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const start = new Date(startDate);
        const renewal = new Date(renewalDate);
        
        // Rule 1: Renewal date must be in the future
        if (renewal <= today) {
            throw new Error('Renewal date must be in the future');
        }
        
        // Rule 2: Minimum gap based on billing cycle
        const minDays = this.getMinimumDaysForBillingCycle(billingCycle);
        const diffTime = renewal - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < minDays) {
            const cycleNames = {
                'monthly': 'monthly',
                'quarterly': 'quarterly', 
                'yearly': 'yearly'
            };
            const cycleName = cycleNames[billingCycle] || 'monthly';
            throw new Error(`Renewal date must be at least ${minDays} days after start date for ${cycleName} billing`);
        }
        
        return true;
    }
    
    // =============================================
    // DUPLICATE SUBSCRIPTION CHECK
    // =============================================
    async checkDuplicateSubscription(userId, ottCatalogId, name) {
        // If predefined OTT (has ott_catalog_id), check by ott_catalog_id
        if (ottCatalogId) {
            const { data: existingById } = await supabaseAdmin
                .from('subscriptions')
                .select('id, name')
                .eq('user_id', userId)
                .eq('ott_catalog_id', ottCatalogId)
                .single();
            
            if (existingById) {
                throw new Error(`You already have a subscription for ${existingById.name}. Please edit the existing subscription or delete it first.`);
            }
        }
        
        // Also check by name (case-insensitive) to prevent duplicates
        const { data: existingByName } = await supabaseAdmin
            .from('subscriptions')
            .select('id, name')
            .eq('user_id', userId)
            .ilike('name', name)
            .single();
        
        if (existingByName) {
            throw new Error(`You already have a subscription for ${existingByName.name}. Please edit the existing subscription or delete it first.`);
        }
        
        return true;
    }
    
    // =============================================
    // CREATE SUBSCRIPTION
    // =============================================
    async createSubscription(userId, subscriptionData) {
        const { 
            ott_catalog_id, 
            name, 
            category, 
            amount, 
            billing_cycle, 
            auto_renew,
            start_date,
            renewal_date,
            is_shared,
            shared_members_count,
            is_critical,
            is_seasonal
        } = subscriptionData;
        
        // Check for duplicate subscription
        await this.checkDuplicateSubscription(userId, ott_catalog_id, name);
        
        // Set default billing cycle
        const finalBillingCycle = billing_cycle || 'monthly';
        
        // Set default start date if not provided
        const finalStartDate = start_date || new Date().toISOString().split('T')[0];
        
        // Auto-calculate renewal date if not provided
        const finalRenewalDate = renewal_date || this.calculateRenewalDate(finalStartDate, finalBillingCycle);
        
        // Validate dates
        this.validateSubscriptionDates(finalStartDate, finalRenewalDate, finalBillingCycle);
        
        // Get theme info
        const theme = getTheme(name);
        
        // Insert subscription
        const { data: subscription, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .insert({
                user_id: userId,
                ott_catalog_id,
                name,
                category: category || 'streaming',
                amount,
                billing_cycle: finalBillingCycle,
                auto_renew: auto_renew !== false,
                start_date: finalStartDate,
                renewal_date: finalRenewalDate,
                is_shared: is_shared || false,
                shared_members_count: shared_members_count || 1,
                is_critical: is_critical || false,
                is_seasonal: is_seasonal || false,
                logo_url: theme.iconName ? `/icons/${theme.iconName}.svg` : null,
                theme_color: theme.primaryColor
            })
            .select()
            .single();
        
        if (subError) throw subError;
        
        // Calculate initial state
        const initialState = calculationService.calculateFullState(subscription, {
            usage_confidence: 50,
            last_used_date: new Date().toISOString().split('T')[0],
            ignored_count: 0,
            intentional_keep: false
        });
        
        // Insert subscription state
        const { error: stateError } = await supabaseAdmin
            .from('subscription_state')
            .insert({
                subscription_id: subscription.id,
                ...initialState
            });
        
        if (stateError) throw stateError;
        
        return subscription;
    }
    
    // =============================================
    // GET USER SUBSCRIPTIONS
    // =============================================
    async getUserSubscriptions(userId) {
        const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .select(`
                *,
                ott_catalog (*),
                subscription_state (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Enhance with theme data
        return data.map(sub => ({
            ...sub,
            theme: getTheme(sub.name)
        }));
    }
    
    // =============================================
    // GET SINGLE SUBSCRIPTION
    // =============================================
    async getSubscription(subscriptionId, userId) {
        const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .select(`
                *,
                ott_catalog (*),
                subscription_state (*),
                usage_logs (*)
            `)
            .eq('id', subscriptionId)
            .eq('user_id', userId)
            .single();
        
        if (error) throw error;
        
        return {
            ...data,
            theme: getTheme(data.name)
        };
    }
    
    // =============================================
    // UPDATE SUBSCRIPTION
    // =============================================
    async updateSubscription(subscriptionId, userId, updateData) {
        // Verify ownership and get existing data
        const { data: existing } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('id', subscriptionId)
            .eq('user_id', userId)
            .single();
        
        if (!existing) throw new Error('Subscription not found');
        
        // If dates or billing_cycle are being updated, validate them
        const finalStartDate = updateData.start_date || existing.start_date;
        const finalBillingCycle = updateData.billing_cycle || existing.billing_cycle;
        let finalRenewalDate = updateData.renewal_date || existing.renewal_date;
        
        // If billing_cycle changed but renewal_date not provided, recalculate
        if (updateData.billing_cycle && !updateData.renewal_date) {
            finalRenewalDate = this.calculateRenewalDate(finalStartDate, finalBillingCycle);
            updateData.renewal_date = finalRenewalDate;
        }
        
        // Validate dates if any date-related field is being updated
        if (updateData.start_date || updateData.renewal_date || updateData.billing_cycle) {
            this.validateSubscriptionDates(finalStartDate, finalRenewalDate, finalBillingCycle);
        }
        
        const { data, error } = await supabaseAdmin
            .from('subscriptions')
            .update(updateData)
            .eq('id', subscriptionId)
            .select()
            .single();
        
        if (error) throw error;
        
        // Recalculate state
        const { data: currentState } = await supabaseAdmin
            .from('subscription_state')
            .select('*')
            .eq('subscription_id', subscriptionId)
            .single();
        
        if (currentState) {
            const newState = calculationService.calculateFullState(data, currentState);
            await supabaseAdmin
                .from('subscription_state')
                .update(newState)
                .eq('subscription_id', subscriptionId);
        }
        
        return data;
    }
    
    // =============================================
    // DELETE SUBSCRIPTION
    // =============================================
    async deleteSubscription(subscriptionId, userId) {
        const { error } = await supabaseAdmin
            .from('subscriptions')
            .delete()
            .eq('id', subscriptionId)
            .eq('user_id', userId);
        
        if (error) throw error;
        return { success: true };
    }
    
    // =============================================
    // SET INTENTIONAL KEEP
    // =============================================
    async setIntentionalKeep(subscriptionId, userId, intentionalKeep) {
        // Verify ownership
        const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('id', subscriptionId)
            .eq('user_id', userId)
            .single();
        
        if (!subscription) throw new Error('Subscription not found');
        
        // Get current state
        const { data: currentState } = await supabaseAdmin
            .from('subscription_state')
            .select('*')
            .eq('subscription_id', subscriptionId)
            .single();
        
        // Recalculate with new intentional_keep value
        const newState = calculationService.calculateFullState(subscription, {
            ...currentState,
            intentional_keep: intentionalKeep
        });
        
        // Update state
        const { error } = await supabaseAdmin
            .from('subscription_state')
            .update(newState)
            .eq('subscription_id', subscriptionId);
        
        if (error) throw error;
        
        // Log decision
        await supabaseAdmin
            .from('decisions')
            .insert({
                subscription_id: subscriptionId,
                action: intentionalKeep ? 'intentional_keep' : 'remove_intentional_keep'
            });
        
        return { success: true, state: newState };
    }
    
    // =============================================
    // GET DASHBOARD SUMMARY
    // =============================================
    async getDashboardSummary(userId) {
        const { data: subscriptions } = await supabaseAdmin
            .from('subscriptions')
            .select(`
                *,
                subscription_state (*)
            `)
            .eq('user_id', userId);
        
        const totalSubscriptions = subscriptions.length;
        const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
            return sum + (sub.subscription_state?.monthly_cost || 0);
        }, 0);
        
        const riskBreakdown = {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0
        };
        
        subscriptions.forEach(sub => {
            const level = sub.subscription_state?.risk_level || 'LOW';
            riskBreakdown[level]++;
        });
        
        const totalWasted = subscriptions.reduce((sum, sub) => {
            return sum + (sub.subscription_state?.wasted_amount || 0);
        }, 0);
        
        const yearlyProjectedBleed = subscriptions.reduce((sum, sub) => {
            return sum + (sub.subscription_state?.yearly_bleed || 0);
        }, 0);
        
        const budgetPressure = await calculationService.calculateBudgetPressure(userId);
        
        return {
            totalSubscriptions,
            totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
            riskBreakdown,
            totalWasted: Math.round(totalWasted * 100) / 100,
            yearlyProjectedBleed: Math.round(yearlyProjectedBleed * 100) / 100,
            budgetPressure
        };
    }
    
    // =============================================
    // GET OTT CATALOG
    // =============================================
    async getOttCatalog() {
        const { data, error } = await supabaseAdmin
            .from('ott_catalog')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        // Enhance with theme data
        return data.map(ott => ({
            ...ott,
            theme: getTheme(ott.name)
        }));
    }
}

module.exports = new SubscriptionService();
