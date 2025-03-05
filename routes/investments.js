const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');
const InvestmentService = require('../services/finance/InvestmentService');

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Get investment portfolio
router.get('/investments', auth.isAuthenticated, async (req, res, next) => {
    try {
        const portfolio = await InvestmentService.getInvestmentPortfolio(req.user.id);
        res.json({ status: 'success', data: portfolio });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get investment portfolio' });
        next(error);
    }
});

// Add investment
router.post('/investments', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('investment', req.body);
        const investment = await InvestmentService.addInvestment(req.user.id, validatedData);
        res.status(201).json({ status: 'success', data: investment });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add investment' });
        next(error);
    }
});

// Update investment
router.put('/investments/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('investment', req.body);
        const investment = await InvestmentService.updateInvestment(req.params.id, req.user.id, validatedData);
        res.json({ status: 'success', data: investment });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update investment' });
        next(error);
    }
});

// Delete investment
router.delete('/investments/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        await InvestmentService.deleteInvestment(req.params.id, req.user.id);
        res.json({ status: 'success', message: 'Investment deleted successfully' });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete investment' });
        next(error);
    }
});

// Get investment analytics
router.get('/investments/analytics', auth.isAuthenticated, async (req, res, next) => {
    try {
        const analytics = await InvestmentService.getInvestmentAnalytics(req.user.id);
        res.json({ status: 'success', data: analytics });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get investment analytics' });
        next(error);
    }
});

module.exports = router;