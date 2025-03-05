const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');
const TaxService = require('../services/finance/TaxService');

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Get tax profile
router.get('/tax/profile', auth.isAuthenticated, async (req, res, next) => {
    try {
        const profile = await TaxService.getTaxProfile(req.user.id);
        res.json({ status: 'success', data: profile });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get tax profile' });
        next(error);
    }
});

// Add tax deduction
router.post('/tax/deductions', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('taxDeduction', req.body);
        const deduction = await TaxService.addTaxDeduction(req.user.id, validatedData);
        res.status(201).json({ status: 'success', data: deduction });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add tax deduction' });
        next(error);
    }
});

// Update tax deduction
router.put('/tax/deductions/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('taxDeduction', req.body);
        const deduction = await TaxService.updateTaxDeduction(req.params.id, req.user.id, validatedData);
        res.json({ status: 'success', data: deduction });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update tax deduction' });
        next(error);
    }
});

// Delete tax deduction
router.delete('/tax/deductions/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        await TaxService.deleteTaxDeduction(req.params.id, req.user.id);
        res.json({ status: 'success', message: 'Tax deduction deleted successfully' });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete tax deduction' });
        next(error);
    }
});

// Get tax calendar
router.get('/tax/calendar', auth.isAuthenticated, async (req, res, next) => {
    try {
        const calendar = await TaxService.getTaxCalendar(req.user.id);
        res.json({ status: 'success', data: calendar });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get tax calendar' });
        next(error);
    }
});

module.exports = router;