// Subscription Routes
const express = require('express');
const router = express.Router();
const subscriptionService = require('../services/subscriptionService');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get OTT catalog
router.get('/catalog', async (req, res, next) => {
    try {
        const catalog = await subscriptionService.getOttCatalog();
        res.json(catalog);
    } catch (error) {
        next(error);
    }
});

// Get all user subscriptions
router.get('/', async (req, res, next) => {
    try {
        const subscriptions = await subscriptionService.getUserSubscriptions(req.userId);
        res.json(subscriptions);
    } catch (error) {
        next(error);
    }
});

// Get dashboard summary
router.get('/dashboard', async (req, res, next) => {
    try {
        const summary = await subscriptionService.getDashboardSummary(req.userId);
        res.json(summary);
    } catch (error) {
        next(error);
    }
});

// Get single subscription
router.get('/:id', async (req, res, next) => {
    try {
        const subscription = await subscriptionService.getSubscription(
            parseInt(req.params.id),
            req.userId
        );
        res.json(subscription);
    } catch (error) {
        next(error);
    }
});

// Create subscription
router.post('/', async (req, res, next) => {
    try {
        const subscription = await subscriptionService.createSubscription(req.userId, req.body);
        res.status(201).json(subscription);
    } catch (error) {
        next(error);
    }
});

// Update subscription
router.put('/:id', async (req, res, next) => {
    try {
        const subscription = await subscriptionService.updateSubscription(
            parseInt(req.params.id),
            req.userId,
            req.body
        );
        res.json(subscription);
    } catch (error) {
        next(error);
    }
});

// Delete subscription
router.delete('/:id', async (req, res, next) => {
    try {
        await subscriptionService.deleteSubscription(
            parseInt(req.params.id),
            req.userId
        );
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// Set intentional keep
router.post('/:id/intentional-keep', async (req, res, next) => {
    try {
        const { intentional_keep } = req.body;
        const result = await subscriptionService.setIntentionalKeep(
            parseInt(req.params.id),
            req.userId,
            intentional_keep
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
