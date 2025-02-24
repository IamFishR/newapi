const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter, authLimiter, syncLimiter } = require('../middleware/rateLimiter');
const UserService = require('../services/user/UserService');
const RoleService = require('../services/user/RoleService');
const PreferenceService = require('../services/user/PreferenceService');
const ValidationService = require('../utils/ValidationService');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Authentication routes with stricter rate limiting
router.post('/register', authLimiter, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('user', req.body);
        const { user, session } = await UserService.createUser(validatedData, req);
        
        res.cookie('session_token', session.session_token, COOKIE_OPTIONS);
        res.status(201).json({ 
            status: 'success',
            data: {
                user_id: user.id,
                name: user.username,
                email: user.email
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation Error',
                errors: error.details || error.errors
            });
        }
        next(error);
    }
});

router.post('/authenticate', authLimiter, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, session } = await UserService.loginUser(email, password, req);
        
        res.cookie('session_token', session.session_token, COOKIE_OPTIONS);
        res.json({
            user_id: user.id,
            name: user.username,
            email: user.email,
            session_token: session.session_token
        });
    } catch (error) {
        next(error);
    }
});

router.post('/signout', auth.isAuthenticated, async (req, res) => {
    try {
        const token = req.cookies.session_token;
        await UserService.logoutUser(token);
        res.clearCookie('session_token');
        res.json({ message: 'Sign out successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User profile routes
router.get('/profile', auth.isAuthenticated, async (req, res) => {
    try {
        const user = await UserService.getUser(req.user.id);
        await SyncService.verifyDataIntegrity(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/profile', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('userPreferences', req.body);
        const updated = await UserService.updateUserProfile(req.user.id, validatedData);
        await SyncService.syncUserData(updated);
        res.json(updated);
    } catch (error) {
        next(error);
    }
});

// User preferences routes
router.get('/preferences', auth.isAuthenticated, async (req, res) => {
    try {
        const preferences = await PreferenceService.getPreferences(req.user.id);
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/preferences', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('userPreferences', req.body);
        const preferences = await PreferenceService.createOrUpdatePreferences(req.user.id, validatedData);
        await SyncService.syncUserData({ ...preferences });
        res.json(preferences);
    } catch (error) {
        next(error);
    }
});

// Admin routes
router.get('/list', auth.isAuthenticated, auth.hasRole('admin'), async (req, res) => {
    try {
        const users = await UserService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:userId/role', auth.isAuthenticated, auth.hasRole('admin'), async (req, res) => {
    try {
        const { roleId } = req.body;
        await RoleService.assignRoleToUser(req.params.userId, roleId);
        res.json({ message: 'Role updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Apply sync rate limiter to sync operations
router.post('/sync', auth.isAuthenticated, syncLimiter, async (req, res) => {
    try {
        await SyncService.processOfflineQueue();
        await SyncService.validateAndResyncAllData(req.user.id);
        res.json({ message: 'Sync completed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
