const ValidationError = require('../../utils/ValidationError');
const logger = require('../../utils/logger');

class FinanceErrorHandler {
    // Base error handler for all financial operations
    static handleFinancialOperationError(error, operation, context = {}) {
        logger.error(`Financial Operation Error during ${operation}:`, { error, context });

        if (error instanceof ValidationError) {
            throw error; // Pass through validation errors
        }

        // Handle Sequelize errors
        if (error.name?.startsWith('Sequelize')) {
            return this.handleDatabaseError(error);
        }

        // Handle specific operation types
        switch (operation.split('_')[0]) {
            case 'transaction':
                return this.handleTransactionError(error, operation);
            case 'investment':
                return this.handleInvestmentError(error, operation);
            case 'debt':
                return this.handleDebtError(error, operation);
            case 'tax':
                return this.handleTaxError(error, operation);
            case 'goal':
                return this.handleGoalError(error, operation);
            case 'budget':
                return this.handleBudgetError(error, operation);
            case 'asset':
                return this.handleAssetError(error, operation);
            case 'networth':
                return this.handleNetWorthError(error, operation);
            default:
                throw new Error(`Error during ${operation}: ${error.message}`);
        }
    }

    // Database specific error handling
    static handleDatabaseError(error) {
        logger.error('Database Error:', error);

        if (error.name === 'SequelizeValidationError') {
            throw new ValidationError('Invalid data: ' + error.message);
        }

        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new ValidationError('Referenced record does not exist');
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new ValidationError('Duplicate record found');
        }

        if (error.name === 'SequelizeConnectionError') {
            throw new Error('Database connection error');
        }

        if (error.name === 'SequelizeTimeoutError') {
            throw new Error('Database operation timed out');
        }

        throw error;
    }

    // Finance API specific error handling
    static handleFinanceAPIError(error) {
        logger.error('Finance API Error:', error);

        if (error.response) {
            if (error.response.status === 429) {
                throw new Error('Rate limit exceeded for financial data API');
            }
            if (error.response.status === 403) {
                throw new Error('Authentication failed for financial data API');
            }
            throw new Error(`Financial API error: ${error.response.data.message || 'Unknown error'}`);
        }

        if (error.request) {
            throw new Error('Network error when accessing financial data');
        }

        throw error;
    }

    // Domain specific error handlers
    static handleTransactionError(error, operation) {
        if (error.message.includes('insufficient funds')) {
            throw new ValidationError('Insufficient funds for this transaction');
        }
        if (error.message.includes('invalid amount')) {
            throw new ValidationError('Invalid transaction amount');
        }
        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleInvestmentError(error, operation) {
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
        if (error.message.includes('payment exceeds balance')) {
            throw new ValidationError('Payment amount exceeds remaining balance');
        }
        if (error.message.includes('invalid payment date')) {
            throw new ValidationError('Invalid payment date provided');
        }
        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleTaxError(error, operation) {
        if (error.message.includes('invalid deduction')) {
            throw new ValidationError('Invalid tax deduction data provided');
        }
        if (error.message.includes('year closed')) {
            throw new ValidationError('Tax year is closed for modifications');
        }
        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleGoalError(error, operation) {
        if (error.message.includes('target date')) {
            throw new ValidationError('Invalid target date: must be in the future');
        }
        if (error.message.includes('contribution exceeds')) {
            throw new ValidationError('Contribution amount exceeds goal target');
        }
        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleBudgetError(error, operation) {
        if (error.message.includes('category limit')) {
            throw new ValidationError('Transaction would exceed category budget limit');
        }
        if (error.message.includes('invalid category')) {
            throw new ValidationError('Invalid budget category specified');
        }
        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleAssetError(error, operation) {
        if (error.message.includes('depreciation')) {
            throw new ValidationError('Invalid depreciation calculation parameters');
        }
        if (error.message.includes('valuation')) {
            throw new ValidationError('Invalid asset valuation data');
        }
        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    static handleNetWorthError(error, operation) {
        if (error.message.includes('calculation error')) {
            throw new ValidationError('Error calculating net worth components');
        }
        if (error.message.includes('invalid date range')) {
            throw new ValidationError('Invalid date range for net worth calculation');
        }
        throw new Error(`Error during ${operation}: ${error.message}`);
    }

    // Utility method to wrap async route handlers
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