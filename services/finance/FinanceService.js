const { FinancialResult, Company } = require('../../models');
const { Op } = require('sequelize');

class FinanceService {
    // Create
    async addFinancialResult(data) {
        return await FinancialResult.create(data);
    }

    // Read
    async getFinancialResult(symbol, toDate, isConsolidated) {
        return await FinancialResult.findOne({
            where: { symbol, to_date: toDate, is_consolidated: isConsolidated }
        });
    }

    async getFinancialResults(symbol, limit = 4, isConsolidated = true) {
        return await FinancialResult.findAll({
            where: { symbol, is_consolidated: isConsolidated },
            order: [['to_date', 'DESC']],
            limit
        });
    }

    // Update
    async updateFinancialResult(symbol, toDate, isConsolidated, data) {
        const result = await this.getFinancialResult(symbol, toDate, isConsolidated);
        if (!result) throw new Error('Financial result not found');
        return await result.update(data);
    }

    // Delete
    async deleteFinancialResult(symbol, toDate, isConsolidated) {
        const result = await this.getFinancialResult(symbol, toDate, isConsolidated);
        if (!result) throw new Error('Financial result not found');
        return await result.destroy();
    }

    // Analysis
    async getComparativeAnalysis(symbols, toDate) {
        return await FinancialResult.findAll({
            where: {
                symbol: symbols,
                to_date: toDate,
                is_consolidated: true
            },
            attributes: [
                'symbol',
                'income',
                'profit_after_tax',
                'eps'
            ]
        });
    }

    async getYearOverYearGrowth(symbol) {
        const results = await this.getFinancialResults(symbol, 8); // Last 2 years
        if (results.length < 4) return null;

        const currentYear = results.slice(0, 4);
        const previousYear = results.slice(4, 8);

        const sumProfit = (items) => items.reduce((sum, item) => sum + Number(item.profit_after_tax), 0);
        
        const currentYearProfit = sumProfit(currentYear);
        const previousYearProfit = sumProfit(previousYear);

        return {
            symbol,
            growth: ((currentYearProfit - previousYearProfit) / Math.abs(previousYearProfit)) * 100,
            currentYearProfit,
            previousYearProfit
        };
    }

    async getTopPerformingCompanies(limit = 10) {
        return await FinancialResult.findAll({
            attributes: [
                'symbol',
                'profit_after_tax',
                'eps',
                'to_date'
            ],
            where: {
                to_date: {
                    [Op.gte]: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                }
            },
            order: [['profit_after_tax', 'DESC']],
            limit,
            include: [{
                model: Company,
                attributes: ['company_name', 'sector']
            }]
        });
    }

    async getSectorwisePerformance() {
        return await FinancialResult.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('profit_after_tax')), 'total_profit'],
                [sequelize.fn('AVG', sequelize.col('eps')), 'average_eps']
            ],
            include: [{
                model: Company,
                attributes: ['sector'],
                group: ['sector']
            }],
            group: ['Company.sector']
        });
    }

    // Get all financial results with pagination
    async getAllFinancialResults(options = {}) {
        return await FinancialResult.findAll({
            limit: options.limit || 20,
            offset: options.offset || 0,
            order: [['to_date', 'DESC']]
        });
    }

    // Get financial results for a specific symbol
    async getFinancialResultsBySymbol(symbol) {
        return await FinancialResult.findAll({
            where: { symbol },
            order: [['to_date', 'DESC']]
        });
    }

    // Get the latest financial result for a symbol
    async getLatestFinancialResult(symbol) {
        const results = await FinancialResult.findAll({
            where: { symbol },
            order: [['to_date', 'DESC']],
            limit: 1
        });
        
        return results.length > 0 ? results[0] : null;
    }

    // Get financial result for a specific period
    async getFinancialResultForPeriod(symbol, fromDate, toDate, isConsolidated = false) {
        return await FinancialResult.findOne({
            where: {
                symbol,
                from_date: fromDate,
                to_date: toDate,
                is_consolidated: isConsolidated
            }
        });
    }

    // Get all audited financial results
    async getAuditedFinancialResults() {
        return await FinancialResult.findAll({
            where: { is_audited: true },
            order: [['to_date', 'DESC']]
        });
    }

    // Create a new financial result
    async createFinancialResult(data) {
        return await FinancialResult.create(data);
    }

    // Update a financial result
    async updateFinancialResult(id, data) {
        const result = await this.findFinancialResultById(id);
        if (!result) throw new Error('Financial result not found');
        
        return await result.update(data);
    }

    // Delete a financial result
    async deleteFinancialResult(id) {
        const result = await this.findFinancialResultById(id);
        if (!result) throw new Error('Financial result not found');
        
        return await result.destroy();
    }

    // Helper method to find financial result by ID (composed primary key)
    async findFinancialResultById(id) {
        // Since FinancialResult has a composite primary key, we'll parse the ID
        // Format: symbol_to-date_isConsolidated (e.g., "TCS_2023-03-31_true")
        const [symbol, toDateStr, isConsolidatedStr] = id.split('_');
        
        if (!symbol || !toDateStr) {
            throw new Error('Invalid financial result ID format');
        }
        
        const isConsolidated = isConsolidatedStr === 'true';
        const toDate = new Date(toDateStr);
        
        return await FinancialResult.findOne({
            where: {
                symbol,
                to_date: toDate,
                is_consolidated: isConsolidated
            }
        });
    }
}

module.exports = new FinanceService();