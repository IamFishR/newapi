const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter, authLimiter } = require('../middleware/rateLimiter');
const UserService = require('../services/user/UserService');
const RoleService = require('../services/user/RoleService');
const PreferenceService = require('../services/user/PreferenceService');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
};

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Authentication routes with stricter rate limiting
router.post('/register', authLimiter, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('user', req.body);
        const { user, session } = await UserService.createUser(validatedData, req);
        
        res.cookie('exapis_session', session.session_token, COOKIE_OPTIONS);
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
        
        res.cookie('exapis_session', session.session_token, COOKIE_OPTIONS);
        res.json({
            user: {
                id: user.id,
                name: user.username,
                email: user.email
            },            
        });
    } catch (error) {
        if (error.name === 'AuthenticationError') {
            return res.status(401).json({
                status: 'fail',
                message: 'Authentication failed',
            });
        }
        next(error);
    }
});

router.get('/verifyToken', auth.isAuthenticated, (req, res) => {
    res.json({ status: 'success', user: req.user});
});

router.post('/signout', auth.isAuthenticated, async (req, res) => {
    try {
        const token = (req.cookies.exapis_session || '').trim();
        if (!token) {
            return res.status(400).json({ error: 'No session token provided' });
        }
        LoggingService.logDebug('User signing out', { token });
        await UserService.logoutUser(token);
        res.clearCookie('exapis_session');
        res.json({ message: 'Sign out successful' });
    } catch (error) {
        LoggingService.logError(error, { context: 'Sign out operation' });
        res.status(500).json({ error: error.message });
    }
});

// User profile routes
router.get('/profile', auth.isAuthenticated, async (req, res) => {
    try {
        const user = await UserService.getUser(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/profile', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('userPreferences', req.body);
        const updated = await UserService.updateUserProfile(req.user.id, validatedData);
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

module.exports = router;
