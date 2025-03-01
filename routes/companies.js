const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const CompanyService = require('../services/stock/CompanyService');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');
const FinanceService = require('../services/finance/FinanceService');
const MarketService = require('../services/market/MarketService');

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Get all companies
router.get('/', auth.isAuthenticated, async (req, res, next) => {
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

// Sector Hierarchy Routes
router.get('/macro-sectors', auth.isAuthenticated, async (req, res, next) => {
    try {
        const sectors = await CompanyService.getMacroEconomicSectors();
        res.json({
            status: 'success',
            data: sectors
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get macro economic sectors' });
        next(error);
    }
});

router.get('/macro-sectors/:mesCode/sectors', auth.isAuthenticated, async (req, res, next) => {
    try {
        const sectors = await CompanyService.getSectorsByMacroEconomicSector(req.params.mesCode);
        res.json({
            status: 'success',
            data: sectors
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get sectors by macro sector' });
        next(error);
    }
});

router.get('/sectors/:sectCode/industries', auth.isAuthenticated, async (req, res, next) => {
    try {
        const industries = await CompanyService.getIndustriesBySector(req.params.sectCode);
        res.json({
            status: 'success',
            data: industries
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get industries by sector' });
        next(error);
    }
});

router.get('/industries/:indCode/basic-industries', auth.isAuthenticated, async (req, res, next) => {
    try {
        const basicIndustries = await CompanyService.getBasicIndustriesByIndustry(req.params.indCode);
        res.json({
            status: 'success',
            data: basicIndustries
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get basic industries by industry' });
        next(error);
    }
});

// Get all sectors
router.get('/sectors', auth.isAuthenticated, async (req, res, next) => {
    try {
        const sectors = await CompanyService.getAllSectors();
        res.json({
            status: 'success',
            data: sectors
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get all sectors' });
        next(error);
    }
});

// Get sector performance
router.get('/sectors/performance', auth.isAuthenticated, async (req, res, next) => {
    try {
        const performance = await FinanceService.getSectorwisePerformance();
        res.json({
            status: 'success',
            data: performance
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get sector performance' });
        next(error);
    }
});

// Get companies by sector
router.get('/sectors/:sector', auth.isAuthenticated, async (req, res, next) => {
    try {
        const companies = await CompanyService.getCompaniesBySector(req.params.sector);
        res.json({
            status: 'success',
            data: companies
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get companies by sector' });
        next(error);
    }
});

// Get companies by industry
router.get('/industry/:industry', auth.isAuthenticated, async (req, res, next) => {
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

// Create a new company (admin/system only)
router.post('/', auth.isAuthenticated, auth.hasRole(['admin', 'system']), async (req, res, next) => {
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

// Get company by symbol
router.get('/:symbol', auth.isAuthenticated, async (req, res, next) => {
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

// Get company with sector hierarchy
router.get('/:symbol/sector-hierarchy', auth.isAuthenticated, async (req, res, next) => {
    try {
        const company = await CompanyService.getCompanyWithSectorHierarchy(req.params.symbol);
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
        LoggingService.logError(error, { context: 'Get company sector hierarchy' });
        next(error);
    }
});

// Update a company (admin/system only)
router.put('/:symbol', auth.isAuthenticated, auth.hasRole(['admin', 'system']), async (req, res, next) => {
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

// Delete a company (admin/system only)
router.delete('/:symbol', auth.isAuthenticated, auth.hasRole(['admin', 'system']), async (req, res, next) => {
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

// Get company with latest price data
router.get('/:symbol/with-price', auth.isAuthenticated, async (req, res, next) => {
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
router.get('/:symbol/financials', auth.isAuthenticated, async (req, res, next) => {
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
router.get('/:symbol/indices', auth.isAuthenticated, async (req, res, next) => {
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
router.get('/:symbol/corporate-actions', auth.isAuthenticated, async (req, res, next) => {
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
router.get('/:symbol/board-meetings', auth.isAuthenticated, async (req, res, next) => {
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
router.get('/:symbol/shareholding-patterns', auth.isAuthenticated, async (req, res, next) => {
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
router.get('/:symbol/security-info', auth.isAuthenticated, async (req, res, next) => {
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
router.get('/:symbol/risk-metrics', auth.isAuthenticated, async (req, res, next) => {
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
router.get('/:symbol/delivery-positions', auth.isAuthenticated, async (req, res, next) => {
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

// Get comprehensive stock data
router.get('/:symbol/comprehensive', auth.isAuthenticated, async (req, res, next) => {
    try {
        const data = await CompanyService.getComprehensiveData(req.params.symbol);
        if (!data) {
            return res.status(404).json({
                status: 'fail',
                message: 'Company not found'
            });
        }
        res.json({
            status: 'success',
            data: data
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get comprehensive stock data' });
        next(error);
    }
});

module.exports = router;