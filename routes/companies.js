const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const CompanyService = require('../services/stock/CompanyService');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Get all companies
router.get('/', async (req, res, next) => {
    try {
        const companies = await CompanyService.getAllCompanies();
        res.json({
            status: 'success',
            data: companies
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get all companies' });
        next(error);
    }
});

// Get company by symbol
router.get('/:symbol', async (req, res, next) => {
    try {
        const company = await CompanyService.getCompanyBySymbol(req.params.symbol);
        if (!company) {
            return res.status(404).json({
                status: 'fail',
                message: 'Company not found'
            });
        }
        
        res.json({
            status: 'success',
            data: company
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get company by symbol' });
        next(error);
    }
});

// Create a new company (admin only)
router.post('/', auth.isAuthenticated, auth.hasRole('admin'), async (req, res, next) => {
    try {
        // Assuming you'll create a validation schema for company
        const validatedData = await ValidationService.validate('company', req.body);
        const company = await CompanyService.createCompany(validatedData);
        
        res.status(201).json({
            status: 'success',
            data: company
        });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation Error',
                errors: error.details || error.errors
            });
        }
        LoggingService.logError(error, { context: 'Create company' });
        next(error);
    }
});

// Update a company (admin only)
router.put('/:symbol', auth.isAuthenticated, auth.hasRole('admin'), async (req, res, next) => {
    try {
        // Assuming you'll create a validation schema for company updates
        const validatedData = await ValidationService.validate('companyUpdate', req.body);
        const company = await CompanyService.updateCompany(req.params.symbol, validatedData);
        
        res.json({
            status: 'success',
            data: company
        });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation Error',
                errors: error.details || error.errors
            });
        }
        LoggingService.logError(error, { context: 'Update company' });
        next(error);
    }
});

// Delete a company (admin only)
router.delete('/:symbol', auth.isAuthenticated, auth.hasRole('admin'), async (req, res, next) => {
    try {
        await CompanyService.deleteCompany(req.params.symbol);
        
        res.json({
            status: 'success',
            message: 'Company deleted successfully'
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete company' });
        next(error);
    }
});

// Get companies by industry
router.get('/industry/:industry', async (req, res, next) => {
    try {
        const companies = await CompanyService.getCompaniesByIndustry(req.params.industry);
        
        res.json({
            status: 'success',
            data: companies
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get companies by industry' });
        next(error);
    }
});

// Get company with latest price data
router.get('/:symbol/with-price', async (req, res, next) => {
    try {
        const company = await CompanyService.getCompanyWithLatestPrice(req.params.symbol);
        if (!company) {
            return res.status(404).json({
                status: 'fail',
                message: 'Company not found'
            });
        }
        
        res.json({
            status: 'success',
            data: company
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get company with price' });
        next(error);
    }
});

// Get company with financial results
router.get('/:symbol/financials', async (req, res, next) => {
    try {
        const company = await CompanyService.getCompanyWithFinancials(req.params.symbol);
        if (!company) {
            return res.status(404).json({
                status: 'fail',
                message: 'Company not found'
            });
        }
        
        res.json({
            status: 'success',
            data: company
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get company financials' });
        next(error);
    }
});

// Get company indices
router.get('/:symbol/indices', async (req, res, next) => {
    try {
        const indices = await CompanyService.getCompanyIndices(req.params.symbol);
        if (!indices) {
            return res.status(404).json({
                status: 'fail',
                message: 'Company indices not found'
            });
        }
        
        res.json({
            status: 'success',
            data: indices
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get company indices' });
        next(error);
    }
});

// Get corporate actions for a company
router.get('/:symbol/corporate-actions', async (req, res, next) => {
    try {
        const corporateActions = await CompanyService.getCorporateActions(req.params.symbol);
        
        res.json({
            status: 'success',
            data: corporateActions
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get corporate actions' });
        next(error);
    }
});

// Get board meetings for a company
router.get('/:symbol/board-meetings', async (req, res, next) => {
    try {
        const boardMeetings = await CompanyService.getBoardMeetings(req.params.symbol);
        
        res.json({
            status: 'success',
            data: boardMeetings
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get board meetings' });
        next(error);
    }
});

// Get shareholding patterns for a company
router.get('/:symbol/shareholding-patterns', async (req, res, next) => {
    try {
        const shareholdingPatterns = await CompanyService.getShareholdingPatterns(req.params.symbol);
        
        res.json({
            status: 'success',
            data: shareholdingPatterns
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get shareholding patterns' });
        next(error);
    }
});

// Get security info for a company
router.get('/:symbol/security-info', async (req, res, next) => {
    try {
        const securityInfo = await CompanyService.getSecurityInfo(req.params.symbol);
        if (!securityInfo) {
            return res.status(404).json({
                status: 'fail',
                message: 'Security info not found'
            });
        }
        
        res.json({
            status: 'success',
            data: securityInfo
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get security info' });
        next(error);
    }
});

// Get risk metrics for a company
router.get('/:symbol/risk-metrics', async (req, res, next) => {
    try {
        const riskMetrics = await CompanyService.getRiskMetrics(req.params.symbol);
        
        res.json({
            status: 'success',
            data: riskMetrics
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get risk metrics' });
        next(error);
    }
});

// Get delivery positions for a company
router.get('/:symbol/delivery-positions', async (req, res, next) => {
    try {
        const deliveryPositions = await CompanyService.getDeliveryPositions(req.params.symbol);
        
        res.json({
            status: 'success',
            data: deliveryPositions
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get delivery positions' });
        next(error);
    }
});

module.exports = router;