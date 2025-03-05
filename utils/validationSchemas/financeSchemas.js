const Joi = require('joi');

const schemas = {
    financialProfile: Joi.object({
        monthlyIncome: Joi.number().min(0).required(),
        monthlySavingsGoal: Joi.number().min(0).required(),
        currentSavings: Joi.number().min(0).required(),
        monthlyExpenses: Joi.object({
            housing: Joi.number().min(0).required(),
            utilities: Joi.number().min(0).required(),
            transportation: Joi.number().min(0).required(),
            groceries: Joi.number().min(0).required(),
            healthcare: Joi.number().min(0).required(),
            entertainment: Joi.number().min(0).required(),
            other: Joi.number().min(0).required()
        }).required(),
        investmentProfile: Joi.object({
            currentInvestments: Joi.number().min(0).required(),
            monthlyInvestmentGoal: Joi.number().min(0).required(),
            riskTolerance: Joi.string().valid('low', 'medium', 'high').required()
        }).required()
    }),

    budgetCategory: Joi.object({
        name: Joi.string().max(100).required(),
        budgetedAmount: Joi.number().min(0).required(),
        color: Joi.string().pattern(/^#[0-9A-F]{6}$/i),
        isDefault: Joi.boolean()
    }),

    transaction: Joi.object({
        categoryId: Joi.string().uuid().required(),
        date: Joi.date().required(),
        description: Joi.string().max(255).required(),
        amount: Joi.number().positive().required(),
        type: Joi.string().valid('income', 'expense').required(),
        recurringType: Joi.string().valid('none', 'daily', 'weekly', 'monthly', 'yearly'),
        recurringEndDate: Joi.date().when('recurringType', {
            is: 'none',
            then: Joi.forbidden(),
            otherwise: Joi.required()
        })
    }),

    debtItem: Joi.object({
        name: Joi.string().max(100).required(),
        type: Joi.string().valid('credit_card', 'loan', 'mortgage', 'other').required(),
        balance: Joi.number().min(0).required(),
        interestRate: Joi.number().min(0).max(100).required(),
        minimumPayment: Joi.number().min(0).required(),
        dueDate: Joi.date().required()
    }),

    debtPayment: Joi.object({
        amount: Joi.number().positive().required(),
        paymentDate: Joi.date().required(),
        paymentMethod: Joi.string().max(50),
        notes: Joi.string()
    }),

    financialGoal: Joi.object({
        name: Joi.string().max(100).required(),
        targetAmount: Joi.number().positive().required(),
        currentAmount: Joi.number().min(0),
        targetDate: Joi.date().greater('now').required(),
        category: Joi.string().valid('savings', 'investment', 'property', 'education', 'retirement', 'other').required(),
        priority: Joi.string().valid('low', 'medium', 'high'),
        monthlyContribution: Joi.number().min(0),
        notes: Joi.string()
    }),

    investment: Joi.object({
        symbol: Joi.string().max(20).required(),
        shares: Joi.number().positive().required(),
        purchasePrice: Joi.number().positive().required(),
        type: Joi.string().valid('stock', 'etf', 'mutual_fund', 'crypto', 'other').required(),
        purchaseDate: Joi.date().required(),
        notes: Joi.string()
    }),

    investmentTransaction: Joi.object({
        type: Joi.string().valid('buy', 'sell').required(),
        shares: Joi.number().positive().required(),
        pricePerShare: Joi.number().positive().required(),
        date: Joi.date().required()
    }),

    asset: Joi.object({
        name: Joi.string().max(100).required(),
        category: Joi.string().valid('cash', 'investments', 'property', 'vehicle', 'other').required(),
        value: Joi.number().min(0).required(),
        purchaseValue: Joi.number().min(0),
        purchaseDate: Joi.date(),
        description: Joi.string()
    }),

    liability: Joi.object({
        name: Joi.string().max(100).required(),
        category: Joi.string().valid('mortgage', 'loan', 'credit_card', 'other').required(),
        amount: Joi.number().min(0).required(),
        interestRate: Joi.number().min(0).max(100).required(),
        minimumPayment: Joi.number().min(0),
        paymentDueDate: Joi.number().min(1).max(31),
        lender: Joi.string().max(100),
        accountNumber: Joi.string().max(50),
        notes: Joi.string()
    }),

    taxProfile: Joi.object({
        filingStatus: Joi.string().valid('single', 'married_joint', 'married_separate', 'head_household').required(),
        estimatedIncome: Joi.number().min(0).required(),
        estimatedDeductions: Joi.number().min(0),
        estimatedTaxCredits: Joi.number().min(0),
        withholdingAmount: Joi.number().min(0)
    }),

    taxDeduction: Joi.object({
        category: Joi.string().max(100).required(),
        description: Joi.string().max(255).required(),
        amount: Joi.number().positive().required(),
        date: Joi.date().required(),
        status: Joi.string().valid('verified', 'pending'),
        documentUrls: Joi.array().items(Joi.string().uri()),
        notes: Joi.string()
    }),

    // Analytics parameters
    dateRange: Joi.object({
        startDate: Joi.date().required(),
        endDate: Joi.date().min(Joi.ref('startDate')).required()
    }),

    payoffStrategy: Joi.object({
        strategy: Joi.string().valid('avalanche', 'snowball').required(),
        additionalPayment: Joi.number().min(0)
    })
};

module.exports = schemas;