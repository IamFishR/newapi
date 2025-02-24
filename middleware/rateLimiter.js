const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Auth endpoints rate limiter (more strict)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 15, // limit each IP to 5 login attempts per hour
    message: 'Too many login attempts, please try again later'
});

// Sync endpoints rate limiter
const syncLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30 // limit each IP to 30 sync requests per 5 minutes
});

module.exports = {
    apiLimiter,
    authLimiter,
    syncLimiter
};