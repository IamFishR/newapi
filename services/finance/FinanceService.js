const { 
    FinancialProfile, 
    BudgetCategory, 
    Transaction,
    User,
    FinancialResult, 
    Company 
} = require('../../models');
const ValidationError = require('../../utils/ValidationError');
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
                attributes: ['company_name']
            }]
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

    async getUserFinancialProfile(userId) {
        const profile = await FinancialProfile.findOne({
            where: { userId },
            include: [{
                model: User,
                attributes: ['id', 'email', 'name']
            }]
        });

        if (!profile) {
            return await FinancialProfile.create({ userId });
        }

        return profile;
    }

    async updateUserFinancialProfile(userId, data) {
        const [profile] = await FinancialProfile.upsert({
            userId,
            ...data,
            lastUpdated: new Date()
        });

        return profile;
    }

    async getBudgetCategories(userId) {
        return await BudgetCategory.findAll({
            where: { userId },
            order: [['name', 'ASC']]
        });
    }

    async createBudgetCategory(userId, data) {
        const existing = await BudgetCategory.findOne({
            where: {
                userId,
                name: data.name
            }
        });

        if (existing) {
            throw new ValidationError('A category with this name already exists');
        }

        return await BudgetCategory.create({
            userId,
            ...data
        });
    }

    async updateBudgetCategory(id, userId, data) {
        const category = await BudgetCategory.findOne({
            where: { id, userId }
        });

        if (!category) {
            throw new ValidationError('Budget category not found');
        }

        if (data.name && data.name !== category.name) {
            const existing = await BudgetCategory.findOne({
                where: {
                    userId,
                    name: data.name,
                    id: { [Op.ne]: id }
                }
            });

            if (existing) {
                throw new ValidationError('A category with this name already exists');
            }
        }

        await category.update(data);
        return category;
    }

    async deleteBudgetCategory(id, userId) {
        const category = await BudgetCategory.findOne({
            where: { id, userId }
        });

        if (!category) {
            throw new ValidationError('Budget category not found');
        }

        if (category.isDefault) {
            throw new ValidationError('Cannot delete default budget categories');
        }

        await category.destroy();
    }

    async getTransactions(userId, options) {
        const { startDate, endDate, category, type, limit = 20, offset = 0 } = options;
        const where = { userId };

        if (startDate) where.date = { [Op.gte]: new Date(startDate) };
        if (endDate) where.date = { ...where.date, [Op.lte]: new Date(endDate) };
        if (category) where.categoryId = category;
        if (type) where.type = type;

        return await Transaction.findAndCountAll({
            where,
            include: [{
                model: BudgetCategory,
                as: 'category',
                attributes: ['id', 'name', 'color']
            }],
            order: [['date', 'DESC']],
            limit,
            offset
        });
    }

    async createTransaction(userId, data) {
        if (data.categoryId) {
            const category = await BudgetCategory.findOne({
                where: { id: data.categoryId, userId }
            });

            if (!category) {
                throw new ValidationError('Invalid budget category');
            }
        }

        return await Transaction.create({
            userId,
            ...data
        });
    }

    async calculateBudgetMetrics(userId) {
        const transactions = await Transaction.findAll({
            where: {
                userId,
                date: {
                    [Op.gte]: new Date(new Date().setDate(1)) // First day of current month
                }
            },
            include: [{
                model: BudgetCategory,
                as: 'category'
            }]
        });

        const categories = await this.getBudgetCategories(userId);
        const metrics = {};

        for (const category of categories) {
            const categoryTransactions = transactions.filter(t => t.categoryId === category.id);
            metrics[category.id] = {
                budgeted: category.budgetedAmount,
                spent: categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
                remaining: category.budgetedAmount - categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
            };
        }

        return metrics;
    }
}

module.exports = new FinanceService();