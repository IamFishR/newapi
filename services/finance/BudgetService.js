const { BudgetCategory, Transaction } = require('../../models/finance/budget');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('sequelize');

class BudgetService {
    /**
     * Get all active budget categories
     */
    static async getBudgetCategories() {
        try {
            const categories = await BudgetCategory.findAll({
                where: {
                    deleted_at: null
                },
                order: [['name', 'ASC']]
            });
            
            return categories;
        } catch (error) {
            console.error('Error fetching budget categories:', error);
            throw new Error('Failed to fetch budget categories');
        }
    }

    /**
     * Get budget trends for a specific time range
     * @param {string} range Time range (e.g. '1W', '1M', '3M', '6M', '1Y')
     * @param {number} userId User ID
     */
    static async getBudgetTrends(range, userId) {
        try {
            // Convert range to date
            const endDate = new Date();
            const startDate = this.calculateStartDate(range);
            
            // Fetch transactions within the date range
            const transactions = await Transaction.findAll({
                where: {
                    user_id: userId,
                    transaction_date: {
                        [Op.between]: [startDate, endDate]
                    },
                    deleted_at: null
                },
                include: [
                    {
                        model: BudgetCategory,
                        as: 'category',
                        attributes: ['id', 'name', 'color']
                    }
                ],
                order: [['transaction_date', 'ASC']]
            });
            
            // Group transactions by month and category
            const monthlyData = this.groupTransactionsByMonth(transactions);
            
            // Calculate trendline data
            const trendData = this.calculateTrendData(transactions, startDate, endDate);
            
            return {
                monthly: monthlyData,
                trend: trendData
            };
        } catch (error) {
            console.error('Error fetching budget trends:', error);
            throw new Error('Failed to fetch budget trends data');
        }
    }

    /**
     * Get budget comparison between actual spending and budget targets
     * @param {number} userId User ID
     */
    static async getBudgetComparison(userId) {
        try {
            // Get current month boundaries
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            // Fetch all categories
            const categories = await BudgetCategory.findAll({
                where: { deleted_at: null }
            });
            
            // Fetch transactions for current month
            const transactions = await Transaction.findAll({
                where: {
                    user_id: userId,
                    transaction_date: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    },
                    deleted_at: null
                },
                include: [
                    {
                        model: BudgetCategory,
                        as: 'category'
                    }
                ]
            });
            
            // Calculate spending per category
            const categorySpending = transactions.reduce((acc, transaction) => {
                const categoryId = transaction.category?.id || 'uncategorized';
                acc[categoryId] = (acc[categoryId] || 0) + transaction.amount;
                return acc;
            }, {});
            
            // For now, return dummy budget targets until we have a proper budget setup feature
            // In a real app, you would fetch this from a budget table
            const dummyBudgetTargets = {
                housing: 1500,
                utilities: 300,
                transportation: 250,
                groceries: 500,
                entertainment: 200,
                healthcare: 150,
                other: 300
            };
            
            // Prepare comparison data with actual vs budget
            const comparisonData = categories.map(category => {
                const categoryName = category.name.toLowerCase();
                const actualSpending = categorySpending[category.id] || 0;
                const budgetTarget = dummyBudgetTargets[categoryName] || 0;
                const variance = budgetTarget - actualSpending;
                const percentUsed = budgetTarget > 0 ? (actualSpending / budgetTarget) * 100 : 0;
                
                return {
                    categoryId: category.id,
                    categoryName: category.name,
                    color: category.color,
                    actualSpending,
                    budgetTarget,
                    variance,
                    percentUsed: Math.min(percentUsed, 100) // Cap at 100%
                };
            });
            
            return comparisonData;
        } catch (error) {
            console.error('Error fetching budget comparison:', error);
            throw new Error('Failed to fetch budget comparison data');
        }
    }

    /**
     * Helper to convert time range to start date
     * @param {string} range Time range
     * @returns {Date} Start date
     */
    static calculateStartDate(range) {
        const now = new Date();
        switch (range) {
            case '1W':
                return new Date(now.setDate(now.getDate() - 7));
            case '1M':
                return new Date(now.setMonth(now.getMonth() - 1));
            case '3M':
                return new Date(now.setMonth(now.getMonth() - 3));
            case '6M':
                return new Date(now.setMonth(now.getMonth() - 6));
            case '1Y':
                return new Date(now.setFullYear(now.getFullYear() - 1));
            default:
                return new Date(now.setMonth(now.getMonth() - 1)); // Default to 1M
        }
    }

    /**
     * Group transactions by month and category
     * @param {Array} transactions List of transactions
     * @returns {Object} Grouped data
     */
    static groupTransactionsByMonth(transactions) {
        const monthlyData = {};
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.transaction_date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {};
            }
            
            const categoryId = transaction.category?.id || 'uncategorized';
            const categoryName = transaction.category?.name || 'Uncategorized';
            
            if (!monthlyData[monthKey][categoryId]) {
                monthlyData[monthKey][categoryId] = {
                    name: categoryName,
                    color: transaction.category?.color || '#CCCCCC',
                    total: 0
                };
            }
            
            monthlyData[monthKey][categoryId].total += transaction.amount;
        });
        
        return monthlyData;
    }

    /**
     * Calculate trend data for income vs expenses
     * @param {Array} transactions List of transactions
     * @param {Date} startDate Start date
     * @param {Date} endDate End date
     * @returns {Object} Trend data
     */
    static calculateTrendData(transactions, startDate, endDate) {
        const incomeByDay = {};
        const expensesByDay = {};
        
        // Initialize data points for each day in range
        const dayMillis = 24 * 60 * 60 * 1000;
        for (let d = new Date(startDate); d <= endDate; d = new Date(d.getTime() + dayMillis)) {
            const dateKey = d.toISOString().split('T')[0];
            incomeByDay[dateKey] = 0;
            expensesByDay[dateKey] = 0;
        }
        
        // Populate with actual data
        transactions.forEach(transaction => {
            const dateKey = new Date(transaction.transaction_date).toISOString().split('T')[0];
            if (transaction.type === 'income') {
                incomeByDay[dateKey] = (incomeByDay[dateKey] || 0) + transaction.amount;
            } else {
                expensesByDay[dateKey] = (expensesByDay[dateKey] || 0) + transaction.amount;
            }
        });
        
        // Convert to arrays for charting
        const income = Object.keys(incomeByDay).map(date => ({
            date,
            amount: incomeByDay[date]
        }));
        
        const expenses = Object.keys(expensesByDay).map(date => ({
            date,
            amount: expensesByDay[date]
        }));
        
        return { income, expenses };
    }
}

module.exports = BudgetService;