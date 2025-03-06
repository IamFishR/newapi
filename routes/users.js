const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter, authLimiter } = require('../middleware/rateLimiter');
const UserService = require('../services/user/UserService');
const RoleService = require('../services/user/RoleService');
const PreferenceService = require('../services/user/PreferenceService');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');
const { Notification } = require('../models');
const { Op } = require('sequelize');

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
        
        // Get user preferences after successful authentication
        const preferences = await PreferenceService.getPreferences(user.id);
        
        res.cookie('exapis_session', session.session_token, COOKIE_OPTIONS);
        res.json({
            user: {
                id: user.id,
                name: user.username,
                email: user.email
            },
            preferences           
        });
    } catch (error) {
        if (error.name === 'AuthenticationError') {
            return res.status(401).json({
                status: 'fail',
                message: 'Authentication failed',
            });
        }
        // invalid credentials
        if (error.name === 'InvalidCredentialsError') {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid credentials',
            });
        }
        // handle other errors
        res.status(500).json({
            status: 'error',
            message: error.message
        });
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
        if (error.name === 'ValidationError') {
            const errors = error.message.split(', ').map(err => {
                // Extract field name and specific error type
                const fieldMatch = err.match(/\"([^\"]+)\"/);
                const field = fieldMatch ? fieldMatch[1] : 'unknown';
                
                // Create a user-friendly error message with allowed values if it's an enum error
                let message = err;
                if (field === 'theme' && err.includes('valid')) {
                    message = 'Theme must be either "light" or "dark"';
                } else if (field === 'language' && err.includes('valid')) {
                    message = 'Language must be one of: en, es, fr, de';
                }

                return { field, message };
            });

            return res.status(400).json({
                status: 'fail',
                message: 'Validation Error',
                errors
            });
        }
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

// Notification routes
router.get('/notifications', auth.isAuthenticated, async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: {
                user_id: req.user.id
            },
            order: [['timestamp', 'DESC']]
        });
        
        res.json(notifications);
    } catch (error) {
        LoggingService.logError(error, { context: 'Get user notifications' });
        res.status(500).json({ error: error.message });
    }
});

router.get('/notifications/unread-count', auth.isAuthenticated, async (req, res) => {
    try {
        const count = await Notification.count({
            where: {
                user_id: req.user.id,
                is_read: false
            }
        });
        
        res.json({ unread_count: count });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get unread notification count' });
        res.status(500).json({ error: error.message });
    }
});

router.get('/notifications/:id', auth.isAuthenticated, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: {
                id: req.params.id,
                user_id: req.user.id
            }
        });
        
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        res.json(notification);
    } catch (error) {
        LoggingService.logError(error, { context: 'Get notification by ID' });
        res.status(500).json({ error: error.message });
    }
});

router.put('/notifications/:id/read', auth.isAuthenticated, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: {
                id: req.params.id,
                user_id: req.user.id
            }
        });
        
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        await notification.update({ is_read: true });
        res.json({ status: 'success', message: 'Notification marked as read' });
    } catch (error) {
        LoggingService.logError(error, { context: 'Mark notification as read' });
        res.status(500).json({ error: error.message });
    }
});

router.put('/notifications/read-all', auth.isAuthenticated, async (req, res) => {
    try {
        await Notification.update(
            { is_read: true },
            {
                where: {
                    user_id: req.user.id,
                    is_read: false
                }
            }
        );
        
        res.json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error) {
        LoggingService.logError(error, { context: 'Mark all notifications as read' });
        res.status(500).json({ error: error.message });
    }
});

router.delete('/notifications/:id', auth.isAuthenticated, async (req, res) => {
    try {
        const result = await Notification.destroy({
            where: {
                id: req.params.id,
                user_id: req.user.id
            }
        });
        
        if (result === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        res.json({ status: 'success', message: 'Notification deleted' });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete notification' });
        res.status(500).json({ error: error.message });
    }
});

// Add new notification - admin or system can create notifications for users
router.post('/notifications', auth.isAuthenticated, auth.hasRole(['admin', 'system']), async (req, res) => {
    try {
        const { user_id, message } = req.body;
        
        if (!user_id || !message) {
            return res.status(400).json({ error: 'User ID and message are required' });
        }
        
        const notification = await Notification.create({
            user_id,
            message,
            is_read: false,
            timestamp: new Date()
        });
        
        LoggingService.logDebug('Notification created', { notification, creator: req.user.id });
        res.status(201).json({ status: 'success', notification });
    } catch (error) {
        LoggingService.logError(error, { context: 'Create notification' });
        res.status(500).json({ error: error.message });
    }
});

// Create notification for multiple users at once
router.post('/notifications/bulk', auth.isAuthenticated, auth.hasRole(['admin', 'system']), async (req, res) => {
    try {
        const { user_ids, message } = req.body;
        
        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0 || !message) {
            return res.status(400).json({ error: 'Valid user IDs array and message are required' });
        }
        
        const notifications = await Promise.all(user_ids.map(user_id => {
            return Notification.create({
                user_id,
                message,
                is_read: false,
                timestamp: new Date()
            });
        }));
        
        LoggingService.logDebug('Bulk notifications created', { 
            count: notifications.length, 
            creator: req.user.id 
        });
        
        res.status(201).json({ 
            status: 'success', 
            message: `Created ${notifications.length} notifications`,
            count: notifications.length
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Create bulk notifications' });
        res.status(500).json({ error: error.message });
    }
});

// Create notification for currently authenticated user (self-notification)
router.post('/notifications/self', auth.isAuthenticated, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const notification = await Notification.create({
            user_id: req.user.id,
            message,
            is_read: false,
            timestamp: new Date()
        });
        
        res.status(201).json({ status: 'success', notification });
    } catch (error) {
        LoggingService.logError(error, { context: 'Create self-notification' });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
