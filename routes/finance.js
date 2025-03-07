const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const ValidationService = require('../utils/ValidationService');
const LoggingService = require('../services/monitoring/LoggingService');
const {
    FinanceService,
    DebtService,
    GoalsService,
    InvestmentService,
    NetWorthService,
    TaxService
} = require('../services/finance');

// Apply API rate limiter to all routes
router.use(apiLimiter);

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
        res.json({ status: 'success', data: transactions });
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

module.exports = router;