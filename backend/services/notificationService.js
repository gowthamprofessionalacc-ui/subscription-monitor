// Notification Service - Push notifications and in-app notifications
const { supabaseAdmin } = require('../config/supabase');
const webpush = require('../config/webpush');
const calculationService = require('./calculationService');

class NotificationService {
    
    // =============================================
    // CREATE IN-APP NOTIFICATION
    // =============================================
    async createNotification(userId, subscriptionId, title, message, type) {
        const { data, error } = await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: userId,
                subscription_id: subscriptionId,
                title,
                message,
                notification_type: type,
                is_read: false
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    // =============================================
    // SEND PUSH NOTIFICATION
    // =============================================
    async sendPushNotification(userId, title, body, data = {}) {
        // Get user's push subscriptions
        const { data: pushSubs } = await supabaseAdmin
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', userId);
        
        if (!pushSubs || pushSubs.length === 0) {
            console.log('No push subscriptions found for user:', userId);
            return;
        }
        
        const payload = JSON.stringify({
            title,
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            data
        });
        
        const sendPromises = pushSubs.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh_key,
                    auth: sub.auth_key
                }
            };
            
            try {
                await webpush.sendNotification(pushSubscription, payload);
            } catch (error) {
                console.error('Push notification failed:', error);
                // Remove invalid subscription
                if (error.statusCode === 410) {
                    await supabaseAdmin
                        .from('push_subscriptions')
                        .delete()
                        .eq('id', sub.id);
                }
            }
        });
        
        await Promise.all(sendPromises);
    }
    
    // =============================================
    // USAGE CHECK NOTIFICATION
    // =============================================
    async sendUsageCheckNotification(userId, subscription) {
        const title = `Hey! Did you use ${subscription.name}?`;
        const message = `We noticed you haven't confirmed using ${subscription.name} recently. Did you use it this week?`;
        
        // Create in-app notification
        await this.createNotification(
            userId,
            subscription.id,
            title,
            message,
            'usage_check'
        );
        
        // Send push notification
        await this.sendPushNotification(userId, title, message, {
            type: 'usage_check',
            subscriptionId: subscription.id
        });
        
        // Update last_alert_date
        await supabaseAdmin
            .from('subscription_state')
            .update({ last_alert_date: new Date().toISOString().split('T')[0] })
            .eq('subscription_id', subscription.id);
    }
    
    // =============================================
    // RENEWAL ALERT NOTIFICATION
    // =============================================
    async sendRenewalAlert(userId, subscription, state) {
        const renewalDate = new Date(subscription.renewal_date);
        const formattedDate = renewalDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const title = `${subscription.name} renewing soon`;
        const message = `Your ${subscription.name} subscription (₹${state.monthly_cost}/month) will renew on ${formattedDate}. You haven't used it for ${state.days_unused} days.`;
        
        await this.createNotification(
            userId,
            subscription.id,
            title,
            message,
            'renewal_alert'
        );
        
        await this.sendPushNotification(userId, title, message, {
            type: 'renewal_alert',
            subscriptionId: subscription.id
        });
    }
    
    // =============================================
    // BUDGET WARNING NOTIFICATION
    // =============================================
    async sendBudgetWarning(userId, budgetInfo) {
        const title = 'Budget Alert';
        const message = `You're spending ₹${budgetInfo.totalMonthlyCost}/month on subscriptions, which is ₹${budgetInfo.overage} over your budget of ₹${budgetInfo.budget}.`;
        
        await this.createNotification(
            userId,
            null,
            title,
            message,
            'budget_warning'
        );
        
        await this.sendPushNotification(userId, title, message, {
            type: 'budget_warning'
        });
    }
    
    // =============================================
    // GET USER NOTIFICATIONS
    // =============================================
    async getUserNotifications(userId, limit = 50) {
        const { data, error } = await supabaseAdmin
            .from('notifications')
            .select(`
                *,
                subscriptions (
                    id,
                    name,
                    ott_catalog_id,
                    ott_catalog (name, primary_color, icon_name)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    }
    
    // =============================================
    // RESPOND TO NOTIFICATION
    // =============================================
    async respondToNotification(notificationId, response) {
        const { data: notification, error: fetchError } = await supabaseAdmin
            .from('notifications')
            .select('*, subscriptions(*)')
            .eq('id', notificationId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // Update notification
        await supabaseAdmin
            .from('notifications')
            .update({
                response,
                responded_at: new Date().toISOString(),
                is_read: true
            })
            .eq('id', notificationId);
        
        // Log usage
        if (notification.subscription_id) {
            await supabaseAdmin
                .from('usage_logs')
                .insert({
                    subscription_id: notification.subscription_id,
                    log_date: new Date().toISOString().split('T')[0],
                    used: response
                });
            
            // Get current state
            const { data: currentState } = await supabaseAdmin
                .from('subscription_state')
                .select('*')
                .eq('subscription_id', notification.subscription_id)
                .single();
            
            if (currentState) {
                // Calculate new usage confidence
                const newUsageConfidence = calculationService.calculateUsageConfidence(
                    currentState.usage_confidence,
                    response
                );
                
                // Update ignored count
                const newIgnoredCount = response === 'ignored' 
                    ? currentState.ignored_count + 1 
                    : currentState.ignored_count;
                
                // Update last_used_date if yes
                const lastUsedDate = response === 'yes' 
                    ? new Date().toISOString().split('T')[0] 
                    : currentState.last_used_date;
                
                // Recalculate state
                const subscription = notification.subscriptions;
                const updatedState = calculationService.calculateFullState(subscription, {
                    ...currentState,
                    usage_confidence: newUsageConfidence,
                    ignored_count: newIgnoredCount,
                    last_used_date: lastUsedDate
                });
                
                // Update state in database
                await supabaseAdmin
                    .from('subscription_state')
                    .update(updatedState)
                    .eq('subscription_id', notification.subscription_id);
            }
        }
        
        return { success: true };
    }
    
    // =============================================
    // MARK AS READ
    // =============================================
    async markAsRead(notificationId) {
        const { error } = await supabaseAdmin
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
        
        if (error) throw error;
        return { success: true };
    }
    
    // =============================================
    // GET UNREAD COUNT
    // =============================================
    async getUnreadCount(userId) {
        const { count, error } = await supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);
        
        if (error) throw error;
        return count;
    }
}

module.exports = new NotificationService();
