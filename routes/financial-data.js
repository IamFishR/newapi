const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const FinanceService = require('../services/finance/FinanceService');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Get all financial results
router.get('/results', async (req, res, next) => {
    try {
        const { limit, offset } = req.query;
        const options = {
            limit: limit ? parseInt(limit) : 20,
            offset: offset ? parseInt(offset) : 0
        };
        
        const financialResults = await FinanceService.getAllFinancialResults(options);
        res.json({
            status: 'success',
            data: financialResults
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get all financial results' });
        next(error);
    }
});

// Get financial results by symbol
router.get('/results/:symbol', async (req, res, next) => {
    try {
        const financialResults = await FinanceService.getFinancialResultsBySymbol(req.params.symbol);
        
        res.json({
            status: 'success',
            data: financialResults
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get financial results by symbol' });
        next(error);
    }
});

// Get latest financial result for a symbol
router.get('/results/:symbol/latest', async (req, res, next) => {
    try {
        const latestResult = await FinanceService.getLatestFinancialResult(req.params.symbol);
        if (!latestResult) {
            return res.status(404).json({
                status: 'fail',
                message: 'No financial results found for this symbol'
            });
        }
        
        res.json({
            status: 'success',
            data: latestResult
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get latest financial result' });
        next(error);
    }
});

// Get financial results for a specific period
router.get('/results/:symbol/period', async (req, res, next) => {
    try {
        const { fromDate, toDate, isConsolidated } = req.query;
        if (!fromDate || !toDate) {
            return res.status(400).json({
                status: 'fail',
                message: 'From date and to date are required'
            });
        }
        
        const result = await FinanceService.getFinancialResultForPeriod(
            req.params.symbol,
            new Date(fromDate),
            new Date(toDate),
            isConsolidated === 'true'
        );
        
        if (!result) {
            return res.status(404).json({
                status: 'fail',
                message: 'No financial results found for this period'
            });
        }
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get financial results for period' });
        next(error);
    }
});

// Get audited financial results
router.get('/results/audited', async (req, res, next) => {
    try {
        const auditedResults = await FinanceService.getAuditedFinancialResults();
        
        res.json({
            status: 'success',
            data: auditedResults
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get audited financial results' });
        next(error);
    }
});

// Add a new financial result (admin only)
router.post('/results', auth.isAuthenticated, auth.hasRole('admin'), async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('financialResult', req.body);
        const result = await FinanceService.createFinancialResult(validatedData);
        
        res.status(201).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation Error',
                errors: error.details || error.errors
            });
        }
        LoggingService.logError(error, { context: 'Create financial result' });
        next(error);
    }
});

// Update a financial result (admin only)
router.put('/results/:id', auth.isAuthenticated, auth.hasRole('admin'), async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('financialResultUpdate', req.body);
        const result = await FinanceService.updateFinancialResult(req.params.id, validatedData);
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation Error',
                errors: error.details || error.errors
            });
        }
        LoggingService.logError(error, { context: 'Update financial result' });
        next(error);
    }
});

// Delete a financial result (admin only)
router.delete('/results/:id', auth.isAuthenticated, auth.hasRole('admin'), async (req, res, next) => {
    try {
        await FinanceService.deleteFinancialResult(req.params.id);
        
        res.json({
            status: 'success',
            message: 'Financial result deleted successfully'
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete financial result' });
        next(error);
    }
});

module.exports = router;