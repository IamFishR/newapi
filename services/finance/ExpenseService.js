'use strict';

const { Op } = require('sequelize');
const models = require('../../models');
const { ValidationError } = require('../../utils/errors');

class ExpenseService {
    constructor() {
        this.expenseModel = models.Expense;
    }

    async create(userId, expenseData) {
        return await this.expenseModel.create({
            ...expenseData,
            user_id: userId
        });
    }

    async update(userId, expenseId, expenseData) {
        const expense = await this.expenseModel.findOne({
            where: {
                id: expenseId,
                user_id: userId
            }
        });

        if (!expense) {
            throw new ValidationError('Expense not found');
        }

        return await expense.update(expenseData);
    }

    async delete(userId, expenseId) {
        const expense = await this.expenseModel.findOne({
            where: {
                id: expenseId,
                user_id: userId
            }
        });

        if (!expense) {
            throw new ValidationError('Expense not found');
        }

        await expense.destroy();
        return true;
    }

    async findById(userId, expenseId) {
        return await this.expenseModel.findOne({
            where: {
                id: expenseId,
                user_id: userId
            }
        });
    }

    async findAll(userId, filters = {}) {
        const where = { user_id: userId };
        const order = [['date', 'DESC']];

        // Apply search filter
        if (filters.search) {
            where.description = {
                [Op.iLike]: `%${filters.search}%`
            };
        }

        // Apply category filter
        if (filters.category && filters.category !== 'all') {
            where.category = filters.category;
        }

        // Apply date range filter
        if (filters.timeRange && filters.timeRange !== 'all') {
            const now = new Date();
            switch (filters.timeRange) {
                case 'today':
                    where.date = {
                        [Op.gte]: new Date(now.setHours(0, 0, 0, 0)),
                        [Op.lte]: new Date(now.setHours(23, 59, 59, 999))
                    };
                    break;
                case 'week':
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    where.date = {
                        [Op.gte]: new Date(weekStart.setHours(0, 0, 0, 0))
                    };
                    break;
                case 'month':
                    where.date = {
                        [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1)
                    };
                    break;
                case 'year':
                    where.date = {
                        [Op.gte]: new Date(now.getFullYear(), 0, 1)
                    };
                    break;
            }
        }

        return await this.expenseModel.findAndCountAll({
            where,
            order,
            limit: filters.limit || 10,
            offset: filters.offset || 0
        });
    }

    async getStats(userId, timeRange = 'month') {
        const now = new Date();
        let startDate;

        switch (timeRange) {
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const expenses = await this.expenseModel.findAll({
            where: {
                user_id: userId,
                date: {
                    [Op.gte]: startDate
                }
            },
            attributes: [
                'category',
                [models.sequelize.fn('SUM', models.sequelize.col('amount')), 'total']
            ],
            group: ['category']
        });

        return expenses;
    }
}

module.exports = new ExpenseService();