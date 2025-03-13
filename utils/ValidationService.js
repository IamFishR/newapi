const Joi = require('joi');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const financeSchemas = require('./validationSchemas/financeSchemas');
const ValidationError = require('../utils/ValidationError');

const schemas = {
    user: Joi.object({
        username: Joi.string().min(3).max(100).required()
            .messages({
                'string.min': 'Username must be at least 3 characters long',
                'string.max': 'Username cannot be longer than 100 characters',
                'any.required': 'Username is required'
            }),
        email: Joi.string().email().max(100).required()
            .messages({
                'string.email': 'Please enter a valid email address',
                'string.max': 'Email cannot be longer than 100 characters',
                'any.required': 'Email is required'
            }),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*]{6,30}$')).required()
            .messages({
                'string.pattern.base': 'Password must be 6-30 characters and can contain letters, numbers, and special characters (!@#$%^&*)',
                'any.required': 'Password is required'
            }),
        role: Joi.string().valid('admin', 'user', 'analyst', 'guest').default('user'),
        avatar: Joi.string().uri().allow('', null),
        bio: Joi.string().max(500).allow('', null),
        social_media: Joi.object({
            twitter: Joi.string().uri().allow('', null),
            linkedin: Joi.string().uri().allow('', null),
            github: Joi.string().uri().allow('', null)
        }).allow(null)
    }),

    userPreferences: Joi.object({
        theme: Joi.string().valid('light', 'dark').default('light'),
        language: Joi.string().valid('en', 'es', 'fr', 'de').default('en'),
        bio: Joi.string().max(500).allow('', null),
        avatar_url: Joi.string().uri().allow('', null),
        social_media: Joi.object({
            twitter: Joi.string().uri().allow('', null),
            linkedin: Joi.string().uri().allow('', null),
            github: Joi.string().uri().allow('', null)
        }).allow(null),
        notification_preferences: Joi.object({
            email: Joi.boolean().default(true),
            push: Joi.boolean().default(true),
            price_alerts: Joi.boolean().default(true),
            portfolio_updates: Joi.boolean().default(true),
            market_news: Joi.boolean().default(true),
            dividend_alerts: Joi.boolean().default(true)
        })
    }),

    portfolio: Joi.object({
        symbol: Joi.string().required(),
        quantity: Joi.number().integer().min(0).required(),
        average_price: Joi.number().min(0).required()
    }),

    transaction: Joi.object({
        symbol: Joi.string().required(),
        transaction_type: Joi.string().valid('BUY', 'SELL').required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required()
    }),

    // Add company validation schemas
    company: Joi.object({
        symbol: Joi.string().max(20).required()
            .messages({
                'string.max': 'Symbol cannot be longer than 20 characters',
                'any.required': 'Symbol is required'
            }),
        company_name: Joi.string().max(100).required()
            .messages({
                'string.max': 'Company name cannot be longer than 100 characters',
                'any.required': 'Company name is required'
            }),
        isin: Joi.string().length(12).required()
            .messages({
                'string.length': 'ISIN must be exactly 12 characters',
                'any.required': 'ISIN is required'
            }),
        listing_date: Joi.date().allow(null),
        face_value: Joi.number().min(0).precision(2).allow(null),
        issued_size: Joi.number().integer().min(0).allow(null),
        industry: Joi.string().max(100).allow(null),
        sector: Joi.string().max(100).allow(null),
        macro_sector: Joi.string().max(100).allow(null),
        basic_industry: Joi.string().max(100).allow(null)
    }),

    companyUpdate: Joi.object({
        company_name: Joi.string().max(100)
            .messages({
                'string.max': 'Company name cannot be longer than 100 characters'
            }),
        isin: Joi.string().length(12)
            .messages({
                'string.length': 'ISIN must be exactly 12 characters'
            }),
        listing_date: Joi.date().allow(null),
        face_value: Joi.number().min(0).precision(2).allow(null),
        issued_size: Joi.number().integer().min(0).allow(null),
        industry: Joi.string().max(100).allow(null),
        sector: Joi.string().max(100).allow(null),
        macro_sector: Joi.string().max(100).allow(null),
        basic_industry: Joi.string().max(100).allow(null)
    }),

    // New validation schemas for financial data
    financialResult: Joi.object({
        symbol: Joi.string().max(20).required(),
        from_date: Joi.date().required(),
        to_date: Joi.date().required(),
        expenditure: Joi.number().min(0).precision(2).allow(null),
        income: Joi.number().min(0).precision(2).allow(null),
        profit_before_tax: Joi.number().precision(2).allow(null),
        profit_after_tax: Joi.number().precision(2).allow(null),
        eps: Joi.number().precision(2).allow(null),
        is_audited: Joi.boolean().default(false),
        is_cumulative: Joi.boolean().default(false),
        is_consolidated: Joi.boolean().default(false),
        xbrl_attachment_url: Joi.string().uri().allow('', null),
        notes_attachment_url: Joi.string().uri().allow('', null)
    }),

    financialResultUpdate: Joi.object({
        expenditure: Joi.number().min(0).precision(2).allow(null),
        income: Joi.number().min(0).precision(2).allow(null),
        profit_before_tax: Joi.number().precision(2).allow(null),
        profit_after_tax: Joi.number().precision(2).allow(null),
        eps: Joi.number().precision(2).allow(null),
        is_audited: Joi.boolean(),
        is_cumulative: Joi.boolean(),
        is_consolidated: Joi.boolean(),
        xbrl_attachment_url: Joi.string().uri().allow('', null),
        notes_attachment_url: Joi.string().uri().allow('', null)
    }),

    // Market data validation schemas
    priceData: Joi.object({
        symbol: Joi.string().max(20).required(),
        date: Joi.date().required(),
        last_price: Joi.number().precision(2).allow(null),
        previous_close: Joi.number().precision(2).allow(null),
        open_price: Joi.number().precision(2).allow(null),
        high_price: Joi.number().precision(2).allow(null),
        low_price: Joi.number().precision(2).allow(null),
        close_price: Joi.number().precision(2).allow(null),
        vwap: Joi.number().precision(2).allow(null),
        volume: Joi.number().integer().min(0).allow(null),
        traded_value: Joi.number().precision(2).min(0).allow(null),
        market_cap: Joi.number().precision(2).min(0).allow(null)
    }),

    // Corporate action validation schema
    corporateAction: Joi.object({
        symbol: Joi.string().max(20).required(),
        ex_date: Joi.date().required(),
        purpose: Joi.string().max(255).required()
    }),

    // Board meeting validation schema
    boardMeeting: Joi.object({
        symbol: Joi.string().max(20).required(),
        meeting_date: Joi.date().required(),
        purpose: Joi.string().required()
    }),

    // Shareholding pattern validation schema
    shareholdingPattern: Joi.object({
        symbol: Joi.string().max(20).required(),
        period_end_date: Joi.date().required(),
        promoter_group_percentage: Joi.number().precision(2).min(0).max(100).allow(null),
        public_percentage: Joi.number().precision(2).min(0).max(100).allow(null),
        employee_trusts_percentage: Joi.number().precision(2).min(0).max(100).allow(null)
    })
};

