const Joi = require('joi');

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
    })
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

module.exports = ValidationService;