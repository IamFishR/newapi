'use strict';

const { SavingsGoal } = require('../../models');
const { sequelize } = require('../../config/sequelize');

describe('SavingsGoal Model', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    afterEach(async () => {
        await SavingsGoal.destroy({ where: {} });
    });

    const validSavingsGoal = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        current_amount: 10000.00,
        target_amount: 50000.00,
        target_date: new Date('2025-12-31'),
        monthly_contribution: 2000.00,
        savings_type: 'emergency',
        category: 'Emergency Fund'
    };

    describe('Validation', () => {
        it('should create a valid savings goal', async () => {
            const goal = await SavingsGoal.create(validSavingsGoal);
            expect(goal).toBeDefined();
            expect(goal.target_amount).toBe(50000.00);
        });

        it('should fail if target amount is less than current amount', async () => {
            const invalidGoal = {
                ...validSavingsGoal,
                current_amount: 60000.00,
                target_amount: 50000.00
            };
            await expect(SavingsGoal.create(invalidGoal)).rejects.toThrow();
        });

        it('should fail if target date is in the past', async () => {
            const invalidGoal = {
                ...validSavingsGoal,
                target_date: new Date('2020-01-01')
            };
            await expect(SavingsGoal.create(invalidGoal)).rejects.toThrow();
        });

        it('should fail if monthly contribution is negative', async () => {
            const invalidGoal = {
                ...validSavingsGoal,
                monthly_contribution: -100
            };
            await expect(SavingsGoal.create(invalidGoal)).rejects.toThrow();
        });

        it('should fail if savings type is invalid', async () => {
            const invalidGoal = {
                ...validSavingsGoal,
                savings_type: 'invalid'
            };
            await expect(SavingsGoal.create(invalidGoal)).rejects.toThrow();
        });
    });

    describe('Goal Progress Methods', () => {
        it('should calculate progress percentage correctly', async () => {
            const goal = await SavingsGoal.create(validSavingsGoal);
            expect(goal.getProgress()).toBe(20); // (10000 / 50000) * 100
        });

        it('should calculate remaining amount correctly', async () => {
            const goal = await SavingsGoal.create(validSavingsGoal);
            expect(goal.getRemainingAmount()).toBe(40000); // 50000 - 10000
        });

        it('should determine if goal is achieved', async () => {
            const achievedGoal = await SavingsGoal.create({
                ...validSavingsGoal,
                current_amount: 50000.00,
                target_amount: 50000.00
            });
            expect(achievedGoal.isAchieved()).toBe(true);
        });

        it('should calculate required monthly contribution correctly', async () => {
            const goal = await SavingsGoal.create(validSavingsGoal);
            const monthsToGoal = Math.ceil(
                (new Date('2025-12-31').getTime() - new Date().getTime()) / 
                (1000 * 60 * 60 * 24 * 30.44) // Average days per month
            );
            const expectedMonthlyAmount = (50000 - 10000) / monthsToGoal;
            expect(Math.round(goal.getRequiredMonthlyContribution()))
                .toBe(Math.round(expectedMonthlyAmount));
        });
    });

    describe('Savings Types', () => {
        const types = [
            'emergency',
            'retirement',
            'education',
            'house',
            'car',
            'travel',
            'wedding',
            'other'
        ];
        
        test.each(types)('should accept %s as valid savings type', async (type) => {
            const goal = await SavingsGoal.create({
                ...validSavingsGoal,
                savings_type: type
            });
            expect(goal.savings_type).toBe(type);
        });
    });

    describe('Progress Updates', () => {
        it('should update current amount correctly', async () => {
            const goal = await SavingsGoal.create(validSavingsGoal);
            await goal.update({ current_amount: 15000.00 });
            expect(goal.current_amount).toBe(15000.00);
            expect(goal.getProgress()).toBe(30); // (15000 / 50000) * 100
        });

        it('should not allow current amount to exceed target amount', async () => {
            const goal = await SavingsGoal.create(validSavingsGoal);
            await expect(
                goal.update({ current_amount: 60000.00 })
            ).rejects.toThrow();
        });
    });
});