const { 
    FinancialProfile, 
    BudgetCategory, 
    Transaction,
    User,
    FinancialResult, 
    Company 
} = require('../../models/finance');
const ValidationError = require('../../utils/ValidationError');
const { Op } = require('sequelize');
const FinanceErrorHandler = require('./FinanceErrorHandler');

class FinanceService {
    async setupFinancialProfile(userId, data) {
        try {
            // Create or update financial profile with all the initial data
            const [profile] = await FinancialProfile.upsert({
                user_id: userId,
                monthly_income: data.monthlyIncome,
                monthly_savings_goal: data.monthlySavingsGoal,
                current_savings: data.currentSavings,
                monthly_expenses: {
                    housing: data.monthlyExpenses.housing || 0,
                    utilities: data.monthlyExpenses.utilities || 0,
                    transportation: data.monthlyExpenses.transportation || 0,
                    groceries: data.monthlyExpenses.groceries || 0,
                    healthcare: data.monthlyExpenses.healthcare || 0,
                    entertainment: data.monthlyExpenses.entertainment || 0,
                    other: data.monthlyExpenses.other || 0
                },
                investment_profile: {
                    current_investments: data.investmentProfile.currentInvestments || 0,
                    monthly_investment_goal: data.investmentProfile.monthlyInvestmentGoal || 0,
                    risk_tolerance: data.investmentProfile.riskTolerance || 'medium'
                },
                last_updated: new Date()
            });

            // Calculate and store initial metrics
            const metrics = {
                totalMonthlyExpenses: Object.values(data.monthlyExpenses).reduce((sum, val) => sum + (val || 0), 0),
                disposableIncome: data.monthlyIncome - Object.values(data.monthlyExpenses).reduce((sum, val) => sum + (val || 0), 0),
                debtToIncomeRatio: data.debtProfile ? (data.debtProfile.monthlyDebtPayments / data.monthlyIncome) * 100 : 0,
                netWorth: (
                    Object.values(data.assets || {}).reduce((sum, val) => sum + (val || 0), 0) -
                    Object.values(data.liabilities || {}).reduce((sum, val) => sum + (val || 0), 0)
                )
            };

            return {
                profile,
                metrics
            };
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'setup_financial_profile');
        }
    }

    // Base CRUD operations for financial results
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

    async createFinancialResult(data) {
        try {
            return await FinancialResult.create(data);
        } catch (error) {
            FinanceErrorHandler.handleTransactionError(error, 'create_financial_result');
        }
    }

    async updateFinancialResult(id, data) {
        try {
            const result = await this.findFinancialResultById(id);
            if (!result) throw new ValidationError('Financial result not found');
            return await result.update(data);
        } catch (error) {
            FinanceErrorHandler.handleTransactionError(error, 'update_financial_result');
        }
    }

    async deleteFinancialResult(id) {
        try {
            const result = await this.findFinancialResultById(id);
            if (!result) throw new ValidationError('Financial result not found');
            return await result.destroy();
        } catch (error) {
            FinanceErrorHandler.handleTransactionError(error, 'delete_financial_result');
        }
    }

    // Helper method for composite key handling
    async findFinancialResultById(id) {
        const [symbol, toDateStr, isConsolidatedStr] = id.split('_');
        if (!symbol || !toDateStr) {
            throw new ValidationError('Invalid financial result ID format');
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

    // Analysis methods
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

    // Financial profile management
    async getUserFinancialProfile(userId) {
        const profile = await FinancialProfile.findOne({
            where: { user_id: userId },
            include: [{
                model: User,
                attributes: ['id', 'email', 'name']
            }]
        });

        if (!profile) {
            return await FinancialProfile.create({ user_id: userId });
        }

        return profile;
    }

    async updateUserFinancialProfile(userId, data) {
        const [profile] = await FinancialProfile.upsert({
            user_id: userId,
            ...data,
            last_updated: new Date()
        });

        return profile;
    }

    async getFinancialProfile(userId) {
        return await FinancialProfile.findOne({
            where: { user_id: userId }
        });
    }

    // Budget category management
    async getBudgetCategories(userId) {
        try {
            return await BudgetCategory.findAll({
                where: { user_id: userId },
                order: [['name', 'ASC']]
            });
        } catch (error) {
            console.error('Error fetching budget categories:', error);
            throw new Error('Failed to fetch budget categories');
        }
    }

    async createBudgetCategory(userId, data) {
        try {
            const existing = await BudgetCategory.findOne({
                where: {
                    user_id: userId,
                    name: data.name
                }
            });

            if (existing) {
                throw new ValidationError('A category with this name already exists');
            }

            return await BudgetCategory.create({
                user_id: userId,
                ...data
            });
        } catch (error) {
            console.error('Error creating budget category:', error);
            throw new Error('Failed to create budget category');
        }
    }

    async updateBudgetCategory(id, userId, data) {
        const category = await BudgetCategory.findOne({
            where: { id, user_id: userId }
        });

        if (!category) {
            throw new ValidationError('Budget category not found');
        }

        if (data.name && data.name !== category.name) {
            const existing = await BudgetCategory.findOne({
                where: {
                    user_id: userId,
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
            where: { id, user_id: userId }
        });

        if (!category) {
            throw new ValidationError('Budget category not found');
        }

        if (category.is_default) {
            throw new ValidationError('Cannot delete default budget categories');
        }

        await category.destroy();
    }

    // Transaction management
    async getTransactions(userId, options) {
        const { startDate, endDate, category, type, limit = 20, offset = 0 } = options;
        const where = { user_id: userId };

        if (startDate) where.date = { [Op.gte]: new Date(startDate) };
        if (endDate) where.date = { ...where.date, [Op.lte]: new Date(endDate) };
        if (category) where.category_id = category;
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
        if (data.category_id) {
            const category = await BudgetCategory.findOne({
                where: { id: data.category_id, user_id: userId }
            });

            if (!category) {
                throw new ValidationError('Invalid budget category');
            }
        }

        return await Transaction.create({
            user_id: userId,
            ...data
        });
    }

    // Budget analytics
    async calculateBudgetMetrics(userId) {
        const transactions = await Transaction.findAll({
            where: {
                user_id: userId,
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
            const categoryTransactions = transactions.filter(t => t.category_id === category.id);
            metrics[category.id] = {
                budgeted: category.budgeted_amount,
                spent: categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
                remaining: category.budgeted_amount - categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
            };
        }

        return metrics;
    }

    async getBudgetTrends(userId, range) {
        try {
            // Convert range to date
            const endDate = new Date();
            const startDate = this.calculateStartDate(range);

            // Fetch transactions within the date range
            const transactions = await Transaction.findAll({
                where: {
                    user_id: userId,
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                include: [
                    {
                        model: BudgetCategory,
                        as: 'category',
                        attributes: ['id', 'name', 'color']
                    }
                ],
                order: [['date', 'ASC']]
            });

            // Group transactions by month and category
            const monthlyData = this.groupTransactionsByMonth(transactions);

            // Calculate trendline data
            const trendData = this.calculateTrendData(transactions, startDate, endDate);

            return {
                monthly: monthlyData,
                trend: trendData
            };
        } catch (error) {
            console.error('Error fetching budget trends:', error);
            throw new Error('Failed to fetch budget trends data');
        }
    }

    async getBudgetComparison(userId, startDate, endDate) {
        try {
            // Fetch all categories
            const categories = await BudgetCategory.findAll({
                where: { user_id: userId }
            });

            // Fetch transactions for the specified period
            const transactions = await Transaction.findAll({
                where: {
                    user_id: userId,
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                include: [
                    {
                        model: BudgetCategory,
                        as: 'category'
                    }
                ]
            });

            // Calculate comparison data
            const comparisonData = this.calculateComparisonData(categories, transactions);

            return comparisonData;
        } catch (error) {
            console.error('Error fetching budget comparison:', error);
            throw new Error('Failed to fetch budget comparison data');
        }
    }

    // Utility methods
    calculateStartDate(range) {
        const now = new Date();
        switch (range) {
            case '1M':
                return new Date(now.setMonth(now.getMonth() - 1));
            case '3M':
                return new Date(now.setMonth(now.getMonth() - 3));
            case '6M':
                return new Date(now.setMonth(now.getMonth() - 6));
            case '1Y':
                return new Date(now.setFullYear(now.getFullYear() - 1));
            default:
                return new Date(now.setMonth(now.getMonth() - 1)); // Default to 1M
        }
    }

    groupTransactionsByMonth(transactions) {
        const monthlyData = {};

        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {};
            }

            const categoryId = transaction.category?.id || 'uncategorized';
            const categoryName = transaction.category?.name || 'Uncategorized';

            if (!monthlyData[monthKey][categoryId]) {
                monthlyData[monthKey][categoryId] = {
                    name: categoryName,
                    color: transaction.category?.color || '#CCCCCC',
                    total: 0
                };
            }

            monthlyData[monthKey][categoryId].total += transaction.amount;
        });

        return monthlyData;
    }

    calculateTrendData(transactions, startDate, endDate) {
        const incomeByDay = {};
        const expensesByDay = {};

        // Initialize data points for each day in range
        const dayMillis = 24 * 60 * 60 * 1000;
        for (let d = new Date(startDate); d <= endDate; d = new Date(d.getTime() + dayMillis)) {
            const dateKey = d.toISOString().split('T')[0];
            incomeByDay[dateKey] = 0;
            expensesByDay[dateKey] = 0;
        }

        // Populate with actual data
        transactions.forEach(transaction => {
            const dateKey = new Date(transaction.date).toISOString().split('T')[0];
            if (transaction.type === 'income') {
                incomeByDay[dateKey] = (incomeByDay[dateKey] || 0) + transaction.amount;
            } else {
                expensesByDay[dateKey] = (expensesByDay[dateKey] || 0) + transaction.amount;
            }
        });

        // Convert to arrays for charting
        const income = Object.keys(incomeByDay).map(date => ({
            date,
            amount: incomeByDay[date]
        }));

        const expenses = Object.keys(expensesByDay).map(date => ({
            date,
            amount: expensesByDay[date]
        }));

        return { income, expenses };
    }

    calculateComparisonData(categories, transactions) {
        const comparisonData = {};

        categories.forEach(category => {
            const categoryTransactions = transactions.filter(t => t.category_id === category.id);
            const totalSpent = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

            comparisonData[category.id] = {
                name: category.name,
                budgeted: category.budgeted_amount,
                spent: totalSpent,
                remaining: category.budgeted_amount - totalSpent
            };
        });

        return comparisonData;
    }
}

module.exports = new FinanceService();