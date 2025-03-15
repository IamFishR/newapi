'use strict';

const { CreditCardService } = require('../../services/finance');
const { CreditCard } = require('../../models');
const { sequelize } = require('../../config/sequelize');
const LoggingService = require('../../services/monitoring/LoggingService');

// Mock LoggingService
jest.mock('../../services/monitoring/LoggingService');

describe('CreditCardService', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    afterEach(async () => {
        await CreditCard.destroy({ where: {} });
        jest.clearAllMocks();
    });

    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const validCardData = {
        cardNumber: '6789',
        cardName: 'Test Credit Card',
        cardType: 'visa',
        cardPlan: 'Rewards Card',
        cardLimit: 50000.00
    };

    describe('addCard', () => {
        it('should create a new credit card', async () => {
            const card = await CreditCardService.addCard(userId, validCardData);
            expect(card).toBeDefined();
            expect(card.card_number).toBe('6789');
            expect(card.user_id).toBe(userId);
        });

        it('should log error on failure', async () => {
            const invalidData = { ...validCardData, cardNumber: '123' };
            await expect(CreditCardService.addCard(userId, invalidData))
                .rejects.toThrow();
            expect(LoggingService.logError).toHaveBeenCalled();
        });
    });

    describe('getUserCards', () => {
        it('should return all cards for a user', async () => {
            await CreditCardService.addCard(userId, validCardData);
            await CreditCardService.addCard(userId, {
                ...validCardData,
                cardNumber: '1234'
            });

            const cards = await CreditCardService.getUserCards(userId);
            expect(cards).toHaveLength(2);
        });

        it('should handle empty results', async () => {
            const cards = await CreditCardService.getUserCards(userId);
            expect(cards).toEqual([]);
        });
    });

    describe('updateCard', () => {
        it('should update card details', async () => {
            const card = await CreditCardService.addCard(userId, validCardData);
            const updatedData = {
                ...validCardData,
                cardLimit: 60000.00
            };

            const updatedCard = await CreditCardService.updateCard(card.id, userId, updatedData);
            expect(updatedCard.card_limit).toBe(60000.00);
        });

        it('should not update card number', async () => {
            const card = await CreditCardService.addCard(userId, validCardData);
            const updatedData = {
                ...validCardData,
                cardNumber: '1234'
            };

            const updatedCard = await CreditCardService.updateCard(card.id, userId, updatedData);
            expect(updatedCard.card_number).toBe('6789');
        });

        it('should throw error for non-existent card', async () => {
            await expect(
                CreditCardService.updateCard('invalid-id', userId, validCardData)
            ).rejects.toThrow('Credit card not found');
        });
    });

    describe('deleteCard', () => {
        it('should delete a card', async () => {
            const card = await CreditCardService.addCard(userId, validCardData);
            await CreditCardService.deleteCard(card.id, userId);

            const cards = await CreditCardService.getUserCards(userId);
            expect(cards).toHaveLength(0);
        });

        it('should throw error for non-existent card', async () => {
            await expect(
                CreditCardService.deleteCard('invalid-id', userId)
            ).rejects.toThrow('Credit card not found');
        });
    });

    describe('bulkCreateCards', () => {
        const bulkCardData = [
            validCardData,
            {
                ...validCardData,
                cardNumber: '1234',
                cardName: 'Second Card'
            }
        ];

        it('should create multiple cards', async () => {
            const cards = await CreditCardService.bulkCreateCards(userId, bulkCardData);
            expect(cards).toHaveLength(2);
        });

        it('should validate all cards before creating', async () => {
            const invalidBulkData = [
                validCardData,
                {
                    ...validCardData,
                    cardNumber: '123' // Invalid card number
                }
            ];

            await expect(
                CreditCardService.bulkCreateCards(userId, invalidBulkData)
            ).rejects.toThrow();
            
            // Should not create any cards if validation fails
            const cards = await CreditCardService.getUserCards(userId);
            expect(cards).toHaveLength(0);
        });

        it('should log bulk creation errors', async () => {
            const invalidBulkData = [
                validCardData,
                {
                    ...validCardData,
                    cardLimit: -1000 // Invalid limit
                }
            ];

            await expect(
                CreditCardService.bulkCreateCards(userId, invalidBulkData)
            ).rejects.toThrow();
            expect(LoggingService.logError).toHaveBeenCalled();
        });
    });
});