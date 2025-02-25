const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const MarketService = require('../services/market/MarketService');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Get latest price data for all symbols
router.get('/price-data', async (req, res, next) => {
    try {
        const priceData = await MarketService.getLatestPriceData();
        res.json({
            status: 'success',
            data: priceData
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get latest price data' });
        next(error);
    }
});

// Get price data for a specific symbol
router.get('/price-data/:symbol', async (req, res, next) => {
    try {
        const priceData = await MarketService.getPriceDataBySymbol(req.params.symbol);
        if (!priceData || priceData.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'Price data not found'
            });
        }
        
        res.json({
            status: 'success',
            data: priceData
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get price data by symbol' });
        next(error);
    }
});

// Get price data for a specific date range
router.get('/price-data/:symbol/range', async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                status: 'fail',
                message: 'Start date and end date are required'
            });
        }
        
        const priceData = await MarketService.getPriceDataByDateRange(
            req.params.symbol,
            new Date(startDate),
            new Date(endDate)
        );
        
        res.json({
            status: 'success',
            data: priceData
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get price data by date range' });
        next(error);
    }
});

// Get historical price data for charting
router.get('/historical-prices/:symbol', async (req, res, next) => {
    try {
        const { marketType, limit } = req.query;
        const historicalPrices = await MarketService.getHistoricalPrices(
            req.params.symbol,
            marketType,
            limit ? parseInt(limit) : undefined
        );
        
        res.json({
            status: 'success',
            data: historicalPrices
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get historical prices' });
        next(error);
    }
});

// Get price limits for a specific symbol
router.get('/price-limits/:symbol', async (req, res, next) => {
    try {
        const priceLimits = await MarketService.getPriceLimits(req.params.symbol);
        if (!priceLimits) {
            return res.status(404).json({
                status: 'fail',
                message: 'Price limits not found'
            });
        }
        
        res.json({
            status: 'success',
            data: priceLimits
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get price limits' });
        next(error);
    }
});

// Get market depth data
router.get('/market-depth/:symbol', async (req, res, next) => {
    try {
        const marketDepth = await MarketService.getMarketDepth(req.params.symbol);
        
        res.json({
            status: 'success',
            data: marketDepth
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get market depth' });
        next(error);
    }
});

// Get historical extremes
router.get('/historical-extremes/:symbol', async (req, res, next) => {
    try {
        const historicalExtremes = await MarketService.getHistoricalExtremes(req.params.symbol);
        
        res.json({
            status: 'success',
            data: historicalExtremes
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get historical extremes' });
        next(error);
    }
});

module.exports = router;