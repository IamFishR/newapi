'use strict';

const { Income } = require('../../models');
const { sequelize } = require('../../config/sequelize');

describe('Income Model', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    afterEach(async () => {
        await Income.destroy({ where: {} });
    });

    const validIncome = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'salary',
        amount: 50000.00,
        date: new Date(),
        frequency: 'monthly',
        description: 'Monthly salary'
    };

    describe('Validation', () => {
        it('should create a valid income record', async () => {
            const income = await Income.create(validIncome);
            expect(income).toBeDefined();
            expect(income.amount).toBe(50000.00);
        });

        it('should fail if type is invalid', async () => {
            const invalidIncome = { ...validIncome, type: 'invalid' };
            await expect(Income.create(invalidIncome)).rejects.toThrow();
        });

        it('should fail if amount is negative', async () => {
            const invalidIncome = { ...validIncome, amount: -1000 };
            await expect(Income.create(invalidIncome)).rejects.toThrow();
        });

        it('should fail if frequency is invalid', async () => {
            const invalidIncome = { ...validIncome, frequency: 'invalid' };
            await expect(Income.create(invalidIncome)).rejects.toThrow();
        });

        it('should allow empty description', async () => {
            const incomeWithoutDesc = { ...validIncome, description: null };
            const income = await Income.create(incomeWithoutDesc);
            expect(income).toBeDefined();
            expect(income.description).toBeNull();
        });
    });

    describe('Relationships', () => {
        it('should associate with user', async () => {
            const income = await Income.create(validIncome);
            expect(income.getUser).toBeDefined();
        });
    });

    describe('Date Handling', () => {
        it('should properly store and retrieve dates', async () => {
            const testDate = new Date('2025-01-01');
            const income = await Income.create({
                ...validIncome,
                date: testDate
            });
            expect(income.date.toISOString().split('T')[0]).toBe('2025-01-01');
        });
    });

    describe('Income Types', () => {
        const types = ['salary', 'business', 'rental', 'interest', 'dividend', 'capital_gains', 'other'];
        
        test.each(types)('should accept %s as valid income type', async (type) => {
            const income = await Income.create({
                ...validIncome,
                type
            });
            expect(income.type).toBe(type);
        });
    });

    describe('Income Frequencies', () => {
        const frequencies = ['one_time', 'monthly', 'quarterly', 'yearly'];
        
        test.each(frequencies)('should accept %s as valid frequency', async (frequency) => {
            const income = await Income.create({
                ...validIncome,
                frequency
            });
            expect(income.frequency).toBe(frequency);
        });
    });
});