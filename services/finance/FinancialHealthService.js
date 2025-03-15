'use strict';

const { Income, Expense, SavingsGoal, BankAccount } = require('../../models');
const { ValidationError } = require('../../utils/errors');
const LoggingService = require('../monitoring/LoggingService');

class FinancialHealthService {
    /**
     * Get a complete financial health check
     * @param {string} userId - The user ID
     * @returns {Promise<Object>} Financial health report
     */
    static async getFinancialHealth(userId) {
        try {
            // Get all required data
            const [income, expenses, savings, accounts] = await Promise.all([
                Income.findAll({ where: { user_id: userId } }),
                Expense.findAll({ where: { user_id: userId } }),
                SavingsGoal.findAll({ where: { user_id: userId } }),
                BankAccount.findAll({ where: { user_id: userId } })
            ]);

            // Calculate key metrics
            const metrics = await this.calculateFinancialMetrics(income, expenses, savings, accounts);

            // Generate recommendations
            const recommendations = await this.generateRecommendations(metrics);

            return {
                metrics,
                recommendations,
                status: this.determineFinancialStatus(metrics)
            };
        } catch (error) {
            LoggingService.logError(error, {
                context: 'FinancialHealthService.getFinancialHealth',
                userId
            });
            throw error;
        }
    }

    /**
     * Calculate key financial metrics
     * @private
     */
    static async calculateFinancialMetrics(income, expenses, savings, accounts) {
        const monthlyIncome = this.calculateTotalMonthlyIncome(income);
        const monthlyExpenses = this.calculateTotalMonthlyExpenses(expenses);
        const totalSavings = accounts.reduce((sum, account) => sum + account.current_balance, 0);
        const totalDebt = expenses.filter(e => e.type === 'EMI').reduce((sum, e) => sum + e.amount, 0);

        return {
            monthlyIncome,
            monthlyExpenses,
            monthlySavings: monthlyIncome - monthlyExpenses,
            savingsRate: ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100,
            debtToIncomeRatio: (totalDebt / monthlyIncome) * 100,
            emergencyFundRatio: totalSavings / monthlyExpenses,
            expenseBreakdown: this.calculateExpenseBreakdown(expenses, monthlyExpenses),
            budgetHealth: this.analyzeExpenseDistribution(expenses, monthlyIncome)
        };
    }

    /**
     * Calculate total monthly income including recurring income
     * @private
     */
    static calculateTotalMonthlyIncome(income) {
        return income.reduce((total, inc) => {
            switch (inc.frequency) {
                case 'monthly':
                    return total + inc.amount;
                case 'quarterly':
                    return total + (inc.amount / 3);
                case 'yearly':
                    return total + (inc.amount / 12);
                case 'one_time':
                    return total;
                default:
                    return total;
            }
        }, 0);
    }

    /**
     * Calculate total monthly expenses including recurring expenses
     * @private
     */
    static calculateTotalMonthlyExpenses(expenses) {
        return expenses.reduce((total, exp) => {
            if (!exp.is_recurring) return total;
            
            switch (exp.frequency) {
                case 'monthly':
                    return total + exp.amount;
                case 'quarterly':
                    return total + (exp.amount / 3);
                case 'yearly':
                    return total + (exp.amount / 12);
                default:
                    return total;
            }
        }, 0);
    }

    /**
     * Calculate expense breakdown by category
     * @private
     */
    static calculateExpenseBreakdown(expenses, totalExpenses) {
        const breakdown = {};
        expenses.forEach(expense => {
            breakdown[expense.category] = breakdown[expense.category] || 0;
            breakdown[expense.category] += expense.amount;
        });

        // Convert to percentages
        Object.keys(breakdown).forEach(category => {
            breakdown[category] = (breakdown[category] / totalExpenses) * 100;
        });

        return breakdown;
    }

