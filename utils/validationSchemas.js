'use strict';

const Joi = require('joi');

const schemas = {
    creditCard: Joi.object({
        cardNumber: Joi.string()
            .length(4)
            .pattern(/^[0-9]+$/)
            .required()
            .messages({
                'string.length': 'Card number must be exactly 4 digits (last 4 digits)',
                'string.pattern.base': 'Card number must contain only digits'
            }),
        cardName: Joi.string()
            .max(100)
            .required(),
        cardType: Joi.string()
            .valid('visa', 'mastercard', 'amex', 'discover', 'other')
            .required(),
        cardPlan: Joi.string()
            .max(100)
            .allow(null, ''),
        cardLimit: Joi.number()
            .min(0)
            .required()
    }),

    income: Joi.object({
        type: Joi.string()
            .valid('salary', 'business', 'rental', 'interest', 'dividend', 'capital_gains', 'other')
            .required(),
        amount: Joi.number()
            .min(0)
            .required(),
        date: Joi.date()
            .iso()
            .required(),
        frequency: Joi.string()
            .valid('one_time', 'monthly', 'quarterly', 'yearly')
            .required(),
        description: Joi.string()
            .max(255)
            .allow(null, '')
    }),

    savingsGoal: Joi.object({
        currentAmount: Joi.number()
            .min(0)
            .default(0),
        targetAmount: Joi.number()
            .min(Joi.ref('currentAmount'))
            .required()
            .messages({
                'number.min': 'Target amount must be greater than current amount'
            }),
        targetDate: Joi.date()
            .iso()
            .min('now')
            .required()
            .messages({
                'date.min': 'Target date must be in the future'
            }),
        monthlyContribution: Joi.number()
            .min(0)
            .required(),
        savingsType: Joi.string()
            .valid('emergency', 'retirement', 'education', 'house', 'car', 'travel', 'wedding', 'other')
            .required(),
        category: Joi.string()
            .max(50)
            .required()
    }),

    savingsProgress: Joi.object({
        amount: Joi.number()
            .required()
            .messages({
                'number.base': 'Amount must be a number'
            })
    }),

    // Schema for the complete financial setup
    financialProfile: Joi.object({
        bankAccounts: Joi.array().items(Joi.object({
            accountNumber: Joi.string()
                .length(4)
                .pattern(/^[0-9]+$/)
                .required(),
            accountName: Joi.string()
                .max(100)
                .required(),
            accountType: Joi.string()
                .valid('checking', 'savings', 'credit_card', 'investment', 'loan', 'other')
                .required(),
            branchName: Joi.string()
                .max(100)
                .allow(null, ''),
            ifscCode: Joi.string()
                .length(11)
                .allow(null, ''),
            micrCode: Joi.string()
                .length(9)
                .allow(null, ''),
            currency: Joi.string()
                .length(3)
                .default('INR'),
            isPrimary: Joi.boolean()
                .default(false),
            openingBalance: Joi.number()
                .min(0)
                .default(0)
        })),

        creditCards: Joi.array().items(Joi.ref('creditCard')),

        incomes: Joi.array().items(Joi.ref('income')),

        savings: Joi.ref('savingsGoal'),

        expenses: Joi.array().items(Joi.object({
            type: Joi.string()
                .allow(null, ''),
            amount: Joi.number()
                .min(0)
                .required(),
            date: Joi.date()
                .iso()
                .required(),
            isRecurring: Joi.boolean()
                .default(false),
            category: Joi.string()
                .max(50)
                .required(),
            subCategory: Joi.string()
                .max(50)
                .allow(null, ''),
            description: Joi.string()
                .max(255)
                .allow(null, ''),
            frequency: Joi.string()
                .valid('one_time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')
                .when('isRecurring', {
                    is: true,
                    then: Joi.required(),
                    otherwise: Joi.optional()
                })
        }))
    })
};

module.exports = schemas;