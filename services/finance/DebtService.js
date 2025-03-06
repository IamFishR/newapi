const { DebtItem, DebtPayment, User } = require('../../models');
const ValidationError = require('../../utils/ValidationError');
const { Op } = require('sequelize');
const FinanceErrorHandler = require('./FinanceErrorHandler');

class DebtService {
    async getDebtItems(userId) {
        try {
            return await DebtItem.findAll({
                where: { userId },
                include: [{
                    model: DebtPayment,
                    as: 'payments',
                    attributes: ['id', 'amount', 'paymentDate', 'principalAmount', 'interestAmount']
                }],
                order: [['dueDate', 'ASC']]
            });
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'debt_get_items');
        }
    }

    async createDebtItem(userId, data) {
        try {
            const debt = await DebtItem.create({
                userId,
                ...data,
                initialBalance: data.balance
            });
            return this.getDebtItemById(debt.id, userId);
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'debt_create');
        }
    }

    async updateDebtItem(id, userId, data) {
        try {
            const debt = await this.getDebtItemById(id, userId);
            if (!debt) {
                throw new ValidationError('Debt item not found');
            }
            await debt.update(data);
            return this.getDebtItemById(id, userId);
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'debt_update');
        }
    }

    async deleteDebtItem(id, userId) {
        try {
            const debt = await this.getDebtItemById(id, userId);
            if (!debt) {
                throw new ValidationError('Debt item not found');
            }
            await debt.destroy();
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'debt_delete');
        }
    }

    async getDebtItemById(id, userId) {
        try {
            return await DebtItem.findOne({
                where: { id, userId },
                include: [{
                    model: DebtPayment,
                    as: 'payments',
                    attributes: ['id', 'amount', 'paymentDate', 'principalAmount', 'interestAmount']
                }]
            });
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'debt_get_by_id');
        }
    }

    async calculatePayoffStrategy(userId, { strategy, additionalPayment = 0 }) {
        try {
            const debts = await this.getDebtItems(userId);
            if (!debts.length) {
                return { totalMonths: 0, totalInterest: 0, payoffSchedule: [] };
            }

            // Sort debts based on strategy
            const sortedDebts = strategy === 'avalanche' 
                ? debts.sort((a, b) => b.interestRate - a.interestRate)
                : debts.sort((a, b) => a.balance - b.balance);

            let totalMonths = 0;
            let totalInterest = 0;
            const payoffSchedule = [];

            const minimumTotal = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
            const availableExtra = additionalPayment;

            for (const debt of sortedDebts) {
                const schedule = this.calculateIndividualPayoff(
                    debt.balance,
                    debt.interestRate,
                    debt.minimumPayment,
                    availableExtra
                );

                totalMonths = Math.max(totalMonths, schedule.months);
                totalInterest += schedule.totalInterest;
                payoffSchedule.push({
                    debtId: debt.id,
                    name: debt.name,
                    months: schedule.months,
                    totalInterest: schedule.totalInterest,
                    monthlyPayment: schedule.monthlyPayment
                });
            }

            return {
                totalMonths,
                totalInterest,
                payoffSchedule,
                monthlyCost: minimumTotal + additionalPayment
            };
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'debt_payoff_strategy');
        }
    }

    calculateIndividualPayoff(balance, annualRate, minimumPayment, extraPayment) {
        try {
            const monthlyRate = annualRate / 12 / 100;
            let remainingBalance = balance;
            let months = 0;
            let totalInterest = 0;
            const monthlyPayment = minimumPayment + extraPayment;

            while (remainingBalance > 0 && months < 360) { // 30-year maximum
                const interestPayment = remainingBalance * monthlyRate;
                const principalPayment = Math.min(remainingBalance, monthlyPayment - interestPayment);
                
                totalInterest += interestPayment;
                remainingBalance -= principalPayment;
                months++;
            }

            return {
                months,
                totalInterest,
                monthlyPayment
            };
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'debt_individual_payoff');
        }
    }

    async addPayment(userId, debtId, paymentData) {
        try {
            const debt = await this.getDebtItemById(debtId, userId);
            if (!debt) {
                throw new ValidationError('Debt item not found');
            }

            const monthlyRate = debt.interestRate / 12 / 100;
            const interestAmount = debt.balance * monthlyRate;
            const principalAmount = paymentData.amount - interestAmount;

            const payment = await DebtPayment.create({
                userId,
                debtId,
                ...paymentData,
                principalAmount: Math.max(0, principalAmount),
                interestAmount
            });

            // Update debt balance
            await debt.update({
                balance: Math.max(0, debt.balance - principalAmount)
            });

            return payment;
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'debt_add_payment');
        }
    }

    async getDebtAnalytics(userId) {
        try {
            const debts = await this.getDebtItems(userId);
            
            const analytics = {
                totalDebt: 0,
                averageInterestRate: 0,
                monthlyPayments: 0,
                debtsByType: {},
                payoffProjection: {}
            };

            if (!debts.length) return analytics;

            analytics.totalDebt = debts.reduce((sum, debt) => sum + Number(debt.balance), 0);
            analytics.averageInterestRate = debts.reduce((sum, debt) => 
                sum + (Number(debt.balance) * Number(debt.interestRate)), 0) / analytics.totalDebt;
            analytics.monthlyPayments = debts.reduce((sum, debt) => sum + Number(debt.minimumPayment), 0);

            // Group by type
            debts.forEach(debt => {
                if (!analytics.debtsByType[debt.type]) {
                    analytics.debtsByType[debt.type] = 0;
                }
                analytics.debtsByType[debt.type] += Number(debt.balance);
            });

            // Calculate projected payoff dates
            const strategies = await Promise.all([
                this.calculatePayoffStrategy(userId, { strategy: 'minimum' }),
                this.calculatePayoffStrategy(userId, { strategy: 'snowball' }),
                this.calculatePayoffStrategy(userId, { strategy: 'avalanche' })
            ]);

            analytics.payoffProjection = {
                minimum: strategies[0],
                snowball: strategies[1],
                avalanche: strategies[2]
            };

            return analytics;
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'debt_analytics');
        }
    }
}

module.exports = new DebtService();