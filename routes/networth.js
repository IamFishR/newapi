const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');
const NetWorthService = require('../services/finance/NetWorthService');

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Get net worth history
router.get('/net-worth', auth.isAuthenticated, async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const netWorth = await NetWorthService.getNetWorthHistory(
            req.user.id,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );
        res.json({ status: 'success', data: netWorth });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get net worth history' });
        next(error);
    }
});

// Add asset
router.post('/assets', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('asset', req.body);
        const asset = await NetWorthService.addAsset(req.user.id, validatedData);
        res.status(201).json({ status: 'success', data: asset });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add asset' });
        next(error);
    }
});

// Update asset
router.put('/assets/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('asset', req.body);
        const asset = await NetWorthService.updateAsset(req.params.id, req.user.id, validatedData);
        res.json({ status: 'success', data: asset });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update asset' });
        next(error);
    }
});

// Delete asset
router.delete('/assets/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        await NetWorthService.deleteAsset(req.params.id, req.user.id);
        res.json({ status: 'success', message: 'Asset deleted successfully' });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete asset' });
        next(error);
    }
});

// Add liability
router.post('/liabilities', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('liability', req.body);
        const liability = await NetWorthService.addLiability(req.user.id, validatedData);
        res.status(201).json({ status: 'success', data: liability });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add liability' });
        next(error);
    }
});

// Update liability
router.put('/liabilities/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('liability', req.body);
        const liability = await NetWorthService.updateLiability(req.params.id, req.user.id, validatedData);
        res.json({ status: 'success', data: liability });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update liability' });
        next(error);
    }
});

// Delete liability
router.delete('/liabilities/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        await NetWorthService.deleteLiability(req.params.id, req.user.id);
        res.json({ status: 'success', message: 'Liability deleted successfully' });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete liability' });
        next(error);
    }
});

module.exports = router;