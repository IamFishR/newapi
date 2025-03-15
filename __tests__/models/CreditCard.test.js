'use strict';

const { CreditCard } = require('../../models');
const { sequelize } = require('../../config/sequelize');

describe('CreditCard Model', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    afterEach(async () => {
        await CreditCard.destroy({ where: {} });
    });

    const validCreditCard = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        card_number: '6789',
        card_name: 'Test Credit Card',
        card_type: 'visa',
        card_plan: 'Rewards Card',
        card_limit: 50000.00
    };

    describe('Validation', () => {
        it('should create a valid credit card', async () => {
            const card = await CreditCard.create(validCreditCard);
            expect(card).toBeDefined();
            expect(card.card_number).toBe('6789');
        });

        it('should fail if card number is not 4 digits', async () => {
            const invalidCard = { ...validCreditCard, card_number: '123' };
            await expect(CreditCard.create(invalidCard)).rejects.toThrow();
        });

        it('should fail if card number is not numeric', async () => {
            const invalidCard = { ...validCreditCard, card_number: 'abcd' };
            await expect(CreditCard.create(invalidCard)).rejects.toThrow();
        });

        it('should fail if card type is invalid', async () => {
            const invalidCard = { ...validCreditCard, card_type: 'invalid' };
            await expect(CreditCard.create(invalidCard)).rejects.toThrow();
        });

        it('should fail if card limit is negative', async () => {
            const invalidCard = { ...validCreditCard, card_limit: -1000 };
            await expect(CreditCard.create(invalidCard)).rejects.toThrow();
        });

        it('should allow empty card plan', async () => {
            const cardWithoutPlan = { ...validCreditCard, card_plan: null };
            const card = await CreditCard.create(cardWithoutPlan);
            expect(card).toBeDefined();
            expect(card.card_plan).toBeNull();
        });
    });

    describe('Relationships', () => {
        it('should associate with transactions', async () => {
            const card = await CreditCard.create(validCreditCard);
            expect(card.getTransactions).toBeDefined();
        });

        it('should associate with user', async () => {
            const card = await CreditCard.create(validCreditCard);
            expect(card.getUser).toBeDefined();
        });
    });

    describe('Card Number Handling', () => {
        it('should only store last 4 digits', async () => {
            const cardWithFullNumber = {
                ...validCreditCard,
                card_number: '1234567890123456'
            };
            const card = await CreditCard.create(cardWithFullNumber);
            expect(card.card_number.length).toBe(4);
            expect(card.card_number).toBe('3456');
        });
    });
});