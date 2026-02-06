// Notification Routes
const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { supabaseAdmin } = require('../config/supabase');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all notifications
router.get('/', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const notifications = await notificationService.getUserNotifications(req.userId, limit);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
});

// Get unread count
router.get('/unread-count', async (req, res, next) => {
    try {
        const count = await notificationService.getUnreadCount(req.userId);
        res.json({ count });
    } catch (error) {
        next(error);
    }
});

// Respond to notification (yes/no)
router.post('/:id/respond', async (req, res, next) => {
    try {
        const { response } = req.body;
        
        if (!['yes', 'no'].includes(response)) {
            return res.status(400).json({ error: 'Response must be "yes" or "no"' });
        }
        
        const result = await notificationService.respondToNotification(
            parseInt(req.params.id),
            response
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Mark as read
router.post('/:id/read', async (req, res, next) => {
    try {
        const result = await notificationService.markAsRead(parseInt(req.params.id));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Save push subscription
router.post('/push-subscription', async (req, res, next) => {
    try {
        const { endpoint, keys } = req.body;
        
        if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
            return res.status(400).json({ error: 'Invalid push subscription' });
        }
        
        // Check if already exists
        const { data: existing } = await supabaseAdmin
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', req.userId)
            .eq('endpoint', endpoint)
            .single();
        
        if (existing) {
            return res.json({ success: true, message: 'Already subscribed' });
        }
        
        // Save new subscription
        const { error } = await supabaseAdmin
            .from('push_subscriptions')
            .insert({
                user_id: req.userId,
                endpoint,
                p256dh_key: keys.p256dh,
                auth_key: keys.auth
            });
        
        if (error) throw error;
        
        res.status(201).json({ success: true });
    } catch (error) {
        next(error);
    }
});

// Delete push subscription
router.delete('/push-subscription', async (req, res, next) => {
    try {
        const { endpoint } = req.body;
        
        const { error } = await supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .eq('user_id', req.userId)
            .eq('endpoint', endpoint);
        
        if (error) throw error;
        
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
