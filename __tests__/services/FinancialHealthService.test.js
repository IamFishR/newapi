'use strict';

const { FinancialHealthService } = require('../../services/finance');
const { Income, SavingsGoal, BankAccount, CreditCard } = require('../../models');
const { sequelize } = require('../../config/sequelize');
const LoggingService = require('../../services/monitoring/LoggingService');

jest.mock('../../services/monitoring/LoggingService');

describe('FinancialHealthService', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    afterEach(async () => {
        await Promise.all([
            Income.destroy({ where: {} }),
            SavingsGoal.destroy({ where: {} }),
            BankAccount.destroy({ where: {} }),
            CreditCard.destroy({ where: {} })
        ]);
        jest.clearAllMocks();
    });

    const userId = '123e4567-e89b-12d3-a456-426614174000';

    const setupTestData = async () => {
        // Create income
        await Income.create({
            user_id: userId,
            type: 'salary',
            amount: 50000.00,
            date: new Date(),
            frequency: 'monthly'
        });

        // Create savings goal
        await SavingsGoal.create({
            user_id: userId,
            current_amount: 10000.00,
            target_amount: 50000.00,
            target_date: new Date('2025-12-31'),
            monthly_contribution: 2000.00,
            savings_type: 'emergency',
            category: 'Emergency Fund'
        });

        // Create bank account
        await BankAccount.create({
            user_id: userId,
            account_number: '1234',
            account_name: 'Test Account',
            account_type: 'savings',
            branch_name: 'Test Branch',
            ifsc_code: '12345678901',
            micr_code: '123456789',
            currency: 'INR',
            is_primary: true,
            opening_balance: 20000.00,
            current_balance: 25000.00
        });

        // Create credit card
        await CreditCard.create({
            user_id: userId,
            card_number: '6789',
            card_name: 'Test Credit Card',
            card_type: 'visa',
            card_plan: 'Rewards Card',
            card_limit: 50000.00
        });
    };

    describe('getFinancialHealth', () => {
        beforeEach(async () => {
            await setupTestData();
        });

        it('should calculate overall financial health score', async () => {
            const health = await FinancialHealthService.getFinancialHealth(userId);
            expect(health.score).toBeDefined();
            expect(health.score).toBeGreaterThan(0);
            expect(health.score).toBeLessThanOrEqual(100);
        });

        it('should provide budget ratio analysis', async () => {
            const health = await FinancialHealthService.getFinancialHealth(userId);
            expect(health.budgetAnalysis).toBeDefined();
            expect(health.budgetAnalysis.needs).toBeDefined();
            expect(health.budgetAnalysis.wants).toBeDefined();
            expect(health.budgetAnalysis.savings).toBeDefined();
        });

        it('should include emergency fund assessment', async () => {
            const health = await FinancialHealthService.getFinancialHealth(userId);
            expect(health.emergencyFund).toBeDefined();
            expect(health.emergencyFund.current).toBe(10000.00);
            expect(health.emergencyFund.recommended).toBeDefined();
            expect(health.emergencyFund.monthsCovered).toBeDefined();
        });

        it('should assess debt utilization', async () => {
            const health = await FinancialHealthService.getFinancialHealth(userId);
            expect(health.debtUtilization).toBeDefined();
            expect(health.debtUtilization.ratio).toBeDefined();
            expect(health.debtUtilization.assessment).toBeDefined();
        });
    });

    describe('getSavingsRate', () => {
        beforeEach(async () => {
            await setupTestData();
        });

        it('should calculate monthly savings rate', async () => {
            const rate = await FinancialHealthService.getSavingsRate(userId);
            expect(rate.percentage).toBeDefined();
            expect(rate.amount).toBeDefined();
            expect(rate.recommendation).toBeDefined();
        });

        it('should handle case with no income', async () => {
            await Income.destroy({ where: {} });
            const rate = await FinancialHealthService.getSavingsRate(userId);
            expect(rate.percentage).toBe(0);
            expect(rate.error).toBeDefined();
        });
    });

    describe('getRecommendations', () => {
        beforeEach(async () => {
            await setupTestData();
        });

        it('should provide personalized recommendations', async () => {
            const recommendations = await FinancialHealthService.getRecommendations(userId);
            expect(recommendations).toBeInstanceOf(Array);
            expect(recommendations.length).toBeGreaterThan(0);
            recommendations.forEach(rec => {
                expect(rec).toHaveProperty('category');
                expect(rec).toHaveProperty('action');
                expect(rec).toHaveProperty('impact');
                expect(rec).toHaveProperty('priority');
            });
        });

        it('should prioritize emergency fund if insufficient', async () => {
            await SavingsGoal.destroy({ where: {} });
            const recommendations = await FinancialHealthService.getRecommendations(userId);
            expect(recommendations[0].category).toBe('emergency_fund');
            expect(recommendations[0].priority).toBe('high');
        });

        it('should recommend debt reduction for high utilization', async () => {
            await CreditCard.create({
                user_id: userId,
                card_number: '5678',
                card_name: 'High Usage Card',
                card_type: 'visa',
                card_limit: 10000.00,
                current_utilization: 8000.00 // 80% utilization
            });

            const recommendations = await FinancialHealthService.getRecommendations(userId);
            const debtRec = recommendations.find(r => r.category === 'debt_management');
            expect(debtRec).toBeDefined();
            expect(debtRec.priority).toBe('high');
        });
    });

    describe('getBudgetHealth', () => {
        beforeEach(async () => {
            await setupTestData();
        });

        it('should analyze budget allocation', async () => {
            const health = await FinancialHealthService.getBudgetHealth(userId);
            expect(health.allocation).toBeDefined();
            expect(health.allocation.needs).toBeDefined();
            expect(health.allocation.wants).toBeDefined();
            expect(health.allocation.savings).toBeDefined();
            expect(health.score).toBeDefined();
        });

        it('should identify areas for improvement', async () => {
            const health = await FinancialHealthService.getBudgetHealth(userId);
            expect(health.improvements).toBeInstanceOf(Array);
            health.improvements.forEach(improvement => {
                expect(improvement).toHaveProperty('category');
                expect(improvement).toHaveProperty('current');
                expect(improvement).toHaveProperty('target');
                expect(improvement).toHaveProperty('action');
            });
        });
    });

    describe('getFinancialTrends', () => {
        beforeEach(async () => {
            await setupTestData();
        });

        it('should analyze monthly trends', async () => {
            const trends = await FinancialHealthService.getFinancialTrends(userId, 'monthly');
            expect(trends.income).toBeDefined();
            expect(trends.savings).toBeDefined();
            expect(trends.expenses).toBeDefined();
            expect(trends.netWorth).toBeDefined();
        });

        it('should calculate growth rates', async () => {
            const trends = await FinancialHealthService.getFinancialTrends(userId, 'monthly');
            expect(trends.growthRates).toBeDefined();
            expect(trends.growthRates.income).toBeDefined();
            expect(trends.growthRates.savings).toBeDefined();
            expect(trends.growthRates.netWorth).toBeDefined();
        });

        it('should provide seasonality analysis', async () => {
            const trends = await FinancialHealthService.getFinancialTrends(userId, 'monthly');
            expect(trends.seasonality).toBeDefined();
            expect(trends.seasonality.highSpendingMonths).toBeDefined();
            expect(trends.seasonality.lowSpendingMonths).toBeDefined();
        });
    });
});