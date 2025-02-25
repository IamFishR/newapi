const { PriceData, HistoricalPrice, PriceLimit, MarketDepth, HistoricalExtreme, Company } = require('../../models');
const { Op } = require('sequelize');

class MarketService {
    // Price Data methods
    async getLatestPriceData(limit = 100) {
        return await PriceData.findAll({
            order: [['date', 'DESC']],
            limit
        });
    }

    async getPriceDataBySymbol(symbol) {
        return await PriceData.findAll({
            where: { symbol },
            order: [['date', 'DESC']]
        });
    }

    async getPriceDataByDateRange(symbol, startDate, endDate) {
        return await PriceData.findAll({
            where: { 
                symbol,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['date', 'ASC']]
        });
    }

    // Historical Prices methods
    async getHistoricalPrices(symbol, marketType = null, limit = 1000) {
        const whereClause = { symbol };
        
        if (marketType) {
            whereClause.market_type = marketType;
        }
        
        return await HistoricalPrice.findAll({
            where: whereClause,
            order: [['timestamp', 'DESC']],
            limit
        });
    }

    // Price Limits methods
    async getPriceLimits(symbol) {
        return await PriceLimit.findAll({
            where: { symbol },
            order: [['date', 'DESC']]
        });
    }

    // Market Depth methods
    async getMarketDepth(symbol) {
        // Get the latest market depth data for the symbol
        const latestMarketDepth = await MarketDepth.findAll({
            where: { symbol },
            order: [['date', 'DESC'], ['timestamp', 'DESC']],
            limit: 1
        });
        
        if (latestMarketDepth.length === 0) {
            return null;
        }
        
        // Fetch corresponding bid/ask data if needed
        // This would require additional model definitions for bid_ask table
        
        return latestMarketDepth[0];
    }

    // Historical Extremes methods
    async getHistoricalExtremes(symbol) {
        return await HistoricalExtreme.findAll({
            where: { symbol },
            order: [['date', 'DESC']]
        });
    }

    // Market Analysis
    async getTopGainers(limit = 10) {
        const today = new Date();
        return await PriceData.findAll({
            where: {
                date: today
            },
            attributes: [
                'symbol',
                'last_price',
                'previous_close',
                [sequelize.literal('((last_price - previous_close) / previous_close * 100)'), 'change_percent']
            ],
            order: [[sequelize.literal('change_percent'), 'DESC']],
            limit,
            include: [{
                model: Company,
                attributes: ['company_name']
            }]
        });
    }

    async getTopLosers(limit = 10) {
        const today = new Date();
        return await PriceData.findAll({
            where: {
                date: today
            },
            attributes: [
                'symbol',
                'last_price',
                'previous_close',
                [sequelize.literal('((last_price - previous_close) / previous_close * 100)'), 'change_percent']
            ],
            order: [[sequelize.literal('change_percent'), 'ASC']],
            limit,
            include: [{
                model: Company,
                attributes: ['company_name']
            }]
        });
    }

    async getMostActiveByVolume(limit = 10) {
        const today = new Date();
        return await PriceData.findAll({
            where: {
                date: today
            },
            order: [['volume', 'DESC']],
            limit,
            include: [{
                model: Company,
                attributes: ['company_name']
            }]
        });
    }

    async getMostActiveByValue(limit = 10) {
        const today = new Date();
        return await PriceData.findAll({
            where: {
                date: today
            },
            order: [['traded_value', 'DESC']],
            limit,
            include: [{
                model: Company,
                attributes: ['company_name']
            }]
        });
    }
}

module.exports = new MarketService();