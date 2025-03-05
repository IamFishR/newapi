const {
    FinanceService,
    DebtService,
    GoalsService,
    InvestmentService,
    NetWorthService,
    TaxService
} = require('../../../services/finance');
const { 
    FinancialProfile,
    DebtItem,
    FinancialGoal,
    Investment,
    TaxProfile 
} = require('../../../models/finance');
const ValidationError = require('../../../errors/ValidationError');

describe('Finance Services', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('FinanceService', () => {
        describe('getFinancialProfile', () => {
            it('should return user financial profile', async () => {
                const mockProfile = {
                    userId: 'test-user',
                    monthlyIncome: 5000,
                    monthlySavingsGoal: 1000
                };

                jest.spyOn(FinancialProfile, 'findOne').mockResolvedValue(mockProfile);
                const result = await FinanceService.getFinancialProfile('test-user');
                expect(result).toEqual(mockProfile);
            });
        });

        describe('updateFinancialProfile', () => {
            it('should validate and update profile', async () => {
                const mockProfile = {
                    userId: 'test-user',
                    monthlyIncome: 5000
                };

                jest.spyOn(FinancialProfile, 'update').mockResolvedValue([1]);
                const result = await FinanceService.updateFinancialProfile('test-user', mockProfile);
                expect(result).toBeTruthy();
            });
        });
    });

    describe('DebtService', () => {
        describe('calculatePayoffStrategy', () => {
            it('should calculate avalanche strategy correctly', async () => {
                const mockDebts = [
                    { balance: 1000, interestRate: 20 },
                    { balance: 500, interestRate: 15 }
                ];

                jest.spyOn(DebtItem, 'findAll').mockResolvedValue(mockDebts);
                const result = await DebtService.calculatePayoffStrategy('test-user', 'avalanche');
                
                expect(result.totalDebt).toBe(1500);
                expect(result.sortedDebts[0].interestRate).toBe(20);
            });
        });
    });

    describe('GoalsService', () => {
        describe('addContribution', () => {
            it('should add contribution and update goal progress', async () => {
                const mockGoal = {
                    id: 'goal-1',
                    currentAmount: 500,
                    targetAmount: 1000,
                    update: jest.fn()
                };

                jest.spyOn(FinancialGoal, 'findOne').mockResolvedValue(mockGoal);
                await GoalsService.addContribution('test-user', 'goal-1', { amount: 200 });
                
                expect(mockGoal.update).toHaveBeenCalledWith(
                    expect.objectContaining({ currentAmount: 700 })
                );
            });
        });
    });

    describe('InvestmentService', () => {
        describe('addInvestmentTransaction', () => {
            it('should validate and record investment transaction', async () => {
                const mockInvestment = {
                    id: 'inv-1',
                    shares: 10,
                    averageCost: 100,
                    update: jest.fn()
                };

                jest.spyOn(Investment, 'findOne').mockResolvedValue(mockInvestment);
                await InvestmentService.addTransaction('test-user', 'inv-1', {
                    type: 'buy',
                    shares: 5,
                    pricePerShare: 110
                });

                expect(mockInvestment.update).toHaveBeenCalled();
            });

            it('should prevent selling more shares than owned', async () => {
                const mockInvestment = {
                    id: 'inv-1',
                    shares: 10
                };

                jest.spyOn(Investment, 'findOne').mockResolvedValue(mockInvestment);
                await expect(
                    InvestmentService.addTransaction('test-user', 'inv-1', {
                        type: 'sell',
                        shares: 15,
                        pricePerShare: 100
                    })
                ).rejects.toThrow(ValidationError);
            });
        });
    });

    describe('NetWorthService', () => {
        describe('calculateNetWorthHistory', () => {
            it('should calculate net worth over time correctly', async () => {
                const mockAssets = [
                    { value: 10000, valueHistory: [] }
                ];
                const mockLiabilities = [
                    { amount: 5000 }
                ];

                jest.spyOn(NetWorthService, 'calculateAssetsAtDate')
                    .mockResolvedValue(10000);
                jest.spyOn(NetWorthService, 'calculateLiabilitiesAtDate')
                    .mockResolvedValue(5000);

                const result = await NetWorthService.getNetWorthHistory(
                    'test-user',
                    new Date('2024-01-01'),
                    new Date('2024-03-01')
                );

                expect(result.length).toBeGreaterThan(0);
                expect(result[0].netWorth).toBe(5000);
            });
        });
    });

    describe('TaxService', () => {
        describe('calculateEstimatedTaxes', () => {
            it('should calculate tax liability correctly', async () => {
                const mockProfile = {
                    estimatedIncome: 100000,
                    estimatedDeductions: 12000,
                    estimatedTaxCredits: 1000,
                    withholdingAmount: 15000,
                    update: jest.fn()
                };

                jest.spyOn(TaxProfile, 'findOne').mockResolvedValue(mockProfile);
                const result = await TaxService.calculateEstimatedTaxes('test-user');

                expect(result.taxableIncome).toBe(88000);
                expect(result.totalTax).toBeGreaterThan(0);
                expect(result.remainingDue).toBeDefined();
            });
        });
    });
});

