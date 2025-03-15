const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const ValidationService = require('../utils/ValidationService');
const TransactionService = require('../services/TransactionService');
const BankAccountService = require('../services/BankAccountService');
const LoggingService = require('../services/monitoring/LoggingService');
const {
    FinanceService,
    DebtService,
    GoalsService,
    InvestmentService,
    NetWorthService,
    TaxService,
    CreditCardService,
    IncomeService,
    SavingsService,
    FinancialHealthService
} = require('../services/finance');

// Apply API rate limiter to all routes
router.use(apiLimiter);

// overview
router.post('/overview', auth.isAuthenticated, async (req, res, next) => {
    try {

        const { status, limit, offset, accountId } = req.body;
        const accounts = await BankAccountService.getAccountById(accountId);
        const transactions = await TransactionService.getUserTransactions(req.user.id, { status, limit, offset, accountId });
        // const debts = await DebtService.getUserDebts(req.user.id, { status, limit, offset });
        const response = {
            accountInfo: accounts,
            summary: {
                openingBalance: accounts.opening_balance,
                totalDebits: 79785.89,
                totalCredits: 1663.6,
                closingBalance: 49129.87,
                debitCount: 81,
                creditCount: 2
            },
            transactions: transactions.rows,
            analytics: {
                burnRate: 4432.55,
                daysToZero: 11.1,
                trend: "Downward (-61.4%)",
                leveragePoints: [
                    {
                        desc: "ATW-526099XXXXXX6724-S1ANHY01-HYDERABAD",
                        amount: 15000,
                        action: "Switch to digital payments"
                    },
                    {
                        desc: "DC 1019060028639178 AUTOPAY SI-TAD",
                        amount: 14444.31,
                        action: "Cut by 30% (4333.29 INR saving)"
                    },
                    {
                        desc: "UPI-SMART BAZAAR  HYDERA-2306667041393-01@JIOPAY-ICIC0000541-503326592264-UPI",
                        amount: 12383.09,
                        action: "Cut by 30% (3714.93 INR saving)"
                    }
                ],
                dailySpending: [
                    {
                        date: "2025-02-01",
                        amount: 591.8399999999999
                    },
                    {
                        date: "2025-02-02",
                        amount: 22038.59
                    }
                ],
                incomeByCategory: [
                    {
                        category: "Other",
                        totalAmount: 1663.6,
                        count: 2,
                        percentage: 100,
                        topTransactions: [
                            {
                                date: "2025-02-13",
                                amount: 1033.6,
                                description: "UPI-IRCTCAPPUPI-PAYTM-76208552@PTYBL-YESB0PTMUPI-504417498548-COLLECT"
                            },
                            {
                                date: "2025-02-13",
                                amount: 630,
                                description: "UPI-PHONEPE-PHONEPEMERCHANT@YESBANK-YESB0000022-504440319260-R02 PHONEPE REVERS"
                            }
                        ]
                    }
                ],
                recurringTransactions: [
                    {
                        merchant: "M WAHEEDUDDIN  SIDDI",
                        frequency: "daily",
                        averageAmount: 85,
                        category: "Other",
                        count: 10,
                        lastTransactionDate: "2025-02-13"
                    }
                ],
                topMerchants: [
                    {
                        name: "SMART BAZAAR  HYDERA",
                        count: 4,
                        amount: 16091.59
                    }
                ]
            },
            profile: {
                income: {
                    monthly: 55.45333333333333,
                    sources: [
                        {
                            source: "Other",
                            amount: 55.45333333333333,
                            frequency: "monthly"
                        }
                    ],
                    trend: -10
                },
                expenses: {
                    monthly: 2659.5296666666663,
                    recurring: [
                        {
                            merchant: "M WAHEEDUDDIN  SIDDI",
                            frequency: "daily",
                            averageAmount: 85,
                            category: "Other",
                            count: 10,
                            lastTransactionDate: "2025-02-13"
                        }
                    ],
                    categories: [
                        {
                            category: "Other",
                            totalAmount: 37923.31,
                            count: 42,
                            percentage: 47.531349214754634,
                            topTransactions: [
                                {
                                    date: "2025-02-05",
                                    amount: 14444.31,
                                    description: "DC 1019060028639178 AUTOPAY SI-TAD"
                                },
                                {
                                    date: "2025-02-02",
                                    amount: 5000,
                                    description: "UPI-RATNAMALA HARIBHAU S-SURYAWANSHIRATNAMALA@OKICICI-ICIC0001461-503343852820-UPI"
                                },
                                {
                                    date: "2025-02-10",
                                    amount: 5000,
                                    description: "ACH D- INDIAN CLEARING CORP-000000QQTYEX"
                                }
                            ]
                        }
                    ],
                    trend: -10
                },
                savings: {
                    current: 49129.87,
                    rate: -156.5325999839705,
                    projection: [
                        {
                            month: "2025-04",
                            amount: 46525.79366666667
                        }
                    ]
                },
                budget: {
                    needs: 89.19210457219113,
                    wants: 10.807895427808862,
                    savings: 0,
                    analysis: "High essential expenses"
                }
            }
        }

        res.json({ status: 'success', data: response });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get financial overview' });
        next(error);
    }
});

