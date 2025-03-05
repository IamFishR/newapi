const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const BudgetService = require('../services/finance/BudgetService');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Get budget categories
router.get('/categories', auth.isAuthenticated, async (req, res, next) => {
    try {
        const categories = await BudgetService.getBudgetCategories();
        
        res.json({
            status: 'success',
            data: categories
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get budget categories' });
        next(error);
    }
});

// Get budget trends
router.get('/trends', auth.isAuthenticated, async (req, res, next) => {
    try {
        const { range } = req.query;
        if (!range) {
            return res.status(400).json({
                status: 'fail',
                message: 'Time range is required'
            });
        }
        
        const trends = await BudgetService.getBudgetTrends(range, req.user.id);
        
        res.json({
            status: 'success',
            data: trends
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get budget trends' });
        next(error);
    }
});

// Get budget comparison
router.get('/comparison', auth.isAuthenticated, async (req, res, next) => {
    try {
        const comparison = await BudgetService.getBudgetComparison(req.user.id);
        
        res.json({
            status: 'success',
            data: comparison
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get budget comparison' });
        next(error);
    }
});

module.exports = router;