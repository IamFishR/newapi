const fs = require('fs');
const path = require('path');
const { parseHDFCStatement } = require('./parsers/hdfcParser');
const { parseICICIStatement } = require('./parsers/iciciParser');
const { parseSBIStatement } = require('./parsers/sbiParser');
const { Transaction, BankAccount, sequelize } = require('../models');

/**
 * Parse a bank statement file based on its type
 * 
 * @param {string} filePath - Path to the bank statement file
 * @param {string} bankType - Type of bank (HDFC, ICICI, etc.)
 * @returns {Promise<Object>} - Parsed bank statement data
 * @throws {Error} - If parsing fails
 */
async function parseStatement(filePath, bankType) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileExt = path.extname(filePath).toLowerCase();
    
    switch (bankType.toUpperCase()) {
      case 'HDFC':
        return parseHDFCStatement(content, fileExt);
      case 'ICICI':
        return parseICICIStatement(content, fileExt);
      case 'SBI':
        return parseSBIStatement(content, fileExt);
      default:
        throw new Error(`Unsupported bank type: ${bankType}`);
    }
  } catch (error) {
    throw new Error(`Error parsing bank statement: ${error.message}`);
  }
}

/**
 * Import transactions from parsed bank statement data
 * 
 * @param {Object} statementData - Parsed bank statement data
 * @param {string} userId - User ID to assign transactions to
 * @param {string} categoryId - Default category ID for imported transactions
 * @param {Object} options - Import options
 * @returns {Promise<Object>} - Import results
 */
async function importTransactions(statementData, userId, categoryId, options = {}) {
  const { skipExisting = true } = options;
  const results = {
    added: 0,
    skipped: 0,
    failed: 0,
    transactions: []
  };
  
  // Find or create a bank account for this statement
  let accountId = options.accountId;
  
  if (!accountId && statementData.accountInfo) {
    const accountInfo = statementData.accountInfo;
    
    // Look for an existing account with this account number
    const existingAccount = await BankAccount.findOne({
      where: {
        user_id: userId,
        account_number: accountInfo.accountNo
      }
    });
    
    if (existingAccount) {
      accountId = existingAccount.id;
    } else if (options.createAccountIfNotExists) {
      // Create a new bank account
      try {
        const bankDetails = {
          user_id: userId,
          account_number: accountInfo.accountNo,
          account_type: accountInfo.accountType || null,
          bank_name: statementData.source || 'Unknown Bank',
          branch_name: accountInfo.branch || null,
          currency: accountInfo.currency || 'INR',
          opening_balance: statementData.summary?.openingBalance || 0,
          current_balance: statementData.summary?.closingBalance || 0
        };
        
        // Parse IFSC and MICR if available
        if (accountInfo.ifsc) {
          const ifscParts = accountInfo.ifsc.split(' MICR :');
          if (ifscParts.length === 2) {
            bankDetails.ifsc_code = ifscParts[0].trim();
            bankDetails.micr_code = ifscParts[1].trim();
          } else {
            bankDetails.ifsc_code = accountInfo.ifsc.trim();
          }
        }
        
        const BankAccountService = require('../services/BankAccountService');
        const newAccount = await BankAccountService.createAccount(bankDetails);
        accountId = newAccount.id;
      } catch (error) {
        console.error('Error creating bank account:', error);
      }
    }
  }
  
  // Use a transaction to ensure atomic operation
  const dbTransaction = await sequelize.transaction();
  
  try {
    if (statementData.transactions && Array.isArray(statementData.transactions)) {
      for (const txn of statementData.transactions) {
        // Skip transactions without amount or description
        if (!txn.amount || !txn.description) {
          results.skipped++;
          continue;
        }
        
        // Check for duplicate transactions if skipExisting is true
        if (skipExisting) {
          const existingTxn = await Transaction.findOne({
            where: {
              user_id: userId,
              date: new Date(txn.date),
              description: txn.description,
              amount: txn.amount
            },
            transaction: dbTransaction
          });
          
          if (existingTxn) {
            results.skipped++;
            continue;
          }
        }
        
        // Create transaction
        try {
          const newTxn = await Transaction.create({
            user_id: userId,
            category_id: categoryId,
            description: txn.description,
            amount: Math.abs(txn.amount), // Store absolute value
            type: txn.type || (txn.amount < 0 ? 'expense' : 'income'),
            date: new Date(txn.date),
            account_id: accountId,
            recurring_type: 'none'
          }, { transaction: dbTransaction });
          
          results.added++;
          results.transactions.push(newTxn);
        } catch (error) {
          console.error('Error creating transaction:', error);
          results.failed++;
        }
      }
    }
    
    // Update account balance if an account was used
    if (accountId) {
      const BankAccountService = require('../services/BankAccountService');
      await BankAccountService.updateAccountBalance(accountId);
    }
    
    await dbTransaction.commit();
    return results;
  } catch (error) {
    await dbTransaction.rollback();
    throw error;
  }
}

module.exports = {
  parseStatement,
  importTransactions
};