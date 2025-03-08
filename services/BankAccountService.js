const { BankAccount, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');
const LoggingService = require('./monitoring/LoggingService');

class BankAccountService {
    /**
     * Create a new bank account for a user
     * 
     * @param {Object} accountData - Bank account data
     * @returns {Promise<Object>} - Created bank account
     */
    async createAccount(accountData) {
        const transaction = await sequelize.transaction();
        
        try {
            // If this is marked as primary, unset any existing primary accounts for this user
            if (accountData.is_primary) {
                await BankAccount.update(
                    { is_primary: false },
                    { 
                        where: { 
                            user_id: accountData.user_id,
                            is_primary: true
                        },
                        transaction
                    }
                );
            }
            
            // Create the new account
            const account = await BankAccount.create(accountData, { transaction });
            
            // Log the creation
            LoggingService.logDebug(`Bank account created: ${account.id}`, {
                context: 'BankAccountService.createAccount',
                accountId: account.id,
                userId: accountData.user_id
            });

            await transaction.commit();
            return account;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get bank account by ID
     * 
     * @param {string} id - Account ID
     * @returns {Promise<Object|null>} - Bank account or null if not found
     */
    async getAccountById(id) {
        return BankAccount.findByPk(id);
    }

    /**
     * Get all bank accounts for a user
     * 
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - List of bank accounts
     */
    async getUserAccounts(userId, options = {}) {
        const { status, limit = 10, offset = 0 } = options;
        
        const query = {
            where: { user_id: userId },
            order: [
                ['is_primary', 'DESC'],
                ['created_at', 'DESC']
            ],
            limit,
            offset
        };

        if (status) {
            query.where.status = status;
        }
        
        return BankAccount.findAndCountAll(query);
    }

    /**
     * Find a user's bank account by account number
     * 
     * @param {number} userId - User ID
     * @param {string} accountNumber - Account number to find
     * @param {string} bankName - Optional bank name to make search more specific
     * @returns {Promise<Object|null>} - Bank account if found, null otherwise
     */
    async findUserAccountByNumber(userId, accountNumber, bankName = null) {
        try {
            const whereClause = {
                user_id: userId,
                account_number: accountNumber
            };

            if (bankName) {
                whereClause.bank_name = bankName;
            }

            const account = await BankAccount.findOne({
                where: whereClause
            });
            return account;
        } catch (error) {
            LoggingService.logError('Error finding user account by number:', error);
            throw error;
        }
    }

    /**
     * Update a bank account
     * 
     * @param {string} id - Account ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} - Updated bank account
     */
    async updateAccount(id, updateData) {
        const transaction = await sequelize.transaction();
        
        try {
            const account = await BankAccount.findByPk(id, { transaction });
            
            if (!account) {
                throw new Error('Account not found');
            }
            
            // If setting this account as primary, unset any existing primary accounts
            if (updateData.is_primary && !account.is_primary) {
                await BankAccount.update(
                    { is_primary: false },
                    { 
                        where: { 
                            user_id: account.user_id,
                            is_primary: true
                        },
                        transaction
                    }
                );
            }
            
            await account.update(updateData, { transaction });
            
            await transaction.commit();
            return account;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Delete a bank account
     * 
     * @param {string} id - Account ID
     * @returns {Promise<boolean>} - Success status
     */
    async deleteAccount(id) {
        const transaction = await sequelize.transaction();
        
        try {
            const account = await BankAccount.findByPk(id, { transaction });
            
            if (!account) {
                throw new Error('Account not found');
            }
            
            // Check if transactions exist for this account
            const transactionCount = await Transaction.count({
                where: { account_id: id }
            });
            
            if (transactionCount > 0) {
                // If transactions exist, perform a soft delete
                await account.destroy({ transaction });
            } else {
                // If no transactions, perform a hard delete
                await BankAccount.destroy({
                    where: { id },
                    force: true,
                    transaction
                });
            }
            
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    
    /**
     * Update account balance based on transactions
     * 
     * @param {string} accountId - Account ID
     * @returns {Promise<Object>} - Updated account with new balance
     */
    async updateAccountBalance(accountId) {
        const transaction = await sequelize.transaction();
        
        try {
            const account = await BankAccount.findByPk(accountId, { transaction });
            
            if (!account) {
                throw new Error('Account not found');
            }
            
            // Get sum of all income transactions
            const incomeSum = await Transaction.sum('amount', {
                where: { 
                    account_id: accountId, 
                    type: 'income'
                },
                transaction
            }) || 0;
            
            // Get sum of all expense transactions
            const expenseSum = await Transaction.sum('amount', {
                where: { 
                    account_id: accountId, 
                    type: 'expense'
                },
                transaction
            }) || 0;
            
            // Calculate current balance
            const currentBalance = account.opening_balance + incomeSum - expenseSum;
            
            // Update account with new balance
            await account.update({ 
                current_balance: currentBalance,
                last_synced_at: new Date()
            }, { transaction });
            
            await transaction.commit();
            return account;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = BankAccountService;