    /**
     * Analyze expense distribution (50/30/20 rule)
     * @private
     */
    static analyzeExpenseDistribution(expenses, monthlyIncome) {
        const needs = expenses.filter(e => 
            ['Bills', 'Groceries', 'Health', 'Transport'].includes(e.category)
        ).reduce((sum, e) => sum + e.amount, 0);

        const wants = expenses.filter(e =>
            ['Entertainment', 'Shopping', 'Travel'].includes(e.category)
        ).reduce((sum, e) => sum + e.amount, 0);

        const savings = monthlyIncome - needs - wants;

        return {
            needs: (needs / monthlyIncome) * 100,
            wants: (wants / monthlyIncome) * 100,
            savings: (savings / monthlyIncome) * 100,
            isHealthy: needs <= (monthlyIncome * 0.5) && 
                      wants <= (monthlyIncome * 0.3) && 
                      savings >= (monthlyIncome * 0.2)
        };
    }

    /**
     * Generate personalized financial recommendations
     * @private
     */
    static generateRecommendations(metrics) {
        const recommendations = [];

        // Emergency fund recommendations
        if (metrics.emergencyFundRatio < 6) {
            recommendations.push({
                category: 'Emergency Fund',
                priority: 'High',
                recommendation: `Build emergency fund to cover ${Math.ceil(6 - metrics.emergencyFundRatio)} more months of expenses`,
                action: `Save ₹${Math.ceil(metrics.monthlyExpenses * (6 - metrics.emergencyFundRatio))} more`
            });
        }

        // Savings rate recommendations
        if (metrics.savingsRate < 20) {
            recommendations.push({
                category: 'Savings',
                priority: 'High',
                recommendation: 'Increase monthly savings rate to at least 20%',
                action: `Cut expenses by ₹${Math.ceil(metrics.monthlyIncome * 0.2 - metrics.monthlySavings)}`
            });
        }

        // Debt recommendations
        if (metrics.debtToIncomeRatio > 40) {
            recommendations.push({
                category: 'Debt Management',
                priority: 'High',
                recommendation: 'Reduce debt-to-income ratio to below 40%',
                action: 'Consider debt consolidation or accelerated debt repayment'
            });
        }

        // Budget distribution recommendations
        if (!metrics.budgetHealth.isHealthy) {
            if (metrics.budgetHealth.needs > 50) {
                recommendations.push({
                    category: 'Budget Distribution',
                    priority: 'Medium',
                    recommendation: 'Reduce essential expenses',
                    action: `Reduce monthly essential expenses by ₹${Math.ceil(metrics.monthlyIncome * (metrics.budgetHealth.needs - 50) / 100)}`
                });
            }
            if (metrics.budgetHealth.wants > 30) {
                recommendations.push({
                    category: 'Budget Distribution',
                    priority: 'Medium',
                    recommendation: 'Reduce discretionary spending',
                    action: `Reduce monthly discretionary spending by ₹${Math.ceil(metrics.monthlyIncome * (metrics.budgetHealth.wants - 30) / 100)}`
                });
            }
        }

        // Sort recommendations by priority
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return recommendations;
    }

    /**
     * Determine overall financial status
     * @private
     */
    static determineFinancialStatus(metrics) {
        let score = 0;
        
        // Emergency fund score (max 30 points)
        score += Math.min(metrics.emergencyFundRatio * 5, 30);
        
        // Savings rate score (max 30 points)
        score += Math.min(metrics.savingsRate * 1.5, 30);
        
        // Debt-to-income score (max 20 points)
        score += Math.max(0, 20 - (metrics.debtToIncomeRatio * 0.5));
        
        // Budget health score (max 20 points)
        score += metrics.budgetHealth.isHealthy ? 20 : 
            (20 - Math.abs(metrics.budgetHealth.needs - 50) * 0.2 
                - Math.abs(metrics.budgetHealth.wants - 30) * 0.2);

        // Determine status based on score
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    }
}

module.exports = FinancialHealthService;