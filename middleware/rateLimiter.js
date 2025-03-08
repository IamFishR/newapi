const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Parse exempt URLs from environment variable
const exemptUrls = (process.env.RATE_LIMIT_EXEMPT_URLS || '').split(',').filter(Boolean);

// Check if rate limiting is enabled
const isRateLimitEnabled = process.env.RATE_LIMIT_ENABLED !== 'false';

// Helper function to create middleware that skips rate limiting for exempt URLs or when disabled globally
const createConditionalRateLimiter = (limiterConfig) => {
    const rateLimiter = rateLimit(limiterConfig);
    
    return (req, res, next) => {
        // Skip rate limiting if disabled globally
        if (!isRateLimitEnabled) {
            return next();
        }
        
        // Skip rate limiting for exempt URLs
        if (exemptUrls.some(url => req.path.startsWith(url))) {
            return next();
        }
        
        // Apply rate limiting for non-exempt URLs
        return rateLimiter(req, res, next);
    };
};

// General API rate limiter
const apiLimiter = createConditionalRateLimiter({
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, 
    max: parseInt(process.env.API_RATE_LIMIT_MAX) || 400
});

// Auth endpoints rate limiter (more strict)
const authLimiter = createConditionalRateLimiter({
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 60,
    message: 'Too many login attempts, please try again later'
});

// Sync endpoints rate limiter
const syncLimiter = createConditionalRateLimiter({
    windowMs: parseInt(process.env.SYNC_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000,
    max: parseInt(process.env.SYNC_RATE_LIMIT_MAX) || 120
});

module.exports = {
    apiLimiter,
    authLimiter,
    syncLimiter
};