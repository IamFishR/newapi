const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const BankAccountService = require('../services/BankAccountService');
const { validateRequest } = require('../middleware/validateRequest');
const LoggingService = require('../services/monitoring/LoggingService');
const ValidationError = require('../utils/ValidationError');

// Initialize the service
const bankAccountService = new BankAccountService();

// Apply API rate limiter to all routes
router.use(apiLimiter);

/**
 * @swagger
 * /api/bank-accounts:
 *   get:
 *     summary: Get all user bank accounts
 *     description: Retrieves all bank accounts for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, closed]
 *         description: Filter by account status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: A list of bank accounts
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth.isAuthenticated, async (req, res, next) => {
    try {
        const { status, limit, offset } = req.query;
        const accounts = await bankAccountService.getUserAccounts(req.user.id, { status, limit, offset });
        res.json({
            success: true,
            data: accounts
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get all user bank accounts' });
        next(error);
    }
});

/**
 * @swagger
 * /api/bank-accounts/{id}:
 *   get:
 *     summary: Get bank account by ID
 *     description: Retrieves a specific bank account by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *     responses:
 *       200:
 *         description: Bank account details
 *       404:
 *         description: Account not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const account = await bankAccountService.getAccountById(req.params.id);
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
        res.json({
            success: true,
            data: account
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get bank account by ID' });
        next(error);
    }
});

/**
 * @swagger
 * /api/bank-accounts/find:
 *   post:
 *     summary: Find bank account by account number and bank name
 *     description: Finds an existing bank account by account number and bank name
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_number
 *             properties:
 *               account_number:
 *                 type: string
 *               bank_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bank account found
 *       404:
 *         description: Account not found
 *       401:
 *         description: Unauthorized
 */
router.post('/find', auth.isAuthenticated, async (req, res, next) => {
    try {
        // Validate request body
        // const { error } = validateRequest({
        //     account_number: {
        //         in: ['body'],
        //         notEmpty: true,
        //         errorMessage: 'Account number is required'
        //     },
        //     bank_name: {
        //         in: ['body'],
        //         notEmpty: true,
        //         errorMessage: 'Bank name is required'
        //     }
        // })(req.body);
        // if (error) {
        //     return res.status(400).json({
        //         success: false,
        //         message: error.message
        //     });
        // }
        
        const { account_number, bank_name } = req.body;
        
        const account = await bankAccountService.findUserAccountByNumber(
            req.user.id,
            account_number,
            bank_name
        );
        
        if (!account) {
            return res.status(200).json({
                success: false,
                message: 'Account not found',
                data: null
            });
        }
        
        res.json({
            success: true,
            message: 'Account found successfully',
            data: account
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Find bank account by account number' });
        next(error);
    }
});

/**
 * @swagger
 * /api/bank-accounts:
 *   post:
 *     summary: Create a new bank account
 *     description: Creates a new bank account for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_number
 *               - bank_name
 *             properties:
 *               account_number:
 *                 type: string
 *               account_name:
 *                 type: string
 *               account_type:
 *                 type: string
 *               bank_name:
 *                 type: string
 *               branch_name:
 *                 type: string
 *               ifsc_code:
 *                 type: string
 *               micr_code:
 *                 type: string
 *               currency:
 *                 type: string
 *                 default: INR
 *               is_primary:
 *                 type: boolean
 *                 default: false
 *               opening_balance:
 *                 type: number
 *                 default: 0
 *     responses:
 *       201:
 *         description: Bank account created
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth.isAuthenticated, validateRequest({
    account_number: {
        in: ['body'],
        notEmpty: true,
        errorMessage: 'Account number is required'
    },
    bank_name: {
        in: ['body'],
        notEmpty: true,
        errorMessage: 'Bank name is required'
    }
}), async (req, res, next) => {
    try {
        const accountData = {
            user_id: req.user.id,
            account_number: req.body.account_number,
            account_name: req.body.account_name,
            account_type: req.body.account_type,
            bank_name: req.body.bank_name,
            branch_name: req.body.branch_name,
            ifsc_code: req.body.ifsc_code,
            micr_code: req.body.micr_code,
            currency: req.body.currency || 'INR',
            is_primary: req.body.is_primary || false,
            opening_balance: req.body.opening_balance || 0,
            current_balance: req.body.opening_balance || 0
        };
        const account = await bankAccountService.createAccount(accountData);
        res.status(201).json({
            success: true,
            data: account,
            message: 'Bank account created successfully'
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Create a new bank account' });
        next(error);
    }
});

/**
 * @swagger
 * /api/bank-accounts/{id}:
 *   put:
 *     summary: Update a bank account
 *     description: Updates an existing bank account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_name:
 *                 type: string
 *               account_type:
 *                 type: string
 *               branch_name:
 *                 type: string
 *               ifsc_code:
 *                 type: string
 *               micr_code:
 *                 type: string
 *               is_primary:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [active, inactive, closed]
 *     responses:
 *       200:
 *         description: Bank account updated
 *       404:
 *         description: Account not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const account = await bankAccountService.getAccountById(req.params.id);
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }
        if (account.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to modify this account'
            });
        }
        const updateFields = [
            'account_name', 'account_type', 'branch_name', 
            'ifsc_code', 'micr_code', 'is_primary', 'status'
        ];
        const updateData = {};
        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });
        const updatedAccount = await bankAccountService.updateAccount(req.params.id, updateData);
        res.json({
            success: true,
            data: updatedAccount,
            message: 'Bank account updated successfully'
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update a bank account' });
        next(error);
    }
});

/**
 * @swagger
 * /api/bank-accounts/{id}:
 *   delete:
 *     summary: Delete a bank account
 *     description: Deletes a bank account (soft delete if transactions exist)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *     responses:
 *       200:
 *         description: Bank account deleted
 *       404:
 *         description: Account not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const account = await bankAccountService.getAccountById(req.params.id);
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }
        if (account.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this account'
            });
        }
        await bankAccountService.deleteAccount(req.params.id);
        res.json({
            success: true,
            message: 'Bank account deleted successfully'
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete a bank account' });
        next(error);
    }
});

/**
 * @swagger
 * /api/bank-accounts/{id}/balance:
 *   post:
 *     summary: Update account balance
 *     description: Recalculates and updates the account balance based on transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *     responses:
 *       200:
 *         description: Account balance updated
 *       404:
 *         description: Account not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/balance', auth.isAuthenticated, async (req, res, next) => {
    try {
        const account = await bankAccountService.getAccountById(req.params.id);
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }
        if (account.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this account'
            });
        }
        const updatedAccount = await bankAccountService.updateAccountBalance(req.params.id);
        res.json({
            success: true,
            data: {
                current_balance: updatedAccount.current_balance,
                last_synced_at: updatedAccount.last_synced_at
            },
            message: 'Account balance updated successfully'
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update account balance' });
        next(error);
    }
});

router.get('/account/:accountNumber', auth.isAuthenticated, async (req, res) => {
    try {
        const account = await bankAccountService.findUserAccountByNumber(
            req.user.id,
            req.params.accountNumber,
            req.query.bankName
        );
        
        if (!account) {
            return res.status(404).json({ 
                success: false,
                message: 'Account not found' 
            });
        }
        
        res.json({
            success: true,
            data: account
        });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get account by account number' });
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

module.exports = router;