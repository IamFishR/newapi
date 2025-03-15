'use strict';

const { Income } = require('../../models');
const { ValidationError } = require('../../utils/errors');
const LoggingService = require('../monitoring/LoggingService');

class IncomeService {
    /**
     * Add a new income record
     * @param {string} userId - The user ID
     * @param {Object} incomeData - Income data
     * @returns {Promise<Object>} Created income object
     */
    static async addIncome(userId, incomeData) {
        try {
            const income = await Income.create({
                user_id: userId,
                type: incomeData.type,
                amount: incomeData.amount,
                date: incomeData.date,
                frequency: incomeData.frequency,
                description: incomeData.description
            });

            return income;
        } catch (error) {
            LoggingService.logError(error, {
                context: 'IncomeService.addIncome',
                userId
            });
            throw error;
        }
    }

    /**
     * Get all income records for a user
     * @param {string} userId - The user ID
     * @param {Object} filters - Optional filters (date range, type, etc.)
     * @returns {Promise<Array>} Array of income objects
     */
    static async getUserIncome(userId, filters = {}) {
        try {
            const where = { user_id: userId };

            // Apply date range filter if provided
            if (filters.startDate && filters.endDate) {
                where.date = {
                    [Op.between]: [filters.startDate, filters.endDate]
                };
            }

            // Apply type filter if provided
            if (filters.type) {
                where.type = filters.type;
            }

            const income = await Income.findAll({
                where,
                order: [['date', 'DESC']]
            });

            return income;
        } catch (error) {
            LoggingService.logError(error, {
                context: 'IncomeService.getUserIncome',
                userId,
                filters
            });
            throw error;
        }
    }

    /**
     * Get income summary for a user
     * @param {string} userId - The user ID
     * @param {string} period - Period for summary (monthly, yearly)
     * @returns {Promise<Object>} Income summary
     */
    static async getIncomeSummary(userId, period = 'monthly') {
        try {
            const currentDate = new Date();
            let startDate;

            if (period === 'monthly') {
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            } else if (period === 'yearly') {
                startDate = new Date(currentDate.getFullYear(), 0, 1);
            } else {
                throw new ValidationError('Invalid period specified');
            }

            const income = await Income.findAll({
                where: {
                    user_id: userId,
                    date: {
                        [Op.between]: [startDate, currentDate]
                    }
                },
                attributes: [
                    'type',
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['type']
            });

            return income;
        } catch (error) {
            LoggingService.logError(error, {
                context: 'IncomeService.getIncomeSummary',
                userId,
                period
            });
            throw error;
        }
    }

    /**
     * Get projected income for a user
     * @param {string} userId - The user ID
     * @param {number} months - Number of months to project
     * @returns {Promise<Object>} Projected income data
     */
    static async getProjectedIncome(userId, months = 12) {
        try {
            const recurringIncome = await Income.findAll({
                where: {
                    user_id: userId,
                    frequency: {
                        [Op.ne]: 'one_time'
                    }
                }
            });

            let projectedAmount = 0;

            recurringIncome.forEach(income => {
                const monthlyAmount = this.calculateMonthlyAmount(income.amount, income.frequency);
                projectedAmount += monthlyAmount * months;
            });

            return {
                monthlyProjection: projectedAmount / months,
                totalProjection: projectedAmount,
                projectionPeriod: months,
                recurringSourcesCount: recurringIncome.length
            };
        } catch (error) {
            LoggingService.logError(error, {
                context: 'IncomeService.getProjectedIncome',
                userId,
                months
            });
            throw error;
        }
    }

    /**
     * Calculate monthly amount based on frequency
     * @private
     */
    static calculateMonthlyAmount(amount, frequency) {
        switch (frequency) {
            case 'monthly':
                return amount;
            case 'quarterly':
                return amount / 3;
            case 'yearly':
                return amount / 12;
            default:
                return 0;
        }
    }

    /**
     * Bulk create income records
     * @param {string} userId - The user ID
     * @param {Array} incomeRecords - Array of income data
     * @returns {Promise<Array>} Array of created income objects
     */
    static async bulkCreateIncome(userId, incomeRecords) {
        try {
            const incomeData = incomeRecords.map(income => ({
                user_id: userId,
                type: income.type,
                amount: income.amount,
                date: income.date,
                frequency: income.frequency,
                description: income.description
            }));

            const createdRecords = await Income.bulkCreate(incomeData, {
                validate: true
            });

            return createdRecords;
        } catch (error) {
            LoggingService.logError(error, {
                context: 'IncomeService.bulkCreateIncome',
                userId,
                recordCount: incomeRecords.length
            });
            throw error;
        }
    }
}

module.exports = IncomeService;