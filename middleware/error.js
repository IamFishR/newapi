const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');

// Custom error types
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log the error
    LoggingService.logError(err, req);

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Validation Error',
            errors: err.details || [{
                field: err.path || 'unknown',
                message: err.message
            }]
        });
    }

    // Handle Sequelize errors
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Database Validation Error',
            errors: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid token. Please log in again.'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Your token has expired. Please log in again.'
        });
    }

    // Handle sync errors
    if (err.name === 'SyncError') {
        return res.status(409).json({
            status: 'fail',
            message: 'Data synchronization failed',
            details: err.details
        });
    }

    // Development error response
    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        });
    }

    // Production error response
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
};

module.exports = {
    AppError,
    errorMiddleware
};