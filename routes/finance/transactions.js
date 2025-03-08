const express = require('express');
const router = express.Router();
const TransactionService = require('../../services/TransactionService');
const { validateRequest } = require('../../middleware/validateRequest');
const auth = require('../../middleware/auth');
const LoggingService = require('../../services/monitoring/LoggingService');

/**
 * @swagger
 * /api/finance/transactions:
 *   get:
 *     summary: Get all user transactions
 *     description: Retrieves all transactions for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Filter by bank account ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Filter by transaction type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, amount]
 *           default: date
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A list of transactions
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth.isAuthenticated, async (req, res, next) => {
  try {
    const { 
      categoryId, 
      accountId,
      type, 
      startDate, 
      endDate, 
      limit, 
      offset,
      sortBy,
      sortOrder 
    } = req.query;
    
    const transactions = await TransactionService.getUserTransactions(
      req.user.id, 
      { categoryId, accountId, type, startDate, endDate, limit, offset, sortBy, sortOrder }
    );
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    LoggingService.logError(error, { context: 'Get user transactions' });
    next(error);
  }
});

/**
 * @swagger
 * /api/finance/transactions/bulk:
 *   post:
 *     summary: Create multiple transactions at once
 *     description: Creates multiple transactions for the authenticated user, typically from a bank statement import
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactions
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The bank account ID to associate with all transactions
 *               transactions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - description
 *                     - amount
 *                     - type
 *                     - date
 *                   properties:
 *                     description:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     type:
 *                       type: string
 *                       enum: [income, expense]
 *                     date:
 *                       type: string
 *                       format: date
 *                     category:
 *                       type: string
 *                       description: Category name, will be matched or created
 *     responses:
 *       201:
 *         description: Transactions created
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/bulk', auth.isAuthenticated, validateRequest({
  transactions: {
    in: ['body'],
    isArray: true,
    errorMessage: 'Transactions must be an array'
  }
}), async (req, res, next) => { 
  try {
    const { account_id, transactions } = req.body;
    
    if (!transactions.length) {
      return res.status(400).json({
        success: false,
        message: 'No transactions provided'
      });
    }
    
    // Process and validate transactions
    const processedTransactions = await TransactionService.processBulkTransactions(
      req.user.id,
      transactions,
      account_id
    );
    
    // Update account balance if needed
    if (account_id) {
      const BankAccountService = require('../../services/BankAccountService');
      await BankAccountService.updateAccountBalance(account_id);
    }
    
    res.status(201).json({
      success: true,
      data: {
        created: processedTransactions.length,
        duplicatesSkipped: transactions.length - processedTransactions.length
      },
      message: `Successfully imported ${processedTransactions.length} transactions`
    });
  } catch (error) {
    LoggingService.logError(error, { context: 'Bulk import transactions' });
    next(error);
  }
});

/**
 * @swagger
 * /api/finance/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     description: Retrieves a specific transaction by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth.isAuthenticated, async (req, res, next) => {
  try {
    const transaction = await TransactionService.getTransactionById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Ensure the user owns this transaction
    if (transaction.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this transaction'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    LoggingService.logError(error, { context: 'Get transaction by ID' });
    next(error);
  }
});

/**
 * @swagger
 * /api/finance/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Creates a new transaction for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - description
 *               - amount
 *               - type
 *               - date
 *             properties:
 *               category_id:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               date:
 *                 type: string
 *                 format: date-time
 *               account_id:
 *                 type: string
 *                 description: The bank account ID associated with this transaction
 *               recurring_type:
 *                 type: string
 *                 enum: [none, daily, weekly, monthly, yearly]
 *                 default: none
 *     responses:
 *       201:
 *         description: Transaction created
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth.isAuthenticated, validateRequest({
  category_id: {
    in: ['body'],
    notEmpty: true,
    errorMessage: 'Category ID is required'
  },
  description: {
    in: ['body'],
    notEmpty: true,
    errorMessage: 'Description is required'
  },
  amount: {
    in: ['body'],
    notEmpty: true,
    isFloat: true,
    errorMessage: 'Valid amount is required'
  },
  type: {
    in: ['body'],
    notEmpty: true,
    isIn: {
      options: [['income', 'expense']],
      errorMessage: 'Type must be income or expense'
    }
  },
  date: {
    in: ['body'],
    notEmpty: true,
    errorMessage: 'Date is required'
  }
}), async (req, res, next) => {
  try {
    const transactionData = {
      user_id: req.user.id,
      category_id: req.body.category_id,
      description: req.body.description,
      amount: req.body.amount,
      type: req.body.type,
      date: req.body.date,
      account_id: req.body.account_id || null,
      recurring_type: req.body.recurring_type || 'none',
      recurring_end_date: req.body.recurring_end_date || null
    };
    
    const transaction = await TransactionService.createTransaction(transactionData);
    
    // Update account balance if this transaction is associated with an account
    if (transaction.account_id) {
      const BankAccountService = require('../../services/BankAccountService');
      await BankAccountService.updateAccountBalance(transaction.account_id);
    }
    
    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction created successfully'
    });
  } catch (error) {
    LoggingService.logError(error, { context: 'Create transaction' });
    next(error);
  }
});

/**
 * @swagger
 * /api/finance/transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     description: Updates an existing transaction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               date:
 *                 type: string
 *                 format: date-time
 *               account_id:
 *                 type: string
 *               recurring_type:
 *                 type: string
 *                 enum: [none, daily, weekly, monthly, yearly]
 *     responses:
 *       200:
 *         description: Transaction updated
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', auth.isAuthenticated, async (req, res, next) => {
  try {
    const transaction = await TransactionService.getTransactionById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Ensure the user owns this transaction
    if (transaction.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this transaction'
      });
    }
    
    // Fields that are allowed to be updated
    const updateFields = [
      'category_id', 'description', 'amount', 'type', 
      'date', 'account_id', 'recurring_type', 'recurring_end_date'
    ];
    
    const updateData = {};
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    const updatedTransaction = await TransactionService.updateTransaction(req.params.id, updateData);
    
    res.json({
      success: true,
      data: updatedTransaction,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    LoggingService.logError(error, { context: 'Update transaction' });
    next(error);
  }
});

/**
 * @swagger
 * /api/finance/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     description: Deletes a transaction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', auth.isAuthenticated, async (req, res, next) => {
  try {
    const transaction = await TransactionService.getTransactionById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Ensure the user owns this transaction
    if (transaction.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this transaction'
      });
    }
    
    await TransactionService.deleteTransaction(req.params.id);
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    LoggingService.logError(error, { context: 'Delete transaction' });
    next(error);
  }
});

/**
 * @swagger
 * /api/finance/transactions/stats:
 *   get:
 *     summary: Get transaction statistics
 *     description: Retrieves transaction statistics for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Bank account ID to filter by
 *     responses:
 *       200:
 *         description: Transaction statistics
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', auth.isAuthenticated, async (req, res, next) => {
  try {
    const { startDate, endDate, accountId } = req.query;
    
    const stats = await TransactionService.getTransactionStats(
      req.user.id, 
      { startDate, endDate, accountId }
    );
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    LoggingService.logError(error, { context: 'Get transaction statistics' });
    next(error);
  }
});

/**
 * @swagger
 * /api/finance/transactions/accounts/{accountId}:
 *   get:
 *     summary: Get transactions for specific account
 *     description: Retrieves all transactions for a specific bank account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Filter by transaction type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: A list of transactions for the account
 *       404:
 *         description: Account not found
 *       401:
 *         description: Unauthorized
 */
