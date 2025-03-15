'use strict';

const { IncomeService } = require('../../services/finance');
const { Income } = require('../../models');
const { sequelize } = require('../../config/sequelize');
const LoggingService = require('../../services/monitoring/LoggingService');

jest.mock('../../services/monitoring/LoggingService');

describe('IncomeService', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    afterEach(async () => {
        await Income.destroy({ where: {} });
        jest.clearAllMocks();
    });

    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const validIncomeData = {
        type: 'salary',
        amount: 50000.00,
        date: new Date(),
        frequency: 'monthly',
        description: 'Monthly salary'
    };

    describe('addIncome', () => {
        it('should create a new income record', async () => {
            const income = await IncomeService.addIncome(userId, validIncomeData);
            expect(income).toBeDefined();
            expect(income.amount).toBe(50000.00);
            expect(income.user_id).toBe(userId);
        });

        it('should log error on failure', async () => {
            const invalidData = { ...validIncomeData, amount: -1000 };
            await expect(IncomeService.addIncome(userId, invalidData))
                .rejects.toThrow();
            expect(LoggingService.logError).toHaveBeenCalled();
        });
    });

    describe('getUserIncome', () => {
        beforeEach(async () => {
            await IncomeService.addIncome(userId, validIncomeData);
            await IncomeService.addIncome(userId, {
                ...validIncomeData,
                type: 'business',
                amount: 25000.00
            });
        });

        it('should return all income records for a user', async () => {
            const income = await IncomeService.getUserIncome(userId);
            expect(income).toHaveLength(2);
        });

        it('should filter by type', async () => {
            const income = await IncomeService.getUserIncome(userId, { type: 'salary' });
            expect(income).toHaveLength(1);
            expect(income[0].type).toBe('salary');
        });

        it('should filter by date range', async () => {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 1);

            const income = await IncomeService.getUserIncome(userId, {
                startDate,
                endDate
            });
            expect(income).toHaveLength(2);
        });

        it('should handle empty results', async () => {
            await Income.destroy({ where: {} });
            const income = await IncomeService.getUserIncome(userId);
            expect(income).toEqual([]);
        });
    });

    describe('getIncomeSummary', () => {
        beforeEach(async () => {
            // Add multiple income records
            await IncomeService.addIncome(userId, validIncomeData);
            await IncomeService.addIncome(userId, {
                ...validIncomeData,
                type: 'business',
                amount: 25000.00,
                frequency: 'monthly'
            });
            await IncomeService.addIncome(userId, {
                ...validIncomeData,
                type: 'rental',
                amount: 15000.00,
                frequency: 'monthly'
            });
        });

        it('should calculate total monthly income', async () => {
            const summary = await IncomeService.getIncomeSummary(userId, 'monthly');
            expect(summary.total).toBe(90000.00); // 50000 + 25000 + 15000
        });

        it('should provide breakdown by type', async () => {
            const summary = await IncomeService.getIncomeSummary(userId, 'monthly');
            expect(summary.breakdown).toBeDefined();
            expect(summary.breakdown.salary).toBe(50000.00);
            expect(summary.breakdown.business).toBe(25000.00);
            expect(summary.breakdown.rental).toBe(15000.00);
        });

        it('should handle different frequencies', async () => {
            await IncomeService.addIncome(userId, {
                ...validIncomeData,
                type: 'dividend',
                amount: 120000.00,
                frequency: 'yearly'
            });

            const summary = await IncomeService.getIncomeSummary(userId, 'monthly');
            expect(summary.breakdown.dividend).toBe(10000.00); // 120000 / 12
        });
    });

    describe('getProjectedIncome', () => {
        beforeEach(async () => {
            await IncomeService.addIncome(userId, validIncomeData);
            await IncomeService.addIncome(userId, {
                ...validIncomeData,
                type: 'rental',
                amount: 15000.00,
                frequency: 'monthly'
            });
        });

        it('should project income for specified months', async () => {
            const projection = await IncomeService.getProjectedIncome(userId, 3);
            expect(projection.length).toBe(3);
            expect(projection[0].total).toBe(65000.00); // 50000 + 15000
        });

        it('should include one-time income only in first month', async () => {
            await IncomeService.addIncome(userId, {
                ...validIncomeData,
                type: 'bonus',
                amount: 100000.00,
                frequency: 'one_time'
            });

            const projection = await IncomeService.getProjectedIncome(userId, 3);
            expect(projection[0].total).toBe(165000.00); // 65000 + 100000
            expect(projection[1].total).toBe(65000.00);
            expect(projection[2].total).toBe(65000.00);
        });

        it('should handle quarterly income', async () => {
            await IncomeService.addIncome(userId, {
                ...validIncomeData,
                type: 'dividend',
                amount: 30000.00,
                frequency: 'quarterly'
            });

            const projection = await IncomeService.getProjectedIncome(userId, 3);
            expect(projection[0].total).toBe(75000.00); // 65000 + (30000 / 3)
        });
    });

    describe('bulkCreateIncome', () => {
        const bulkIncomeData = [
            validIncomeData,
            {
                ...validIncomeData,
                type: 'business',
                amount: 25000.00
            }
        ];

        it('should create multiple income records', async () => {
            const incomes = await IncomeService.bulkCreateIncome(userId, bulkIncomeData);
            expect(incomes).toHaveLength(2);
        });

        it('should validate all records before creating', async () => {
            const invalidBulkData = [
                validIncomeData,
                {
                    ...validIncomeData,
                    amount: -1000
                }
            ];

            await expect(
                IncomeService.bulkCreateIncome(userId, invalidBulkData)
            ).rejects.toThrow();
            
            const incomes = await IncomeService.getUserIncome(userId);
            expect(incomes).toHaveLength(0);
        });

        it('should log bulk creation errors', async () => {
            const invalidBulkData = [
                validIncomeData,
                {
                    ...validIncomeData,
                    type: 'invalid'
                }
            ];

            await expect(
                IncomeService.bulkCreateIncome(userId, invalidBulkData)
            ).rejects.toThrow();
            expect(LoggingService.logError).toHaveBeenCalled();
        });
    });
});