// Convert task management schemas to Joi format
const taskSchemas = {
    task: Joi.object({
        project_id: Joi.number().integer().required()
            .messages({
                'number.base': 'Project ID must be a number',
                'any.required': 'Project ID is required'
            }),
        sprint_id: Joi.number().integer()
            .messages({
                'number.base': 'Sprint ID must be a number'
            }),
        parent_task_id: Joi.number().integer()
            .messages({
                'number.base': 'Parent task ID must be a number'
            }),
        type_id: Joi.number().integer()
            .messages({
                'number.base': 'Task type ID must be a number'
            }),
        type: Joi.string()
            .valid('Task', 'Bug', 'Feature', 'Epic', 'Story')
            .messages({
                'any.only': 'Task type must be one of: Task, Bug, Feature, Epic, Story'
            }),
        priority_id: Joi.number().integer()
            .messages({
                'number.base': 'Priority ID must be a number'
            }),
        priority: Joi.string()
            .valid('Critical', 'High', 'Medium', 'Low')
            .messages({
                'any.only': 'Priority must be one of: Critical, High, Medium, Low'
            }),
        title: Joi.string().min(1).max(200).required()
            .messages({
                'string.min': 'Title cannot be empty',
                'string.max': 'Title cannot be longer than 200 characters',
                'any.required': 'Title is required'
            }),
        description: Joi.string().allow('', null)
            .messages({
                'string.base': 'Description must be text'
            }),
        status: Joi.string().valid('todo', 'in_progress', 'in_review', 'done', 'cancelled').default('todo')
            .messages({
                'any.only': 'Status must be one of: todo, in_progress, in_review, done, cancelled'
            }),
        estimated_hours: Joi.number().min(0)
            .messages({
                'number.base': 'Estimated hours must be a number',
                'number.min': 'Estimated hours cannot be negative'
            }),
        due_date: Joi.date()
            .messages({
                'date.base': 'Due date must be a valid date'
            })
    }).custom((obj, helpers) => {
        // Either type_id or type must be provided
        if (!obj.type_id && !obj.type) {
            return helpers.message('Either task type ID or task type name must be provided');
        }
        // Either priority_id or priority must be provided
        if (!obj.priority_id && !obj.priority) {
            return helpers.message('Either priority ID or priority name must be provided');
        }
        return obj;
    })
};

class ValidationService {
    static async validate(schemaName, data) {
        const schema = this.getSchema(schemaName);
        if (!schema) {
            throw new ValidationError(`No validation schema found for ${schemaName}`);
        }

        try {
            return await schema.validateAsync(data, {
                abortEarly: false,
                stripUnknown: true
            });
        } catch (error) {
            const validationError = new ValidationError('Validation Error');
            validationError.details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            throw validationError;
        }
    }

    static getSchema(name) {
        // First check main schemas
        if (schemas[name]) {
            return schemas[name];
        }

        // Then check finance schemas
        if (financeSchemas[name]) {
            return financeSchemas[name];
        }

        // Check task management schemas
        if (taskSchemas[name]) {
            return taskSchemas[name];
        }

        // No schema found
        return null;
    }

    static sanitizeUserData(userData) {
        const allowedFields = [
            'user_id', 'name', 'email', 'role', 'avatar',
            'bio', 'social_media', 'created_at'
        ];
        
        return Object.keys(userData)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = userData[key];
                return obj;
            }, {});
    }
}

module.exports = ValidationService;