// Financial Profile Routes
// Setup route to handle complete financial setup
router.post('/setup', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('financialProfile', req.body);
        const profile = await FinanceService.setupFinancialProfile(req.user.id, validatedData);
        res.json({ status: 'success', data: profile });
    } catch (error) {
        LoggingService.logError(error, { context: 'Financial setup' });
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: error.message.split(', ').map(msg => ({
                    message: msg
                }))
            });
        }
        next(error);
    }
});

router.get('/profile', auth.isAuthenticated, async (req, res, next) => {
    try {
        const profile = await FinanceService.getFinancialProfile(req.user.id);
        res.json({ status: 'success', data: profile });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get financial profile' });
        next(error);
    }
});

router.put('/profile', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('financialProfile', req.body);
        const profile = await FinanceService.updateFinancialProfile(req.user.id, validatedData);
        res.json({ status: 'success', data: profile });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update financial profile' });
        next(error);
    }
});

// Budget Routes
router.get('/budget/categories', auth.isAuthenticated, async (req, res, next) => {
    try {
        const categories = await FinanceService.getBudgetCategories(req.user.id);
        res.json({ status: 'success', data: categories });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get budget categories' });
        next(error);
    }
});

router.post('/budget/categories', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('budgetCategory', req.body);
        const category = await FinanceService.createBudgetCategory(req.user.id, validatedData);
        res.json({ status: 'success', data: category });
    } catch (error) {
        LoggingService.logError(error, { context: 'Create budget category' });
        next(error);
    }
});

router.get('/budget/transactions', auth.isAuthenticated, async (req, res, next) => {
    try {
        const transactions = await FinanceService.getTransactions(req.user.id, req.query);
        if (transactions?.count == 0) {
            return res.status(204).json({
                status: 'success',
                message: 'No transactions found'
            });
        }

        res.json({ status: 'success', data: transactions.rows });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get transactions' });
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch transactions',
            details: error.message
        });
    }
});

router.post('/budget/transactions', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('transaction', req.body);
        const transaction = await FinanceService.addTransaction(req.user.id, validatedData);
        res.json({ status: 'success', data: transaction });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add transaction' });
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
router.post('/budget/transactions/bulk', auth.isAuthenticated, async (req, res, next) => {
    try {
        const { account_id, transactions } = req.body;

        if (!transactions?.length) {
            return res.status(400).json({
                success: false,
                message: 'No transactions provided'
            });
        }

        // Validate basic transaction structure
        const invalidTransactions = transactions.filter(t =>
            !t.description || !t.amount || !t.date
        );

        if (invalidTransactions.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction data found',
                details: 'Each transaction must include description, amount, and date'
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
        LoggingService.logError(error, {
            context: 'Bulk add transactions',
            userId: req.user.id,
            accountId: req.body.account_id
        });

        // Send a more specific error message
        return res.status(500).json({
            success: false,
            message: 'Failed to process transactions',
            error: error.message
        });
    }
});

router.get('/budget/trends', auth.isAuthenticated, async (req, res, next) => {
    try {
        const trends = await FinanceService.getBudgetTrends(req.user.id, req.query.range);
        res.json({ status: 'success', data: trends });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get budget trends' });
        res.status(500).json({ error: 'Failed to fetch budget trends data' });
    }
});

router.get('/budget/comparison', auth.isAuthenticated, async (req, res, next) => {
    try {
        const comparison = await FinanceService.getBudgetComparison(req.user.id, req.query.startDate, req.query.endDate);
        res.json({ status: 'success', data: comparison });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get budget comparison' });
        res.status(500).json({ error: 'Failed to fetch budget comparison data' });
    }
});

// Debt Management Routes
router.get('/debt', auth.isAuthenticated, async (req, res, next) => {
    try {
        const debts = await DebtService.getDebts(req.user.id);
        res.json({ status: 'success', data: debts });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get debt items' });
        next(error);
    }
});

router.post('/debt', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('debtItem', req.body);
        const debt = await DebtService.addDebt(req.user.id, validatedData);
        res.json({ status: 'success', data: debt });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add debt item' });
        next(error);
    }
});

router.post('/debt/:id/payment', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('debtPayment', req.body);
        const payment = await DebtService.addPayment(req.user.id, req.params.id, validatedData);
        res.json({ status: 'success', data: payment });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add debt payment' });
        next(error);
    }
});

