// Auth Routes
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const authMiddleware = require('../middleware/authMiddleware');

// Register with email
router.post('/register', async (req, res, next) => {
    try {
        const { name, username, email, password, phone_number } = req.body;
        
        if (!name || !username || !email || !password) {
            return res.status(400).json({ error: 'Name, username, email and password are required' });
        }
        
        const result = await authService.registerWithEmail(name, username, email, password, phone_number);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Login with email
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const result = await authService.loginWithEmail(email, password);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Google auth
router.post('/google', async (req, res, next) => {
    try {
        const { uid, email, displayName, photoURL } = req.body;
        
        if (!uid || !email) {
            return res.status(400).json({ error: 'Google user data is required' });
        }
        
        const result = await authService.handleGoogleAuth({ uid, email, displayName, photoURL });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get profile
router.get('/profile', authMiddleware, async (req, res, next) => {
    try {
        const user = await authService.getUserProfile(req.userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res, next) => {
    try {
        const user = await authService.updateUserProfile(req.userId, req.body);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

// Update settings
router.put('/settings', authMiddleware, async (req, res, next) => {
    try {
        const settings = await authService.updateUserSettings(req.userId, req.body);
        res.json(settings);
    } catch (error) {
        next(error);
    }
});

// Verify token
router.get('/verify', authMiddleware, (req, res) => {
    res.json({ valid: true, userId: req.userId });
});

module.exports = router;
