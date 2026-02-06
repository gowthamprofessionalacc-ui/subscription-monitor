// Cron Jobs - Scheduled tasks for subscription monitoring
const cron = require('node-cron');
const { supabaseAdmin } = require('../config/supabase');
const calculationService = require('../services/calculationService');
const notificationService = require('../services/notificationService');

class CronJobs {
    
    init() {
        console.log('Initializing cron jobs...');
        
        // Run daily at 9:00 AM
        cron.schedule('0 9 * * *', async () => {
            console.log('Running daily cron jobs...');
            await this.updateAllSubscriptionStates();
            await this.checkRenewalAlerts();
            await this.sendUsageCheckNotifications();
        });
        
        // Run weekly on Sunday at 10:00 AM - Budget pressure check
        cron.schedule('0 10 * * 0', async () => {
            console.log('Running weekly budget check...');
            await this.checkBudgetPressure();
        });
        
        // Run hourly - Mark ignored notifications
        cron.schedule('0 * * * *', async () => {
            await this.markIgnoredNotifications();
        });
        
        console.log('Cron jobs initialized');
    }
    
    // =============================================
    // UPDATE ALL SUBSCRIPTION STATES
    // =============================================
    async updateAllSubscriptionStates() {
        try {
            const { data: subscriptions } = await supabaseAdmin
                .from('subscriptions')
                .select(`
                    *,
                    subscription_state (*)
                `);
            
            for (const subscription of subscriptions) {
                if (subscription.subscription_state) {
                    // Skip seasonal subscriptions during off-season
                    if (subscription.is_seasonal) {
                        // Add seasonal logic here if needed
                        continue;
                    }
                    
                    const newState = calculationService.calculateFullState(
                        subscription,
                        subscription.subscription_state
                    );
                    
                    await supabaseAdmin
                        .from('subscription_state')
                        .update(newState)
                        .eq('subscription_id', subscription.id);
                }
            }
            
            console.log(`Updated ${subscriptions.length} subscription states`);
        } catch (error) {
            console.error('Error updating subscription states:', error);
        }
    }
    
    // =============================================
    // CHECK RENEWAL ALERTS
    // =============================================
    async checkRenewalAlerts() {
        try {
            const today = new Date();
            const fiveDaysLater = new Date(today);
            fiveDaysLater.setDate(today.getDate() + 5);
            
            const { data: subscriptions } = await supabaseAdmin
                .from('subscriptions')
                .select(`
                    *,
                    subscription_state (*)
                `)
                .lte('renewal_date', fiveDaysLater.toISOString().split('T')[0])
                .gte('renewal_date', today.toISOString().split('T')[0]);
            
            for (const subscription of subscriptions) {
                const state = subscription.subscription_state;
                
                if (state && ['MEDIUM', 'HIGH'].includes(state.risk_level)) {
                    // Check if intentional keep is not set
                    if (!state.intentional_keep) {
                        await notificationService.sendRenewalAlert(
                            subscription.user_id,
                            subscription,
                            state
                        );
                    }
                }
            }
            
            console.log(`Checked ${subscriptions.length} subscriptions for renewal alerts`);
        } catch (error) {
            console.error('Error checking renewal alerts:', error);
        }
    }
    
    // =============================================
    // SEND USAGE CHECK NOTIFICATIONS
    // =============================================
    async sendUsageCheckNotifications() {
        try {
            const today = new Date();
            
            const { data: subscriptions } = await supabaseAdmin
                .from('subscriptions')
                .select(`
                    *,
                    subscription_state (*)
                `);
            
            for (const subscription of subscriptions) {
                const state = subscription.subscription_state;
                
                if (!state) continue;
                
                // Skip if intentional keep
                if (state.intentional_keep) continue;
                
                // Skip seasonal subscriptions
                if (subscription.is_seasonal) continue;
                
                // Check alert interval
                const alertInterval = state.alert_interval || 7;
                const lastAlertDate = state.last_alert_date ? new Date(state.last_alert_date) : null;
                
                if (lastAlertDate) {
                    const daysSinceLastAlert = Math.floor((today - lastAlertDate) / (1000 * 60 * 60 * 24));
                    if (daysSinceLastAlert < alertInterval) continue;
                }
                
                // Send notification
                await notificationService.sendUsageCheckNotification(
                    subscription.user_id,
                    subscription
                );
            }
            
            console.log('Usage check notifications sent');
        } catch (error) {
            console.error('Error sending usage check notifications:', error);
        }
    }
    
    // =============================================
    // CHECK BUDGET PRESSURE
    // =============================================
    async checkBudgetPressure() {
        try {
            const { data: users } = await supabaseAdmin
                .from('users')
                .select('id');
            
            for (const user of users) {
                const budgetInfo = await calculationService.calculateBudgetPressure(user.id);
                
                if (budgetInfo.hasPressure) {
                    await notificationService.sendBudgetWarning(user.id, budgetInfo);
                }
            }
            
            console.log('Budget pressure check completed');
        } catch (error) {
            console.error('Error checking budget pressure:', error);
        }
    }
    
    // =============================================
    // MARK IGNORED NOTIFICATIONS
    // =============================================
    async markIgnoredNotifications() {
        try {
            // Mark notifications older than 24 hours without response as ignored
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const { data: oldNotifications } = await supabaseAdmin
                .from('notifications')
                .select('id, subscription_id')
                .eq('notification_type', 'usage_check')
                .is('response', null)
                .lt('created_at', yesterday.toISOString());
            
            for (const notification of oldNotifications || []) {
                await notificationService.respondToNotification(notification.id, 'ignored');
            }
            
            if (oldNotifications && oldNotifications.length > 0) {
                console.log(`Marked ${oldNotifications.length} notifications as ignored`);
            }
        } catch (error) {
            console.error('Error marking ignored notifications:', error);
        }
    }
}

module.exports = new CronJobs();