router.get('/accounts/:accountId', auth.isAuthenticated, async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { startDate, endDate, limit, offset, type } = req.query;
    
    // Verify account belongs to user
    const BankAccountService = require('../../services/BankAccountService');
    const account = await BankAccountService.getAccountById(accountId);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    if (account.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this account'
      });
    }
    
    const transactions = await TransactionService.getTransactionsByAccountId(
      accountId, 
      { startDate, endDate, limit, offset, type }
    );
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    LoggingService.logError(error, { context: 'Get account transactions' });
    next(error);
  }
});

/**
 * @swagger
 * /api/finance/transactions/assign:
 *   post:
 *     summary: Assign transactions to bank account
 *     description: Assigns multiple transactions to a specific bank account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_id
 *               - transaction_ids
 *             properties:
 *               account_id:
 *                 type: string
 *               transaction_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Transactions assigned successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Account not found
 *       401:
 *         description: Unauthorized
 */
router.post('/assign', auth.isAuthenticated, validateRequest({
  account_id: {
    in: ['body'],
    notEmpty: true,
    errorMessage: 'Account ID is required'
  },
  transaction_ids: {
    in: ['body'],
    isArray: true,
    errorMessage: 'Transaction IDs must be an array'
  }
}), async (req, res, next) => {
  try {
    const { account_id, transaction_ids } = req.body;
    
    // Verify account belongs to user
    const BankAccountService = require('../../services/BankAccountService');
    const account = await BankAccountService.getAccountById(account_id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    if (account.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this account'
      });
    }
    
    const result = await TransactionService.assignTransactionsToAccount(account_id, transaction_ids);
    
    res.json({
      success: true,
      data: result,
      message: `${result.updatedCount} transactions assigned to account`
    });
  } catch (error) {
    LoggingService.logError(error, { context: 'Assign transactions to account' });
    next(error);
  }
});

module.exports = router;