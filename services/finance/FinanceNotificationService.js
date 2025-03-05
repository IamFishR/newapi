const { Op } = require('sequelize');
const { 
    FinancialProfile,
    DebtItem,
    FinancialGoal,
    Investment,
    TaxProfile
} = require('../../models/finance');
const NotificationService = require('../notifications/NotificationService');

class FinanceNotificationService {
    static async checkAndSendNotifications() {
        await Promise.all([
            this.checkBudgetAlerts(),
            this.checkDebtPaymentDueDates(),
            this.checkGoalDeadlines(),
            this.checkInvestmentAlerts(),
            this.checkTaxDeadlines()
        ]);
    }

    static async checkBudgetAlerts() {
        const profiles = await FinancialProfile.findAll({
            where: {
                lastUpdated: {
                    [Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            }
        });

        for (const profile of profiles) {
            // Check if monthly expenses exceed income
            const totalExpenses = Object.values(profile.monthlyExpenses)
                .reduce((sum, amount) => sum + Number(amount), 0);

            if (totalExpenses > profile.monthlyIncome) {
                await NotificationService.sendNotification({
                    userId: profile.userId,
                    type: 'budget_alert',
                    title: 'Budget Alert',
                    message: 'Your monthly expenses have exceeded your income.',
                    data: {
                        expenses: totalExpenses,
                        income: profile.monthlyIncome,
                        difference: totalExpenses - profile.monthlyIncome
                    }
                });
            }

            // Check if close to monthly savings goal
            const currentSavings = profile.monthlyIncome - totalExpenses;
            if (currentSavings < profile.monthlySavingsGoal) {
                await NotificationService.sendNotification({
                    userId: profile.userId,
                    type: 'savings_alert',
                    title: 'Savings Goal Alert',
                    message: 'You are below your monthly savings target.',
                    data: {
                        target: profile.monthlySavingsGoal,
                        current: currentSavings,
                        shortfall: profile.monthlySavingsGoal - currentSavings
                    }
                });
            }
        }
    }

    static async checkDebtPaymentDueDates() {
        const upcomingDueDates = await DebtItem.findAll({
            where: {
                dueDate: {
                    [Op.between]: [
                        new Date(),
                        new Date(new Date().setDate(new Date().getDate() + 7))
                    ]
                }
            }
        });

        for (const debt of upcomingDueDates) {
            await NotificationService.sendNotification({
                userId: debt.userId,
                type: 'debt_payment_due',
                title: 'Upcoming Debt Payment',
                message: `Payment for ${debt.name} is due on ${debt.dueDate.toLocaleDateString()}`,
                data: {
                    debtId: debt.id,
                    amount: debt.minimumPayment,
                    dueDate: debt.dueDate
                }
            });
        }
    }

    static async checkGoalDeadlines() {
        const upcomingDeadlines = await FinancialGoal.findAll({
            where: {
                status: 'active',
                targetDate: {
                    [Op.between]: [
                        new Date(),
                        new Date(new Date().setDate(new Date().getDate() + 30))
                    ]
                }
            }
        });

        for (const goal of upcomingDeadlines) {
            const daysRemaining = Math.ceil(
                (new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)
            );

            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const remainingAmount = goal.targetAmount - goal.currentAmount;

            await NotificationService.sendNotification({
                userId: goal.userId,
                type: 'goal_deadline',
                title: 'Financial Goal Deadline Approaching',
                message: `${goal.name} deadline is in ${daysRemaining} days`,
                data: {
                    goalId: goal.id,
                    daysRemaining,
                    progress,
                    remainingAmount
                }
            });
        }
    }

    static async checkInvestmentAlerts() {
        const investments = await Investment.findAll({
            where: {
                lastPriceUpdate: {
                    [Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000)
                }
            }
        });

        for (const investment of investments) {
            const priceChange = (investment.currentPrice - investment.averageCost) / investment.averageCost * 100;

            // Alert on significant price changes (>5%)
            if (Math.abs(priceChange) >= 5) {
                await NotificationService.sendNotification({
                    userId: investment.userId,
                    type: 'investment_alert',
                    title: 'Significant Price Movement',
                    message: `${investment.symbol} has moved ${priceChange > 0 ? 'up' : 'down'} by ${Math.abs(priceChange).toFixed(2)}%`,
                    data: {
                        investmentId: investment.id,
                        symbol: investment.symbol,
                        priceChange,
                        currentPrice: investment.currentPrice
                    }
                });
            }
        }
    }

    static async checkTaxDeadlines() {
        const profiles = await TaxProfile.findAll();
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        const taxDeadlines = [
            { date: `${currentYear}-04-15`, type: 'federal_return', description: 'Federal Tax Return Due' },
            { date: `${currentYear}-04-15`, type: 'q1_estimated', description: 'Q1 Estimated Tax Payment Due' },
            { date: `${currentYear}-06-15`, type: 'q2_estimated', description: 'Q2 Estimated Tax Payment Due' },
            { date: `${currentYear}-09-15`, type: 'q3_estimated', description: 'Q3 Estimated Tax Payment Due' },
            { date: `${currentYear}-01-15`, type: 'q4_estimated', description: 'Q4 Estimated Tax Payment Due' }
        ];

        for (const profile of profiles) {
            for (const deadline of taxDeadlines) {
                const deadlineDate = new Date(deadline.date);
                const daysUntilDeadline = Math.ceil((deadlineDate - currentDate) / (1000 * 60 * 60 * 24));

                // Alert for upcoming deadlines (30, 14, and 7 days before)
                if ([30, 14, 7].includes(daysUntilDeadline)) {
                    await NotificationService.sendNotification({
                        userId: profile.userId,
                        type: 'tax_deadline',
                        title: 'Tax Deadline Reminder',
                        message: `${deadline.description} in ${daysUntilDeadline} days`,
                        data: {
                            deadlineType: deadline.type,
                            dueDate: deadline.date,
                            daysRemaining: daysUntilDeadline
                        }
                    });
                }
            }
        }
    }
}

module.exports = FinanceNotificationService;