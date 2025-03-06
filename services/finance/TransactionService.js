const { Transaction, BudgetCategory } = require('../../models');
const ValidationError = require('../../utils/ValidationError');
const { Op } = require('sequelize');
const FinanceErrorHandler = require('./FinanceErrorHandler');

class TransactionService {
    async getTransactions(userId, options) {
        try {
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
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'transaction_get_all');
        }
    }

    async createTransaction(userId, data) {
        try {
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
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'transaction_create');
        }
    }

    async getTransactionsByDateRange(userId, startDate, endDate) {
        try {
            return await Transaction.findAll({
                where: {
                    userId,
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                include: [{
                    model: BudgetCategory,
                    as: 'category'
                }],
                order: [['date', 'ASC']]
            });
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'transaction_get_by_date');
        }
    }

    async getTransactionsByCategory(userId, categoryId, startDate, endDate) {
        try {
            return await Transaction.findAll({
                where: {
                    userId,
                    categoryId,
                    date: startDate && endDate ? {
                        [Op.between]: [startDate, endDate]
                    } : undefined
                },
                include: [{
                    model: BudgetCategory,
                    as: 'category'
                }],
                order: [['date', 'DESC']]
            });
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'transaction_get_by_category');
        }
    }

    async updateTransaction(id, userId, data) {
        try {
            const transaction = await Transaction.findOne({
                where: { id, userId }
            });

            if (!transaction) {
                throw new ValidationError('Transaction not found');
            }

            if (data.categoryId) {
                const category = await BudgetCategory.findOne({
                    where: { id: data.categoryId, userId }
                });

                if (!category) {
                    throw new ValidationError('Invalid budget category');
                }
            }

            await transaction.update(data);
            return transaction;
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'transaction_update');
        }
    }

    async deleteTransaction(id, userId) {
        try {
            const transaction = await Transaction.findOne({
                where: { id, userId }
            });

            if (!transaction) {
                throw new ValidationError('Transaction not found');
            }

            await transaction.destroy();
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'transaction_delete');
        }
    }

    // Analytics methods
    async calculateMonthlyTotals(userId, startDate, endDate) {
        try {
            const transactions = await this.getTransactionsByDateRange(userId, startDate, endDate);
            const monthlyTotals = {};

            transactions.forEach(transaction => {
                const date = new Date(transaction.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!monthlyTotals[monthKey]) {
                    monthlyTotals[monthKey] = {
                        income: 0,
                        expenses: 0,
                        net: 0
                    };
                }

                if (transaction.type === 'income') {
                    monthlyTotals[monthKey].income += Number(transaction.amount);
                } else {
                    monthlyTotals[monthKey].expenses += Number(transaction.amount);
                }

                monthlyTotals[monthKey].net = monthlyTotals[monthKey].income - monthlyTotals[monthKey].expenses;
            });

            return monthlyTotals;
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'transaction_monthly_totals');
        }
    }

    async getCategoryTotals(userId, startDate, endDate) {
        try {
            const transactions = await this.getTransactionsByDateRange(userId, startDate, endDate);
            const categoryTotals = {};

            transactions.forEach(transaction => {
                const categoryId = transaction.category?.id || 'uncategorized';
                const categoryName = transaction.category?.name || 'Uncategorized';

                if (!categoryTotals[categoryId]) {
                    categoryTotals[categoryId] = {
                        name: categoryName,
                        total: 0,
                        count: 0
                    };
                }

                categoryTotals[categoryId].total += Number(transaction.amount);
                categoryTotals[categoryId].count++;
            });

            return categoryTotals;
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'transaction_category_totals');
        }
    }
}

module.exports = new TransactionService();