describe('Integration Tests', () => {
    describe('Goal-Based Savings', () => {
        it('should track goal progress with contributions', async () => {
            // Create a financial goal
            const goal = await GoalsService.createFinancialGoal('test-user', {
                name: 'Test Goal',
                targetAmount: 1000,
                targetDate: new Date('2024-12-31')
            });

            // Add contributions
            await GoalsService.addContribution('test-user', goal.id, {
                amount: 500,
                date: new Date()
            });

            // Check progress
            const updatedGoal = await GoalsService.getGoalById(goal.id, 'test-user');
            expect(updatedGoal.currentAmount).toBe(500);
            expect(updatedGoal.status).toBe('active');
        });
    });

    describe('Investment Portfolio Management', () => {
        it('should calculate portfolio performance correctly', async () => {
            // Add investment
            const investment = await InvestmentService.addInvestment('test-user', {
                symbol: 'TEST',
                shares: 10,
                purchasePrice: 100
            });

            // Record a transaction
            await InvestmentService.addTransaction('test-user', investment.id, {
                type: 'buy',
                shares: 5,
                pricePerShare: 110
            });

            // Get portfolio analytics
            const analytics = await InvestmentService.getInvestmentAnalytics('test-user');
            expect(analytics.totalValue).toBeGreaterThan(0);
            expect(analytics.performanceBySymbol).toHaveLength(1);
        });
    });

    describe('Budget Tracking', () => {
        it('should enforce budget limits', async () => {
            // Set up budget category
            const category = await FinanceService.createBudgetCategory('test-user', {
                name: 'Test Category',
                budgetedAmount: 1000
            });

            // Add transactions
            await FinanceService.addTransaction('test-user', {
                categoryId: category.id,
                amount: 800,
                type: 'expense'
            });

            // Verify remaining budget
            const budgetStatus = await FinanceService.getBudgetStatus('test-user');
            expect(budgetStatus.categories[category.id].remaining).toBe(200);
        });
    });
});

describe('Error Handling', () => {
    it('should handle invalid input data', async () => {
        await expect(
            FinanceService.updateFinancialProfile('test-user', {
                monthlyIncome: -1000
            })
        ).rejects.toThrow(ValidationError);
    });

    it('should handle non-existent resources', async () => {
        await expect(
            GoalsService.getGoalById('non-existent', 'test-user')
        ).rejects.toThrow(ValidationError);
    });

    it('should handle API errors gracefully', async () => {
        jest.spyOn(Investment.prototype, 'save')
            .mockRejectedValue(new Error('Database error'));

        await expect(
            InvestmentService.addInvestment('test-user', {
                symbol: 'TEST',
                shares: 10,
                purchasePrice: 100
            })
        ).rejects.toThrow();
    });
});