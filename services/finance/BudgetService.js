const { BudgetCategory, Transaction } = require('../../models');
const ValidationError = require('../../utils/ValidationError');
const { Op } = require('sequelize');
const FinanceErrorHandler = require('./FinanceErrorHandler');
const TransactionService = require('./TransactionService');

class BudgetService {
    async getBudgetCategories(userId) {
        try {
            return await BudgetCategory.findAll({
                where: { user_id: userId },
                order: [['name', 'ASC']]
            });
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'budget_get_categories');
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
            FinanceErrorHandler.handleFinancialOperationError(error, 'budget_create_category');
        }
    }

    async updateBudgetCategory(id, userId, data) {
        try {
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
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'budget_update_category');
        }
    }

    async deleteBudgetCategory(id, userId) {
        try {
            const category = await BudgetCategory.findOne({
                where: { id, user_id: userId }
            });

            if (!category) {
                throw new ValidationError('Budget category not found');
            }

            if (category.isDefault) {
                throw new ValidationError('Cannot delete default budget categories');
            }

            await category.destroy();
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'budget_delete_category');
        }
    }

    async calculateBudgetMetrics(userId) {
        try {
            const transactions = await TransactionService.getTransactionsByDateRange(
                userId,
                new Date(new Date().setDate(1)), // First day of current month
                new Date()
            );

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
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'budget_calculate_metrics');
        }
    }

    async getBudgetTrends(userId, range) {
        try {
            const endDate = new Date();
            const startDate = this.calculateStartDate(range);

            const transactions = await Transaction.findAll({
                where: {
                    user_id: userId,
                    date: {
                        [Op.between]: [startDate, endDate]
                    },
                    type: 'expense'  // Only consider expenses for trends
                },
                include: [{
                    model: BudgetCategory,
                    as: 'category',
                    required: true
                }],
                order: [['date', 'ASC']]
            });

            const monthlyTrends = [];
            let currentDate = new Date(startDate);
            
            while (currentDate <= endDate) {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const monthEnd = new Date(year, month + 1, 0);
                
                const monthTransactions = transactions.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate >= new Date(year, month, 1) && tDate <= monthEnd;
                });

                const totalSpending = monthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
                const essentialSpending = monthTransactions
                    .filter(t => t.category?.is_default)
                    .reduce((sum, t) => sum + Number(t.amount), 0);
                const discretionarySpending = totalSpending - essentialSpending;

                monthlyTrends.push({
                    month: `${year}-${String(month + 1).padStart(2, '0')}`,
                    totalSpending,
                    essentialSpending,
                    discretionarySpending,
                    totalSavings: 0 // Will be calculated if needed
                });

                currentDate.setMonth(currentDate.getMonth() + 1);
            }

            return monthlyTrends;
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'budget_get_trends');
        }
    }

    async getBudgetComparison(userId, startDate, endDate) {
        try {
            const categories = await this.getBudgetCategories(userId);
            const transactions = await TransactionService.getTransactionsByDateRange(userId, startDate, endDate);

            return this.calculateComparisonData(categories, transactions);
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'budget_get_comparison');
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

            monthlyData[monthKey][categoryId].total += Number(transaction.amount);
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
                incomeByDay[dateKey] = (incomeByDay[dateKey] || 0) + Number(transaction.amount);
            } else {
                expensesByDay[dateKey] = (expensesByDay[dateKey] || 0) + Number(transaction.amount);
            }
        });

        return {
            income: Object.keys(incomeByDay).map(date => ({
                date,
                amount: incomeByDay[date]
            })),
            expenses: Object.keys(expensesByDay).map(date => ({
                date,
                amount: expensesByDay[date]
            }))
        };
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

module.exports = new BudgetService();