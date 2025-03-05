const cron = require('node-cron');
const FinanceNotificationService = require('./FinanceNotificationService');
const MarketDataService = require('../market/MarketDataService');
const InvestmentService = require('./InvestmentService');
const { Investment } = require('../../models/finance');
const logger = require('../../utils/logger');

class FinanceScheduler {
    static initializeScheduledTasks() {
        // Check and send notifications - run every hour
        cron.schedule('0 * * * *', async () => {
            try {
                await FinanceNotificationService.checkAndSendNotifications();
            } catch (error) {
                logger.error('Error in notification check:', error);
            }
        });

        // Update investment prices - run every market day at market close (4 PM EST)
        cron.schedule('0 16 * * 1-5', async () => {
            try {
                const investments = await Investment.findAll();
                for (const investment of investments) {
                    try {
                        const latestPrice = await MarketDataService.getLatestPrice(investment.symbol);
                        if (latestPrice) {
                            await investment.update({
                                currentPrice: latestPrice,
                                lastPriceUpdate: new Date()
                            });
                        }
                    } catch (error) {
                        logger.error(`Error updating price for ${investment.symbol}:`, error);
                    }
                }
            } catch (error) {
                logger.error('Error in investment price update:', error);
            }
        });

        // Calculate portfolio analytics - run daily at midnight
        cron.schedule('0 0 * * *', async () => {
            try {
                const investmentService = new InvestmentService();
                const investments = await Investment.findAll({
                    attributes: ['userId'],
                    group: ['userId']
                });

                for (const inv of investments) {
                    try {
                        await investmentService.getInvestmentAnalytics(inv.userId);
                    } catch (error) {
                        logger.error(`Error calculating analytics for user ${inv.userId}:`, error);
                    }
                }
            } catch (error) {
                logger.error('Error in portfolio analytics calculation:', error);
            }
        });

        // Process recurring transactions - run daily at 1 AM
        cron.schedule('0 1 * * *', async () => {
            try {
                await this.processRecurringTransactions();
            } catch (error) {
                logger.error('Error processing recurring transactions:', error);
            }
        });

        // Update tax estimates - run weekly on Sunday at 2 AM
        cron.schedule('0 2 * * 0', async () => {
            try {
                await this.updateTaxEstimates();
            } catch (error) {
                logger.error('Error updating tax estimates:', error);
            }
        });

        // Clean up old data - run monthly on the 1st at 3 AM
        cron.schedule('0 3 1 * *', async () => {
            try {
                await this.cleanupOldData();
            } catch (error) {
                logger.error('Error cleaning up old data:', error);
            }
        });
    }

    static async processRecurringTransactions() {
        // Process recurring transactions implementation
        // This would handle scheduled transfers, bill payments, etc.
    }

    static async updateTaxEstimates() {
        // Update tax estimates implementation
        // This would recalculate estimated taxes based on latest income and deductions
    }

    static async cleanupOldData() {
        // Data cleanup implementation
        // This would archive old transactions, clean up temporary data, etc.
    }
}

module.exports = FinanceScheduler;