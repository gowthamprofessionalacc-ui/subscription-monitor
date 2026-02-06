// Subscription Service - CRUD and state management
const { supabaseAdmin } = require('../config/supabase');
const calculationService = require('./calculationService');
const { getTheme } = require('../config/ottThemes');

class SubscriptionService {
    
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
                billing_cycle: billing_cycle || 'monthly',
                auto_renew: auto_renew !== false,
                start_date: start_date || new Date().toISOString().split('T')[0],
                renewal_date,
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
        // Verify ownership
        const { data: existing } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('id', subscriptionId)
            .eq('user_id', userId)
            .single();
        
        if (!existing) throw new Error('Subscription not found');
        
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