router.get('/debt/analytics', auth.isAuthenticated, async (req, res, next) => {
    try {
        const analytics = await DebtService.getDebtAnalytics(req.user.id);
        res.json({ status: 'success', data: analytics });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get debt analytics' });
        next(error);
    }
});

// Financial Goals Routes
router.get('/goals', auth.isAuthenticated, async (req, res, next) => {
    try {
        const goals = await GoalsService.getGoals(req.user.id);
        res.json({ status: 'success', data: goals });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get financial goals' });
        next(error);
    }
});

router.post('/goals', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('financialGoal', req.body);
        const goal = await GoalsService.createFinancialGoal(req.user.id, validatedData);
        res.json({ status: 'success', data: goal });
    } catch (error) {
        LoggingService.logError(error, { context: 'Create financial goal' });
        next(error);
    }
});

router.post('/goals/:id/contribution', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('goalContribution', req.body);
        const contribution = await GoalsService.addContribution(req.user.id, req.params.id, validatedData);
        res.json({ status: 'success', data: contribution });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add goal contribution' });
        next(error);
    }
});

// Investment Routes
router.get('/investments', auth.isAuthenticated, async (req, res, next) => {
    try {
        const investments = await InvestmentService.getInvestments(req.user.id);
        res.json({ status: 'success', data: investments });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get investments' });
        next(error);
    }
});

router.post('/investments', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('investment', req.body);
        const investment = await InvestmentService.addInvestment(req.user.id, validatedData);
        res.json({ status: 'success', data: investment });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add investment' });
        next(error);
    }
});

router.post('/investments/:id/transaction', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('investmentTransaction', req.body);
        const transaction = await InvestmentService.addTransaction(
            req.user.id,
            req.params.id,
            validatedData
        );
        res.json({ status: 'success', data: transaction });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add investment transaction' });
        next(error);
    }
});

router.get('/investments/analytics', auth.isAuthenticated, async (req, res, next) => {
    try {
        const analytics = await InvestmentService.getInvestmentAnalytics(req.user.id);
        res.json({ status: 'success', data: analytics });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get investment analytics' });
        next(error);
    }
});

// Net Worth Routes
router.get('/networth', auth.isAuthenticated, async (req, res, next) => {
    try {
        const netWorth = await NetWorthService.getCurrentNetWorth(req.user.id);
        res.json({ status: 'success', data: netWorth });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get current net worth' });
        next(error);
    }
});

router.get('/networth/history', auth.isAuthenticated, async (req, res, next) => {
    try {
        const history = await NetWorthService.getNetWorthHistory(
            req.user.id,
            req.query.startDate,
            req.query.endDate
        );
        res.json({ status: 'success', data: history });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get net worth history' });
        next(error);
    }
});

router.get('/networth/analytics', auth.isAuthenticated, async (req, res, next) => {
    try {
        const analytics = await NetWorthService.getNetWorthAnalytics(req.user.id);
        res.json({ status: 'success', data: analytics });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get net worth analytics' });
        next(error);
    }
});

// Tax Planning Routes
router.get('/tax/profile', auth.isAuthenticated, async (req, res, next) => {
    try {
        const profile = await TaxService.getTaxProfile(req.user.id);
        res.json({ status: 'success', data: profile });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get tax profile' });
        next(error);
    }
});

router.put('/tax/profile', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('taxProfile', req.body);
        const profile = await TaxService.updateTaxProfile(req.user.id, validatedData);
        res.json({ status: 'success', data: profile });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update tax profile' });
        next(error);
    }
});

router.post('/tax/deductions', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('taxDeduction', req.body);
        const deduction = await TaxService.addTaxDeduction(req.user.id, validatedData);
        res.json({ status: 'success', data: deduction });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add tax deduction' });
        next(error);
    }
});

router.get('/tax/calendar', auth.isAuthenticated, async (req, res, next) => {
    try {
        const calendar = await TaxService.getTaxCalendar(req.user.id);
        res.json({ status: 'success', data: calendar });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get tax calendar' });
        next(error);
    }
});

router.get('/tax/estimates', auth.isAuthenticated, async (req, res, next) => {
    try {
        const estimates = await TaxService.calculateEstimatedTaxes(req.user.id);
        res.json({ status: 'success', data: estimates });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get tax estimates' });
        next(error);
    }
});

