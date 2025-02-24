const xss = require('xss');
const validator = require('validator');
const { AppError } = require('./error');

const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = xss(value.trim());
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item => 
                typeof item === 'string' ? xss(item.trim()) : item
            );
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

const sanitizer = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }
    next();
};

const validateEmail = (email) => {
    if (!validator.isEmail(email)) {
        throw new AppError('Invalid email format', 400);
    }
};

const validatePassword = (password) => {
    if (!validator.isLength(password, { min: 8 })) {
        throw new AppError('Password must be at least 8 characters long', 400);
    }
    if (!validator.matches(password, /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)) {
        throw new AppError('Password must contain at least one letter and one number', 400);
    }
};

module.exports = {
    sanitizer,
    validateEmail,
    validatePassword
};