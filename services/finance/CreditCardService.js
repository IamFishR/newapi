'use strict';

const { CreditCard } = require('../../models');
const { ValidationError } = require('../../utils/errors');
const LoggingService = require('../monitoring/LoggingService');

class CreditCardService {
    /**
     * Add a new credit card
     * @param {string} userId - The user ID
     * @param {Object} cardData - Credit card data
     * @returns {Promise<Object>} Created credit card object
     */
    static async addCard(userId, cardData) {
        try {
            // Check if card number already exists for this user
            const existingCard = await CreditCard.findOne({
                where: {
                    user_id: userId,
                    card_number: cardData.cardNumber
                }
            });

            if (existingCard) {
                throw new ValidationError('Credit card already exists');
            }

            const card = await CreditCard.create({
                user_id: userId,
                card_number: cardData.cardNumber,
                card_name: cardData.cardName,
                card_type: cardData.cardType,
                card_plan: cardData.cardPlan,
                card_limit: cardData.cardLimit
            });

            return card;
        } catch (error) {
            LoggingService.logError(error, {
                context: 'CreditCardService.addCard',
                userId,
                cardNumber: cardData.cardNumber
            });
            throw error;
        }
    }

    /**
     * Get all credit cards for a user
     * @param {string} userId - The user ID
     * @returns {Promise<Array>} Array of credit card objects
     */
    static async getUserCards(userId) {
        try {
            const cards = await CreditCard.findAll({
                where: { user_id: userId },
                order: [['created_at', 'DESC']]
            });

            return cards;
        } catch (error) {
            LoggingService.logError(error, {
                context: 'CreditCardService.getUserCards',
                userId
            });
            throw error;
        }
    }

    /**
     * Get a specific credit card by ID
     * @param {string} cardId - The card ID
     * @param {string} userId - The user ID (for validation)
     * @returns {Promise<Object>} Credit card object
     */
    static async getCardById(cardId, userId) {
        try {
            const card = await CreditCard.findOne({
                where: {
                    id: cardId,
                    user_id: userId
                }
            });

            if (!card) {
                throw new ValidationError('Credit card not found');
            }

            return card;
        } catch (error) {
            LoggingService.logError(error, {
                context: 'CreditCardService.getCardById',
                cardId,
                userId
            });
            throw error;
        }
    }

    /**
     * Update a credit card
     * @param {string} cardId - The card ID
     * @param {string} userId - The user ID (for validation)
     * @param {Object} updateData - Updated card data
     * @returns {Promise<Object>} Updated credit card object
     */
    static async updateCard(cardId, userId, updateData) {
        try {
            const card = await this.getCardById(cardId, userId);

            // If changing card number, check if new number already exists
            if (updateData.cardNumber && updateData.cardNumber !== card.card_number) {
                const existingCard = await CreditCard.findOne({
                    where: {
                        user_id: userId,
                        card_number: updateData.cardNumber
                    }
                });

                if (existingCard) {
                    throw new ValidationError('Credit card with this number already exists');
                }
            }

            // Update the card
            await card.update({
                card_number: updateData.cardNumber || card.card_number,
                card_name: updateData.cardName || card.card_name,
                card_type: updateData.cardType || card.card_type,
                card_plan: updateData.cardPlan || card.card_plan,
                card_limit: updateData.cardLimit || card.card_limit
            });

            return card;
        } catch (error) {
            LoggingService.logError(error, {
                context: 'CreditCardService.updateCard',
                cardId,
                userId
            });
            throw error;
        }
    }

    /**
     * Delete a credit card
     * @param {string} cardId - The card ID
     * @param {string} userId - The user ID (for validation)
     * @returns {Promise<boolean>} True if successful
     */
    static async deleteCard(cardId, userId) {
        try {
            const card = await this.getCardById(cardId, userId);
            await card.destroy();
            return true;
        } catch (error) {
            LoggingService.logError(error, {
                context: 'CreditCardService.deleteCard',
                cardId,
                userId
            });
            throw error;
        }
    }

    /**
     * Bulk create credit cards
     * @param {string} userId - The user ID
     * @param {Array} cards - Array of credit card data
     * @returns {Promise<Array>} Array of created credit card objects
     */
    static async bulkCreateCards(userId, cards) {
        try {
            const cardData = cards.map(card => ({
                user_id: userId,
                card_number: card.cardNumber,
                card_name: card.cardName,
                card_type: card.cardType,
                card_plan: card.cardPlan,
                card_limit: card.cardLimit
            }));

            const createdCards = await CreditCard.bulkCreate(cardData, {
                validate: true
            });

            return createdCards;
        } catch (error) {
            LoggingService.logError(error, {
                context: 'CreditCardService.bulkCreateCards',
                userId,
                cardCount: cards.length
            });
            throw error;
        }
    }
}

module.exports = CreditCardService;