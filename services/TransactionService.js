const { Transaction, BudgetCategory, BankAccount, sequelize } = require('../models');
const { Op } = require('sequelize');

class TransactionService {
    /**
     * Create a new transaction
     * 
     * @param {Object} transactionData - Transaction data
     * @returns {Promise<Object>} - Created transaction
     */
    async createTransaction(transactionData) {
        return Transaction.create(transactionData);
    }

    /**
     * Get transaction by ID
     * 
     * @param {string} id - Transaction ID
     * @returns {Promise<Object|null>} - Transaction or null if not found
     */
    async getTransactionById(id) {
        return Transaction.findByPk(id, {
            include: [
                {
                    model: BudgetCategory,
                    as: 'category'
                },
                {
                    model: BankAccount,
                    as: 'account'
                }
            ]
        });
    }

    /**
     * Get all transactions for a user
     * 
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - List of transactions and count
     */
    async getUserTransactions(userId, options = {}) {
        const { 
            categoryId, 
            accountId,
            type, 
            startDate, 
            endDate, 
            limit = 20, 
            offset = 0,
            sortBy = 'date',
            sortOrder = 'DESC'
        } = options;
        
        const where = { user_id: userId };
        
        if (categoryId) {
            where.category_id = categoryId;
        }

        if (accountId) {
            where.account_id = accountId;
        }
        
        if (type) {
            where.type = type;
        }
        
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                where.date[Op.lte] = new Date(endDate);
            }
        }
        
        const orderColumn = sortBy === 'amount' || sortBy === 'date' ? sortBy : 'date';
        const order = [[orderColumn, sortOrder]];
        
        return Transaction.findAndCountAll({
            where,
            order,
            limit,
            offset,
            include: [
                {
                    model: BudgetCategory,
                    as: 'category'
                },
                {
                    model: BankAccount,
                    as: 'account',
                    attributes: ['id', 'account_number', 'bank_name', 'account_name']
                }
            ]
        });
    }

    /**
     * Update a transaction
     * 
     * @param {string} id - Transaction ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} - Updated transaction
     */
    async updateTransaction(id, updateData) {
        const transaction = await Transaction.findByPk(id);
        
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        
        const oldAccountId = transaction.account_id;
        const newAccountId = updateData.account_id;
        
        // Update the transaction
        await transaction.update(updateData);
        
        // If account_id was changed, update the balances of both old and new accounts
        if (oldAccountId !== newAccountId) {
            const BankAccountService = require('./BankAccountService');
            
            // Update old account balance if it exists
            if (oldAccountId) {
                await BankAccountService.updateAccountBalance(oldAccountId);
            }
            
            // Update new account balance if it exists
            if (newAccountId) {
                await BankAccountService.updateAccountBalance(newAccountId);
            }
        }
        
        return transaction;
    }

    /**
     * Delete a transaction
     * 
     * @param {string} id - Transaction ID
     * @returns {Promise<boolean>} - Success status
     */
    async deleteTransaction(id) {
        const transaction = await Transaction.findByPk(id);
        
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        
        const accountId = transaction.account_id;
        
        // Delete the transaction
        await transaction.destroy();
        
        // Update account balance if this transaction was associated with an account
        if (accountId) {
            const BankAccountService = require('./BankAccountService');
            await BankAccountService.updateAccountBalance(accountId);
        }
        
        return true;
    }

    /**
     * Process and import multiple transactions at once, typically from bank statement import
     * 
     * @param {string} userId - User ID
     * @param {Array<Object>} transactions - Array of transaction objects from bank statement
     * @param {string} accountId - Bank account ID to associate with transactions
     * @returns {Promise<Array<Object>>} - Array of created transactions
     */
    async processBulkTransactions(userId, transactions, accountId) {
        const dbTransaction = await sequelize.transaction();
        
        try {
            // Validate that the account belongs to the user
            if (accountId) {
                const BankAccountService = require('./BankAccountService');
                const account = await BankAccountService.getAccountById(accountId);
                
                if (!account) {
                    throw new Error('Bank account not found');
                }
                
                if (account.user_id !== userId) {
                    throw new Error('You do not have permission to access this account');
                }
            }
            
            // First, get all existing categories for this user
            const categories = await BudgetCategory.findAll({
                where: { user_id: userId }
            });
            
            // Map of category name -> category id for quick lookup
            const categoryMap = new Map();
            categories.forEach(category => {
                categoryMap.set(category.name.toLowerCase(), category.id);
            });
            
            // Find existing transactions with same description, amount and date to avoid duplicates
            // Creating a signature for each transaction using description + amount + date
            const existingTransactions = await Transaction.findAll({
                where: {
                    user_id: userId,
                    account_id: accountId || null
                },
                raw: true
            });
            
            const existingSignatures = new Set();
            existingTransactions.forEach(tx => {
                // Create a signature combining description, amount, and date to detect duplicates
                const date = tx.date ? new Date(tx.date).toISOString().split('T')[0] : '';
                const signature = `${tx.description}|${tx.amount}|${date}`;
                existingSignatures.add(signature);
            });
            
            // Process each transaction
            const processedTransactions = [];
            
            for (const txData of transactions) {
                // Basic validation
                if (!txData.description || !txData.amount || !txData.date) {
                    continue; // Skip invalid transactions
                }
                
                // Create a signature for this transaction to check for duplicates
                const date = new Date(txData.date).toISOString().split('T')[0];
                const signature = `${txData.description}|${txData.amount}|${date}`;
                
                // Skip if it's a duplicate
                if (existingSignatures.has(signature)) {
                    continue;
                }
                
                // Find or create a category for this transaction
                let categoryId;
                if (txData.category) {
                    const categoryNameLower = txData.category.toLowerCase();
                    
                    // Check if the category already exists
                    if (categoryMap.has(categoryNameLower)) {
                        categoryId = categoryMap.get(categoryNameLower);
                    } else {
                        // Create new category
                        const newCategory = await BudgetCategory.create({
                            user_id: userId,
                            name: txData.category,
                            is_default: false
                        }, { transaction: dbTransaction });
                        
                        // Add to our map
                        categoryId = newCategory.id;
                        categoryMap.set(categoryNameLower, categoryId);
                    }
                } else {
                    // Use "Other" category if not specified
                    // Try to find a default "Other" category first
                    let otherCategory = categories.find(c => 
                        c.name.toLowerCase() === 'other' || c.name.toLowerCase() === 'miscellaneous');
                    
                    if (!otherCategory) {
                        // Create an "Other" category if it doesn't exist
                        otherCategory = await BudgetCategory.create({
                            user_id: userId,
                            name: 'Other',
                            is_default: true
                        }, { transaction: dbTransaction });
                    }
                    
                    categoryId = otherCategory.id;
                }
                
                // Create the transaction
                const newTransaction = await Transaction.create({
                    user_id: userId,
                    account_id: accountId,
                    category_id: categoryId,
                    description: txData.description,
                    amount: txData.amount,
                    type: txData.type,
                    date: new Date(txData.date),
                    recurring_type: 'none'
                }, { transaction: dbTransaction });
                
                processedTransactions.push(newTransaction);
                
                // Add to our set of signatures to avoid duplicates within this batch
                existingSignatures.add(signature);
            }
            
            await dbTransaction.commit();
            return processedTransactions;
        } catch (error) {
            await dbTransaction.rollback();
            throw error;
        }
    }

    /**
     * Get transactions by account ID
     * 
     * @param {string} accountId - Bank account ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Transactions for the specified account
     */
    async getTransactionsByAccountId(accountId, options = {}) {
        const { startDate, endDate, limit = 20, offset = 0, type } = options;
        
        const where = { account_id: accountId };
        
        if (type) {
            where.type = type;
        }
        
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                where.date[Op.lte] = new Date(endDate);
            }
        }
        
        return Transaction.findAndCountAll({
            where,
            order: [['date', 'DESC']],
            limit,
            offset,
            include: [
                {
                    model: BudgetCategory,
                    as: 'category'
                }
            ]
        });
    }

    /**
     * Assign transactions to an account in bulk
     * 
     * @param {string} accountId - Bank account ID
     * @param {Array<string>} transactionIds - Array of transaction IDs to assign
     * @returns {Promise<Object>} - Results of the bulk update
     */
    async assignTransactionsToAccount(accountId, transactionIds) {
        const transaction = await sequelize.transaction();
        
        try {
            // Check if account exists
            const BankAccountService = require('./BankAccountService');
            const account = await BankAccountService.getAccountById(accountId);
            
            if (!account) {
                throw new Error('Bank account not found');
            }
            
            // Bulk update the transactions
            const result = await Transaction.update(
                { account_id: accountId },
                {
                    where: {
                        id: {
                            [Op.in]: transactionIds
                        },
                        user_id: account.user_id // Ensure these transactions belong to the same user
                    },
                    transaction
                }
            );
            
            // Update the account balance
            await BankAccountService.updateAccountBalance(accountId);
            
            await transaction.commit();
            
            return {
                updatedCount: result[0],
                accountId,
                transactionIds
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get transaction statistics for a user
     * 
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Transaction statistics
     */
    async getTransactionStats(userId, options = {}) {
        const { startDate, endDate, accountId } = options;
        
        const where = { user_id: userId };
        
        if (accountId) {
            where.account_id = accountId;
        }
        
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                where.date[Op.lte] = new Date(endDate);
            }
        }
        
        // Get total income
        const totalIncome = await Transaction.sum('amount', {
            where: {
                ...where,
                type: 'income'
            }
        }) || 0;
        
        // Get total expenses
        const totalExpenses = await Transaction.sum('amount', {
            where: {
                ...where,
                type: 'expense'
            }
        }) || 0;
        
        // Get transaction counts
        const incomeCount = await Transaction.count({
            where: {
                ...where,
                type: 'income'
            }
        });
        
        const expenseCount = await Transaction.count({
            where: {
                ...where,
                type: 'expense'
            }
        });
        
        return {
            totalIncome,
            totalExpenses,
            netChange: totalIncome - totalExpenses,
            incomeCount,
            expenseCount,
            totalCount: incomeCount + expenseCount
        };
    }
}

module.exports = new TransactionService();