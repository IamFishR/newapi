'use strict';

const { SavingsService } = require('../../services/finance');
const { SavingsGoal } = require('../../models');
const { sequelize } = require('../../config/sequelize');
const LoggingService = require('../../services/monitoring/LoggingService');

jest.mock('../../services/monitoring/LoggingService');

describe('SavingsService', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    afterEach(async () => {
        await SavingsGoal.destroy({ where: {} });
        jest.clearAllMocks();
    });

    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const validGoalData = {
        currentAmount: 10000.00,
        targetAmount: 50000.00,
        targetDate: new Date('2025-12-31'),
        monthlyContribution: 2000.00,
        savingsType: 'emergency',
        category: 'Emergency Fund'
    };

    describe('createGoal', () => {
        it('should create a new savings goal', async () => {
            const goal = await SavingsService.createGoal(userId, validGoalData);
            expect(goal).toBeDefined();
            expect(goal.target_amount).toBe(50000.00);
            expect(goal.user_id).toBe(userId);
        });

        it('should fail if target amount is less than current amount', async () => {
            const invalidData = {
                ...validGoalData,
                currentAmount: 60000.00,
                targetAmount: 50000.00
            };
            await expect(SavingsService.createGoal(userId, invalidData))
                .rejects.toThrow();
            expect(LoggingService.logError).toHaveBeenCalled();
        });

        it('should calculate required monthly contribution', async () => {
            const goal = await SavingsService.createGoal(userId, {
                ...validGoalData,
                monthlyContribution: 0 // Let service calculate it
            });
            expect(goal.monthly_contribution).toBeGreaterThan(0);
        });
    });

    describe('getUserGoals', () => {
        beforeEach(async () => {
            await SavingsService.createGoal(userId, validGoalData);
            await SavingsService.createGoal(userId, {
                ...validGoalData,
                savingsType: 'house',
                category: 'House Fund',
                targetAmount: 1000000.00
            });
        });

        it('should return all goals for a user', async () => {
            const goals = await SavingsService.getUserGoals(userId);
            expect(goals).toHaveLength(2);
        });

        it('should filter by type', async () => {
            const goals = await SavingsService.getUserGoals(userId, { type: 'emergency' });
            expect(goals).toHaveLength(1);
            expect(goals[0].savings_type).toBe('emergency');
        });

        it('should include progress information', async () => {
            const goals = await SavingsService.getUserGoals(userId);
            expect(goals[0].progress).toBeDefined();
            expect(goals[0].progress.percentage).toBe(20); // (10000 / 50000) * 100
            expect(goals[0].progress.remaining).toBe(40000);
        });
    });

    describe('updateProgress', () => {
        let goal;

        beforeEach(async () => {
            goal = await SavingsService.createGoal(userId, validGoalData);
        });

        it('should update current amount', async () => {
            const progress = await SavingsService.updateProgress(goal.id, userId, 5000.00);
            expect(progress.current_amount).toBe(15000.00); // 10000 + 5000
            expect(progress.progress_percentage).toBe(30); // (15000 / 50000) * 100
        });

        it('should handle goal completion', async () => {
            const progress = await SavingsService.updateProgress(goal.id, userId, 40000.00);
            expect(progress.is_completed).toBe(true);
            expect(progress.completion_date).toBeDefined();
        });

        it('should not allow exceeding target amount', async () => {
            await expect(
                SavingsService.updateProgress(goal.id, userId, 50000.00)
            ).rejects.toThrow();
        });

        it('should validate goal ownership', async () => {
            await expect(
                SavingsService.updateProgress(goal.id, 'wrong-user', 5000.00)
            ).rejects.toThrow('Unauthorized access to savings goal');
        });
    });

    describe('getAnalytics', () => {
        beforeEach(async () => {
            await SavingsService.createGoal(userId, validGoalData);
            await SavingsService.createGoal(userId, {
                ...validGoalData,
                savingsType: 'retirement',
                category: 'Retirement Fund',
                targetAmount: 2000000.00,
                currentAmount: 500000.00
            });
        });

        it('should provide overall savings summary', async () => {
            const analytics = await SavingsService.getAnalytics(userId);
            expect(analytics.totalSaved).toBe(510000.00); // 10000 + 500000
            expect(analytics.totalTarget).toBe(2050000.00); // 50000 + 2000000
        });

        it('should calculate goal completion rates', async () => {
            const analytics = await SavingsService.getAnalytics(userId);
            expect(analytics.completionRates).toBeDefined();
            expect(analytics.completionRates.emergency).toBe(20); // (10000 / 50000) * 100
            expect(analytics.completionRates.retirement).toBe(25); // (500000 / 2000000) * 100
        });

        it('should provide monthly savings tracking', async () => {
            const analytics = await SavingsService.getAnalytics(userId);
            expect(analytics.monthlySavings).toBeDefined();
            expect(analytics.monthlySavings.target).toBe(4000.00); // 2000 * 2 goals
            expect(analytics.monthlySavings.actual).toBeDefined();
        });

        it('should include goal-specific analytics', async () => {
            const analytics = await SavingsService.getAnalytics(userId);
            expect(analytics.goals).toHaveLength(2);
            expect(analytics.goals[0]).toHaveProperty('timeToCompletion');
            expect(analytics.goals[0]).toHaveProperty('savingRate');
            expect(analytics.goals[0]).toHaveProperty('adjustedContribution');
        });
    });

    describe('adjustGoal', () => {
        let goal;

        beforeEach(async () => {
            goal = await SavingsService.createGoal(userId, validGoalData);
        });

        it('should update target amount and date', async () => {
            const updatedGoal = await SavingsService.adjustGoal(goal.id, userId, {
                targetAmount: 60000.00,
                targetDate: new Date('2026-12-31')
            });
            expect(updatedGoal.target_amount).toBe(60000.00);
            expect(updatedGoal.monthly_contribution).toBeGreaterThan(validGoalData.monthlyContribution);
        });

        it('should recalculate monthly contribution', async () => {
            const updatedGoal = await SavingsService.adjustGoal(goal.id, userId, {
                targetAmount: 100000.00
            });
            expect(updatedGoal.monthly_contribution).toBeGreaterThan(validGoalData.monthlyContribution);
        });

        it('should validate adjusted amounts', async () => {
            await expect(
                SavingsService.adjustGoal(goal.id, userId, {
                    targetAmount: 5000.00 // Less than current amount
                })
            ).rejects.toThrow();
        });
    });
});