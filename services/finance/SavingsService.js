'use strict';

const { SavingsGoal } = require('../../models');
const { ValidationError } = require('../../utils/errors');
const LoggingService = require('../monitoring/LoggingService');

class SavingsService {
    /**
     * Create a new savings goal
     * @param {string} userId - The user ID
     * @param {Object} goalData - Savings goal data
     * @returns {Promise<Object>} Created savings goal object
     */
    static async createGoal(userId, goalData) {
        try {
            const goal = await SavingsGoal.create({
                user_id: userId,
                current_amount: goalData.currentAmount || 0,
                target_amount: goalData.targetAmount,
                target_date: goalData.targetDate,
                monthly_contribution: goalData.monthlyContribution,
                savings_type: goalData.savingsType,
                category: goalData.category
            });

            return goal;
        } catch (error) {
            LoggingService.logError(error, {
                context: 'SavingsService.createGoal',
                userId
            });
            throw error;
        }
    }

    /**
     * Get all savings goals for a user
     * @param {string} userId - The user ID
     * @returns {Promise<Array>} Array of savings goal objects
     */
    static async getUserGoals(userId) {
        try {
            const goals = await SavingsGoal.findAll({
                where: { user_id: userId },
                order: [['target_date', 'ASC']]
            });

            return goals.map(goal => ({
                ...goal.toJSON(),
                progress: goal.getProgress(),
                remainingAmount: goal.getRemainingAmount(),
                isAchieved: goal.isAchieved(),
                requiredMonthlyContribution: goal.getRequiredMonthlyContribution()
            }));
        } catch (error) {
            LoggingService.logError(error, {
                context: 'SavingsService.getUserGoals',
                userId
            });
            throw error;
        }
    }

    /**
     * Update savings goal progress
     * @param {string} goalId - The goal ID
     * @param {string} userId - The user ID
     * @param {number} amount - Amount to add to current savings
     * @returns {Promise<Object>} Updated savings goal object
     */
    static async updateProgress(goalId, userId, amount) {
        try {
            const goal = await SavingsGoal.findOne({
                where: {
                    id: goalId,
                    user_id: userId
                }
            });

            if (!goal) {
                throw new ValidationError('Savings goal not found');
            }

            const newAmount = goal.current_amount + amount;
            if (newAmount < 0) {
                throw new ValidationError('Cannot reduce savings below 0');
            }

            await goal.update({
                current_amount: newAmount
            });

            return {
                ...goal.toJSON(),
                progress: goal.getProgress(),
                remainingAmount: goal.getRemainingAmount(),
                isAchieved: goal.isAchieved()
            };
        } catch (error) {
            LoggingService.logError(error, {
                context: 'SavingsService.updateProgress',
                goalId,
                userId,
                amount
            });
            throw error;
        }
    }

    /**
     * Get savings goal analytics
     * @param {string} userId - The user ID
     * @returns {Promise<Object>} Savings analytics data
     */
    static async getAnalytics(userId) {
        try {
            const goals = await SavingsGoal.findAll({
                where: { user_id: userId }
            });

            const analytics = {
                totalSaved: 0,
                totalTarget: 0,
                achievedGoals: 0,
                onTrackGoals: 0,
                atRiskGoals: 0,
                averageProgress: 0,
                goalsByType: {},
                nextMilestones: []
            };

            goals.forEach(goal => {
                analytics.totalSaved += goal.current_amount;
                analytics.totalTarget += goal.target_amount;

                if (goal.isAchieved()) {
                    analytics.achievedGoals++;
                } else {
                    const progress = goal.getProgress();
                    const expectedProgress = this.calculateExpectedProgress(goal);

                    if (progress >= expectedProgress) {
                        analytics.onTrackGoals++;
                    } else {
                        analytics.atRiskGoals++;
                    }

                    // Track goals by type
                    analytics.goalsByType[goal.savings_type] = analytics.goalsByType[goal.savings_type] || {
                        count: 0,
                        totalSaved: 0,
                        totalTarget: 0
                    };
                    analytics.goalsByType[goal.savings_type].count++;
                    analytics.goalsByType[goal.savings_type].totalSaved += goal.current_amount;
                    analytics.goalsByType[goal.savings_type].totalTarget += goal.target_amount;

                    // Track next milestones
                    if (!goal.isAchieved()) {
                        analytics.nextMilestones.push({
                            goalId: goal.id,
                            type: goal.savings_type,
                            category: goal.category,
                            targetDate: goal.target_date,
                            remainingAmount: goal.getRemainingAmount(),
                            requiredMonthlyContribution: goal.getRequiredMonthlyContribution()
                        });
                    }
                }
            });

            // Calculate average progress
            analytics.averageProgress = goals.length > 0 
                ? (analytics.totalSaved / analytics.totalTarget) * 100 
                : 0;

            // Sort milestones by target date
            analytics.nextMilestones.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));

            return analytics;
        } catch (error) {
            LoggingService.logError(error, {
                context: 'SavingsService.getAnalytics',
                userId
            });
            throw error;
        }
    }

    /**
     * Calculate expected progress percentage for a goal based on time elapsed
     * @private
     */
    static calculateExpectedProgress(goal) {
        const startDate = new Date(goal.created_at);
        const targetDate = new Date(goal.target_date);
        const today = new Date();

        const totalDays = (targetDate - startDate) / (1000 * 60 * 60 * 24);
        const elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);

        return (elapsedDays / totalDays) * 100;
    }

    /**
     * Bulk create savings goals
     * @param {string} userId - The user ID
     * @param {Array} goals - Array of savings goal data
     * @returns {Promise<Array>} Array of created savings goal objects
     */
    static async bulkCreateGoals(userId, goals) {
        try {
            const goalData = goals.map(goal => ({
                user_id: userId,
                current_amount: goal.currentAmount || 0,
                target_amount: goal.targetAmount,
                target_date: goal.targetDate,
                monthly_contribution: goal.monthlyContribution,
                savings_type: goal.savingsType,
                category: goal.category
            }));

            const createdGoals = await SavingsGoal.bulkCreate(goalData, {
                validate: true
            });

            return createdGoals;
        } catch (error) {
            LoggingService.logError(error, {
                context: 'SavingsService.bulkCreateGoals',
                userId,
                goalCount: goals.length
            });
            throw error;
        }
    }
}

module.exports = SavingsService;