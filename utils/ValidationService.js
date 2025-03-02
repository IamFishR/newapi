const Joi = require('joi');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

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

const taskManagementSchemas = {
    project: {
        type: 'object',
        required: ['name', 'code'],
        properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            code: { type: 'string', minLength: 1, maxLength: 10 },
            description: { type: 'string' },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['active', 'completed', 'on_hold', 'cancelled'] }
        }
    },
    projectUpdate: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            code: { type: 'string', minLength: 1, maxLength: 10 },
            description: { type: 'string' },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['active', 'completed', 'on_hold', 'cancelled'] }
        }
    },
    sprint: {
        type: 'object',
        required: ['name', 'project_id'],
        properties: {
            project_id: { type: 'integer' },
            name: { type: 'string', minLength: 1, maxLength: 100 },
            goal: { type: 'string' },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['planned', 'active', 'completed', 'cancelled'] }
        }
    },
    sprintUpdate: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            goal: { type: 'string' },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['planned', 'active', 'completed', 'cancelled'] }
        }
    },
    task: {
        type: 'object',
        required: ['title', 'project_id', 'type_id', 'priority_id'],
        properties: {
            project_id: { type: 'integer' },
            sprint_id: { type: 'integer' },
            parent_task_id: { type: 'integer' },
            type_id: { type: 'integer' },
            priority_id: { type: 'integer' },
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string' },
            status: { type: 'string', enum: ['todo', 'in_progress', 'in_review', 'done', 'cancelled'] },
            estimated_hours: { type: 'number', minimum: 0 },
            assigned_to: { type: 'integer' },
            reporter: { type: 'integer' },
            due_date: { type: 'string', format: 'date' }
        }
    },
    taskUpdate: {
        type: 'object',
        properties: {
            sprint_id: { type: 'integer' },
            parent_task_id: { type: 'integer' },
            type_id: { type: 'integer' },
            priority_id: { type: 'integer' },
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string' },
            status: { type: 'string', enum: ['todo', 'in_progress', 'in_review', 'done', 'cancelled'] },
            estimated_hours: { type: 'number', minimum: 0 },
            assigned_to: { type: 'integer' },
            due_date: { type: 'string', format: 'date' }
        }
    }
};

class ValidationService {
    static async validate(schema, data) {
        try {
            return await schemas[schema].validateAsync(data, { abortEarly: false });
        } catch (error) {
            throw {
                name: 'ValidationError',
                details: error.details.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            };
        }
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

module.exports = {
    ValidationService,
    taskManagementSchemas,
    validate: async (schemaName, data) => {
        const schema = {
            ...schemas,
            ...taskManagementSchemas
        }[schemaName];

        if (!schema) {
            throw new Error(`Schema ${schemaName} not found`);
        }

        // Use Joi for regular schemas and Ajv for task management schemas
        if (schemas[schemaName]) {
            try {
                return await schemas[schemaName].validateAsync(data, { abortEarly: false });
            } catch (error) {
                throw {
                    name: 'ValidationError',
                    details: error.details.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                };
            }
        } else {
            const valid = ajv.validate(schema, data);
            if (!valid) {
                throw {
                    name: 'ValidationError',
                    details: ajv.errors.map(err => ({
                        field: err.instancePath.slice(1),
                        message: err.message
                    }))
                };
            }
            return data;
        }
    }
};