// Enhanced setup route to handle complete financial setup
router.post('/setup', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('financialProfile', req.body);
        
        // Process each component in parallel
        const [accounts, cards, income, savings, expenses] = await Promise.all([
            // Process bank accounts
            validatedData.bankAccounts?.length > 0 
                ? BankAccountService.bulkCreateAccounts(req.user.id, validatedData.bankAccounts)
                : [],
            
            // Process credit cards
            validatedData.creditCards?.length > 0
                ? CreditCardService.bulkCreateCards(req.user.id, validatedData.creditCards)
                : [],
            
            // Process income sources
            validatedData.incomes?.length > 0
                ? IncomeService.bulkCreateIncome(req.user.id, validatedData.incomes)
                : [],
            
            // Process savings goals
            validatedData.savings
                ? SavingsService.createGoal(req.user.id, validatedData.savings)
                : null,
            
            // Process expenses
            validatedData.expenses?.length > 0
                ? ExpenseService.bulkCreateExpenses(req.user.id, validatedData.expenses)
                : []
        ]);

        // Get financial health assessment after setup
        const healthAssessment = await FinancialHealthService.getFinancialHealth(req.user.id);

        res.json({
            status: 'success',
            data: {
                accounts,
                cards,
                income,
                savings,
                expenses,
                healthAssessment
            }
        });
    } catch (error) {
        LoggingService.logError(error, { 
            context: 'Financial setup',
            userId: req.user.id 
        });
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: error.message.split(', ').map(msg => ({
                    message: msg
                }))
            });
        }
        next(error);
    }
});

// Credit Card Routes
router.get('/cards', auth.isAuthenticated, async (req, res, next) => {
    try {
        const cards = await CreditCardService.getUserCards(req.user.id);
        res.json({ status: 'success', data: cards });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get credit cards' });
        next(error);
    }
});

router.post('/cards', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('creditCard', req.body);
        const card = await CreditCardService.addCard(req.user.id, validatedData);
        res.json({ status: 'success', data: card });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add credit card' });
        next(error);
    }
});

router.put('/cards/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('creditCard', req.body);
        const card = await CreditCardService.updateCard(req.params.id, req.user.id, validatedData);
        res.json({ status: 'success', data: card });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update credit card' });
        next(error);
    }
});

router.delete('/cards/:id', auth.isAuthenticated, async (req, res, next) => {
    try {
        await CreditCardService.deleteCard(req.params.id, req.user.id);
        res.json({ status: 'success', message: 'Credit card deleted successfully' });
    } catch (error) {
        LoggingService.logError(error, { context: 'Delete credit card' });
        next(error);
    }
});

// Income Routes
router.get('/income', auth.isAuthenticated, async (req, res, next) => {
    try {
        const income = await IncomeService.getUserIncome(req.user.id, req.query);
        res.json({ status: 'success', data: income });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get income' });
        next(error);
    }
});

router.post('/income', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('income', req.body);
        const income = await IncomeService.addIncome(req.user.id, validatedData);
        res.json({ status: 'success', data: income });
    } catch (error) {
        LoggingService.logError(error, { context: 'Add income' });
        next(error);
    }
});

router.get('/income/summary', auth.isAuthenticated, async (req, res, next) => {
    try {
        const summary = await IncomeService.getIncomeSummary(req.user.id, req.query.period);
        res.json({ status: 'success', data: summary });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get income summary' });
        next(error);
    }
});

router.get('/income/projection', auth.isAuthenticated, async (req, res, next) => {
    try {
        const projection = await IncomeService.getProjectedIncome(req.user.id, req.query.months);
        res.json({ status: 'success', data: projection });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get income projection' });
        next(error);
    }
});

// Savings Routes
router.get('/savings/goals', auth.isAuthenticated, async (req, res, next) => {
    try {
        const goals = await SavingsService.getUserGoals(req.user.id);
        res.json({ status: 'success', data: goals });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get savings goals' });
        next(error);
    }
});

router.post('/savings/goals', auth.isAuthenticated, async (req, res, next) => {
    try {
        const validatedData = await ValidationService.validate('savingsGoal', req.body);
        const goal = await SavingsService.createGoal(req.user.id, validatedData);
        res.json({ status: 'success', data: goal });
    } catch (error) {
        LoggingService.logError(error, { context: 'Create savings goal' });
        next(error);
    }
});

router.post('/savings/goals/:id/progress', auth.isAuthenticated, async (req, res, next) => {
    try {
        const { amount } = await ValidationService.validate('savingsProgress', req.body);
        const progress = await SavingsService.updateProgress(req.params.id, req.user.id, amount);
        res.json({ status: 'success', data: progress });
    } catch (error) {
        LoggingService.logError(error, { context: 'Update savings progress' });
        next(error);
    }
});

router.get('/savings/analytics', auth.isAuthenticated, async (req, res, next) => {
    try {
        const analytics = await SavingsService.getAnalytics(req.user.id);
        res.json({ status: 'success', data: analytics });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get savings analytics' });
        next(error);
    }
});

// Financial Health Routes
router.get('/health', auth.isAuthenticated, async (req, res, next) => {
    try {
        const health = await FinancialHealthService.getFinancialHealth(req.user.id);
        res.json({ status: 'success', data: health });
    } catch (error) {
        LoggingService.logError(error, { context: 'Get financial health' });
        next(error);
    }
});

module.exports = router;