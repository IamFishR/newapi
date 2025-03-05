const ValidationError = require('../../utils/ValidationError');
const logger = require('../../utils/logger');

class FinanceErrorHandler {
    static handleTransactionError(error, operation) {
        logger.error(`Transaction Error during ${operation}:`, error);

        if (error.name === 'SequelizeValidationError') {
            throw new ValidationError('Invalid transaction data: ' + error.message);
        }

        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new ValidationError('Referenced record does not exist');
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new ValidationError('Duplicate record found');
        }

        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleInvestmentError(error, operation) {
        logger.error(`Investment Error during ${operation}:`, error);

        if (error.message.includes('Invalid symbol')) {
            throw new ValidationError('Invalid stock symbol provided');
        }

        if (error.message.includes('insufficient shares')) {
            throw new ValidationError('Insufficient shares for this transaction');
        }

        if (error.message.includes('market closed')) {
            throw new ValidationError('Market is currently closed');
        }

        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleDebtError(error, operation) {
        logger.error(`Debt Error during ${operation}:`, error);

        if (error.message.includes('payment exceeds balance')) {
            throw new ValidationError('Payment amount exceeds remaining balance');
        }

        if (error.message.includes('invalid payment date')) {
            throw new ValidationError('Invalid payment date provided');
        }

        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleTaxError(error, operation) {
        logger.error(`Tax Error during ${operation}:`, error);

        if (error.message.includes('invalid deduction')) {
            throw new ValidationError('Invalid tax deduction data provided');
        }

        if (error.message.includes('year closed')) {
            throw new ValidationError('Tax year is closed for modifications');
        }

        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleGoalError(error, operation) {
        logger.error(`Goal Error during ${operation}:`, error);

        if (error.message.includes('target date')) {
            throw new ValidationError('Invalid target date: must be in the future');
        }

        if (error.message.includes('contribution exceeds')) {
            throw new ValidationError('Contribution amount exceeds goal target');
        }

        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleBudgetError(error, operation) {
        logger.error(`Budget Error during ${operation}:`, error);

        if (error.message.includes('category limit')) {
            throw new ValidationError('Transaction would exceed category budget limit');
        }

        if (error.message.includes('invalid category')) {
            throw new ValidationError('Invalid budget category specified');
        }

        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleAssetError(error, operation) {
        logger.error(`Asset Error during ${operation}:`, error);

        if (error.message.includes('depreciation')) {
            throw new ValidationError('Invalid depreciation calculation parameters');
        }

        if (error.message.includes('valuation')) {
            throw new ValidationError('Invalid asset valuation data');
        }

        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleNetWorthError(error, operation) {
        logger.error(`Net Worth Error during ${operation}:`, error);

        if (error.message.includes('calculation error')) {
            throw new ValidationError('Error calculating net worth components');
        }

        if (error.message.includes('invalid date range')) {
            throw new ValidationError('Invalid date range for net worth calculation');
        }

        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleFinanceAPIError(error) {
        logger.error('Finance API Error:', error);

        if (error.response) {
            // Handle external API errors
            if (error.response.status === 429) {
                throw new Error('Rate limit exceeded for financial data API');
            }
            if (error.response.status === 403) {
                throw new Error('Authentication failed for financial data API');
            }
            throw new Error(`Financial API error: ${error.response.data.message || 'Unknown error'}`);
        }

        if (error.request) {
            // Handle network errors
            throw new Error('Network error when accessing financial data');
        }

        throw error;
    }

    static handleDatabaseError(error) {
        logger.error('Database Error:', error);

        if (error.name === 'SequelizeConnectionError') {
            throw new Error('Database connection error');
        }

        if (error.name === 'SequelizeTimeoutError') {
            throw new Error('Database operation timed out');
        }

        throw error;
    }

    static wrapAsync(fn) {
        return async function(req, res, next) {
            try {
                await fn(req, res, next);
            } catch (error) {
                if (error instanceof ValidationError) {
                    return res.status(400).json({
                        status: 'error',
                        message: error.message
                    });
                }

                logger.error('Unhandled Error:', error);
                next(error);
            }
        };
    }
}

module.exports = FinanceErrorHandler;