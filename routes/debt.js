const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');
const DebtService = require('../services/finance/DebtService');

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Get all debt items
router.get('/debts', auth.isAuthenticated, async (req, res, next) => {
    try {
        const debts = await DebtService.getDebtItems(req.user.id);
        res.json({ status: 'success', data: debts });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get debt items' });
        next(error);
    }
});

// Add new debt item
router.post('/debts', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('debtItem', req.body);
        const debt = await DebtService.createDebtItem(req.user.id, validatedData);
        res.status(201).json({ status: 'success', data: debt });
    } catch (error) {
        LoggingService.logError(error, { context: 'Create debt item' });
        next(error);
    }
});

// Update debt item
router.put('/debts/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('debtItem', req.body);
        const debt = await DebtService.updateDebtItem(req.params.id, req.user.id, validatedData);
        res.json({ status: 'success', data: debt });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update debt item' });
        next(error);
    }
});

// Delete debt item
router.delete('/debts/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        await DebtService.deleteDebtItem(req.params.id, req.user.id);
        res.json({ status: 'success', message: 'Debt item deleted successfully' });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete debt item' });
        next(error);
    }
});

// Calculate debt payoff strategy
router.post('/debts/payoff-strategy', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('payoffStrategy', req.body);
        const strategy = await DebtService.calculatePayoffStrategy(req.user.id, validatedData);
        res.json({ status: 'success', data: strategy });
    } catch (error) {
        LoggingService.logError(error, { context: 'Calculate debt payoff strategy' });
        next(error);
    }
});

module.exports = router;