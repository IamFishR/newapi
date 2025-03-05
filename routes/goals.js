const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');
const GoalsService = require('../services/finance/GoalsService');

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Get all financial goals
router.get('/goals', auth.isAuthenticated, async (req, res, next) => {
    try {
        const goals = await GoalsService.getFinancialGoals(req.user.id);
        res.json({ status: 'success', data: goals });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get financial goals' });
        next(error);
    }
});

// Create financial goal
router.post('/goals', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('financialGoal', req.body);
        const goal = await GoalsService.createFinancialGoal(req.user.id, validatedData);
        res.status(201).json({ status: 'success', data: goal });
    } catch (error) {
        LoggingService.logError(error, { context: 'Create financial goal' });
        next(error);
    }
});

// Update financial goal
router.put('/goals/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('financialGoal', req.body);
        const goal = await GoalsService.updateFinancialGoal(req.params.id, req.user.id, validatedData);
        res.json({ status: 'success', data: goal });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update financial goal' });
        next(error);
    }
});

// Delete financial goal
router.delete('/goals/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        await GoalsService.deleteFinancialGoal(req.params.id, req.user.id);
        res.json({ status: 'success', message: 'Financial goal deleted successfully' });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete financial goal' });
        next(error);
    }
});

module.exports = router;