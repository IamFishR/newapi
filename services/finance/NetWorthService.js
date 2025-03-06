const { Asset, Liability, Investment, DebtItem, User } = require('../../models');
const ValidationError = require('../../utils/ValidationError');
const FinanceErrorHandler = require('./FinanceErrorHandler');
const { Op } = require('sequelize');

class NetWorthService {
    async getNetWorthHistory(userId, startDate, endDate) {
        try {
            // Get all assets and their historical values
            const [assets, liabilities, investments, debts] = await Promise.all([
                Asset.findAll({ where: { userId } }),
                Liability.findAll({ where: { userId } }),
                Investment.findAll({ where: { userId } }),
                DebtItem.findAll({ where: { userId } })
            ]);

            // Calculate net worth over time
            const history = [];
            const currentDate = new Date();
            const start = startDate || new Date(currentDate.setMonth(currentDate.getMonth() - 12));
            const end = endDate || new Date();

            // Generate monthly points
            for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
                const point = {
                    date: new Date(d),
                    assets: this.calculateAssetsAtDate(assets, d),
                    liabilities: this.calculateLiabilitiesAtDate(liabilities),
                    investments: this.calculateInvestmentsAtDate(investments, d),
                    debts: this.calculateDebtsAtDate(debts, d)
                };

                point.netWorth = point.assets + point.investments - point.liabilities - point.debts;
                history.push(point);
            }

            return history;
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'networth_history');
        }
    }

    // Asset management
    async addAsset(userId, data) {
        try {
            return await Asset.create({
                userId,
                ...data,
                valueHistory: [{
                    date: new Date(),
                    value: data.value
                }]
            });
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'asset_create');
        }
    }

    async updateAsset(id, userId, data) {
        try {
            const asset = await Asset.findOne({ where: { id, userId } });
            if (!asset) throw new ValidationError('Asset not found');

            // If value changed, add to history
            if (data.value && data.value !== asset.value) {
                const valueHistory = [...asset.valueHistory];
                valueHistory.push({
                    date: new Date(),
                    value: data.value
                });
                data.valueHistory = valueHistory;
            }

            await asset.update({
                ...data,
                lastUpdated: new Date()
            });

            return asset;
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'asset_update');
        }
    }

    async deleteAsset(id, userId) {
        try {
            const asset = await Asset.findOne({ where: { id, userId } });
            if (!asset) throw new ValidationError('Asset not found');
            await asset.destroy();
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'asset_delete');
        }
    }

    // Liability management
    async addLiability(userId, data) {
        try {
            return await Liability.create({ userId, ...data });
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'liability_create');
        }
    }

    async updateLiability(id, userId, data) {
        try {
            const liability = await Liability.findOne({ where: { id, userId } });
            if (!liability) throw new ValidationError('Liability not found');
            await liability.update(data);
            return liability;
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'liability_update');
        }
    }

    async deleteLiability(id, userId) {
        try {
            const liability = await Liability.findOne({ where: { id, userId } });
            if (!liability) throw new ValidationError('Liability not found');
            await liability.destroy();
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'liability_delete');
        }
    }

    // Calculation methods
    calculateAssetsAtDate(assets, date) {
        try {
            return assets.reduce((total, asset) => {
                const historyPoint = asset.valueHistory
                    .filter(h => new Date(h.date) <= date)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                return total + Number(historyPoint ? historyPoint.value : asset.value);
            }, 0);
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'calculate_assets');
        }
    }

    calculateLiabilitiesAtDate(liabilities) {
        try {
            return liabilities.reduce((total, liability) => total + Number(liability.amount), 0);
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'calculate_liabilities');
        }
    }

    calculateInvestmentsAtDate(investments, date) {
        try {
            return investments.reduce((total, investment) => {
                const transactions = investment.transactions
                    .filter(t => new Date(t.date) <= date);

                // Calculate shares owned at date
                const shares = transactions.reduce((sum, t) => 
                    sum + (t.type === 'buy' ? t.shares : -t.shares), 0);

                return total + (shares * investment.currentPrice);
            }, 0);
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'calculate_investments');
        }
    }

    calculateDebtsAtDate(debts, date) {
        try {
            return debts.reduce((total, debt) => {
                const payments = debt.payments
                    .filter(p => new Date(p.paymentDate) <= date);

                const totalPaid = payments.reduce((sum, p) => sum + p.principalAmount, 0);
                return total + (debt.initialBalance - totalPaid);
            }, 0);
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'calculate_debts');
        }
    }

    async getNetWorthAnalytics(userId) {
        try {
            const [assets, liabilities, investments, debts] = await Promise.all([
                Asset.findAll({ where: { userId } }),
                Liability.findAll({ where: { userId } }),
                Investment.findAll({ where: { userId } }),
                DebtItem.findAll({ where: { userId } })
            ]);

            const currentDate = new Date();
            const analytics = {
                summary: {
                    totalAssets: this.calculateAssetsAtDate(assets, currentDate) +
                               this.calculateInvestmentsAtDate(investments, currentDate),
                    totalLiabilities: this.calculateLiabilitiesAtDate(liabilities) +
                                    this.calculateDebtsAtDate(debts, currentDate),
                    netWorth: 0
                },
                assetAllocation: {},
                liabilityBreakdown: {},
                trends: {
                    monthlyChange: 0,
                    yearlyChange: 0
                }
            };

            // Calculate net worth
            analytics.summary.netWorth = analytics.summary.totalAssets - analytics.summary.totalLiabilities;

            // Calculate asset allocation
            assets.forEach(asset => {
                if (!analytics.assetAllocation[asset.category]) {
                    analytics.assetAllocation[asset.category] = 0;
                }
                analytics.assetAllocation[asset.category] += Number(asset.value);
            });

            investments.forEach(investment => {
                if (!analytics.assetAllocation['investments']) {
                    analytics.assetAllocation['investments'] = 0;
                }
                analytics.assetAllocation['investments'] += Number(investment.shares) * Number(investment.currentPrice);
            });

            // Calculate liability breakdown
            liabilities.forEach(liability => {
                if (!analytics.liabilityBreakdown[liability.category]) {
                    analytics.liabilityBreakdown[liability.category] = 0;
                }
                analytics.liabilityBreakdown[liability.category] += Number(liability.amount);
            });

            debts.forEach(debt => {
                if (!analytics.liabilityBreakdown[debt.type]) {
                    analytics.liabilityBreakdown[debt.type] = 0;
                }
                analytics.liabilityBreakdown[debt.type] += Number(debt.balance);
            });

            // Calculate trends
            const history = await this.getNetWorthHistory(userId);
            if (history.length >= 2) {
                analytics.trends.monthlyChange = ((history[history.length - 1].netWorth - 
                                                history[history.length - 2].netWorth) / 
                                                Math.abs(history[history.length - 2].netWorth)) * 100;
            }
            if (history.length >= 12) {
                analytics.trends.yearlyChange = ((history[history.length - 1].netWorth - 
                                               history[history.length - 12].netWorth) / 
                                               Math.abs(history[history.length - 12].netWorth)) * 100;
            }

            return analytics;
        } catch (error) {
            FinanceErrorHandler.handleFinancialOperationError(error, 'networth_analytics');
        }
    }
}

module.exports = new NetWorthService();