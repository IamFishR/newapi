const { FinancialGoal, GoalContribution, User } = require('../../models');
const ValidationError = require('../../utils/ValidationError');
const { Op } = require('sequelize');

class GoalsService {
    async getFinancialGoals(userId) {
        return await FinancialGoal.findAll({
            where: { userId },
            include: [{
                model: GoalContribution,
                as: 'contributions',
                attributes: ['id', 'amount', 'date']
            }],
            order: [
                ['priority', 'DESC'],
                ['targetDate', 'ASC']
            ]
        });
    }

    async createFinancialGoal(userId, data) {
        const goal = await FinancialGoal.create({
            userId,
            ...data,
            currentAmount: data.currentAmount || 0
        });

        return this.getGoalById(goal.id, userId);
    }

    async updateFinancialGoal(id, userId, data) {
        const goal = await this.getGoalById(id, userId);
        if (!goal) {
            throw new ValidationError('Financial goal not found');
        }

        // If the goal is marked as completed, validate the current amount
        if (data.status === 'completed' && goal.currentAmount < goal.targetAmount) {
            throw new ValidationError('Cannot mark goal as completed: target amount not reached');
        }

        await goal.update(data);
        return this.getGoalById(id, userId);
    }

    async deleteFinancialGoal(id, userId) {
        const goal = await this.getGoalById(id, userId);
        if (!goal) {
            throw new ValidationError('Financial goal not found');
        }

        await goal.destroy();
    }

    async getGoalById(id, userId) {
        return await FinancialGoal.findOne({
            where: { id, userId },
            include: [{
                model: GoalContribution,
                as: 'contributions',
                attributes: ['id', 'amount', 'date']
            }]
        });
    }

    async addContribution(userId, goalId, { amount, date = new Date() }) {
        const goal = await this.getGoalById(goalId, userId);
        if (!goal) {
            throw new ValidationError('Financial goal not found');
        }

        const contribution = await GoalContribution.create({
            goalId,
            userId,
            amount,
            date
        });

        // Update goal current amount
        await goal.update({
            currentAmount: Number(goal.currentAmount) + Number(amount)
        });

        // If goal is reached, mark as completed
        if (Number(goal.currentAmount) >= Number(goal.targetAmount)) {
            await goal.update({ status: 'completed' });
        }

        return contribution;
    }

    async getGoalAnalytics(userId) {
        const goals = await this.getFinancialGoals(userId);
        
        const analytics = {
            totalGoals: goals.length,
            activeGoals: 0,
            completedGoals: 0,
            totalTargetAmount: 0,
            totalCurrentAmount: 0,
            goalsByCategory: {},
            goalsByPriority: {
                high: 0,
                medium: 0,
                low: 0
            },
            upcomingDeadlines: []
        };

        if (!goals.length) return analytics;

        for (const goal of goals) {
            // Count by status
            if (goal.status === 'completed') {
                analytics.completedGoals++;
            } else if (goal.status === 'active') {
                analytics.activeGoals++;
            }

            // Sum amounts
            analytics.totalTargetAmount += Number(goal.targetAmount);
            analytics.totalCurrentAmount += Number(goal.currentAmount);

            // Group by category
            if (!analytics.goalsByCategory[goal.category]) {
                analytics.goalsByCategory[goal.category] = {
                    count: 0,
                    targetAmount: 0,
                    currentAmount: 0
                };
            }
            analytics.goalsByCategory[goal.category].count++;
            analytics.goalsByCategory[goal.category].targetAmount += Number(goal.targetAmount);
            analytics.goalsByCategory[goal.category].currentAmount += Number(goal.currentAmount);

            // Count by priority
            analytics.goalsByPriority[goal.priority]++;

            // Check upcoming deadlines (next 30 days)
            const daysToDeadline = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysToDeadline <= 30 && daysToDeadline > 0 && goal.status === 'active') {
                analytics.upcomingDeadlines.push({
                    goalId: goal.id,
                    name: goal.name,
                    daysRemaining: daysToDeadline,
                    percentageComplete: (goal.currentAmount / goal.targetAmount) * 100
                });
            }
        }

        // Sort upcoming deadlines
        analytics.upcomingDeadlines.sort((a, b) => a.daysRemaining - b.daysRemaining);

        return analytics;
    }

    async calculateRequiredContributions(userId, goalId) {
        const goal = await this.getGoalById(goalId, userId);
        if (!goal) {
            throw new ValidationError('Financial goal not found');
        }

        const remaining = goal.targetAmount - goal.currentAmount;
        const daysToTarget = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));

        if (daysToTarget <= 0) {
            throw new ValidationError('Goal target date has passed');
        }

        const monthsToTarget = Math.ceil(daysToTarget / 30);
        const requiredMonthly = remaining / monthsToTarget;

        return {
            goalId: goal.id,
            name: goal.name,
            remaining,
            daysToTarget,
            monthsToTarget,
            requiredMonthly,
            requiredWeekly: requiredMonthly / 4,
            currentProgress: (goal.currentAmount / goal.targetAmount) * 100
        };
    }
}

module.exports = new GoalsService();