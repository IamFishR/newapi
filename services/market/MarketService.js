const { PriceData, MarketDepth, Company } = require('../../models');
const { Op } = require('sequelize');

class MarketService {
    // Price Data Operations
    async addPriceData(data) {
        return await PriceData.create(data);
    }

    async getLatestPrice(symbol) {
        return await PriceData.findOne({
            where: { symbol },
            order: [['date', 'DESC']]
        });
    }

    async getPriceHistory(symbol, startDate, endDate) {
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

    // Market Depth Operations
    async addMarketDepth(data) {
        return await MarketDepth.create(data);
    }

    async getLatestMarketDepth(symbol) {
        return await MarketDepth.findOne({
            where: { symbol },
            order: [['timestamp', 'DESC']]
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