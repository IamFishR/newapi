const { Asset, Liability, Investment, DebtItem, User } = require('../../models');
const ValidationError = require('../../utils/ValidationError');
const { Op } = require('sequelize');

class NetWorthService {
    async getNetWorthHistory(userId, startDate, endDate) {
        // Get all assets and their historical values
        const assets = await Asset.findAll({
            where: { userId }
        });

        // Get all liabilities
        const liabilities = await Liability.findAll({
            where: { userId }
        });

        // Get investments
        const investments = await Investment.findAll({
            where: { userId }
        });

        // Get debts
        const debts = await DebtItem.findAll({
            where: { userId }
        });

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
                liabilities: this.calculateLiabilitiesAtDate(liabilities, d),
                investments: this.calculateInvestmentsAtDate(investments, d),
                debts: this.calculateDebtsAtDate(debts, d)
            };

            point.netWorth = point.assets + point.investments - point.liabilities - point.debts;
            history.push(point);
        }

        return history;
    }

    async addAsset(userId, data) {
        const asset = await Asset.create({
            userId,
            ...data,
            valueHistory: [{
                date: new Date(),
                value: data.value
            }]
        });

        return asset;
    }

    async updateAsset(id, userId, data) {
        const asset = await Asset.findOne({
            where: { id, userId }
        });

        if (!asset) {
            throw new ValidationError('Asset not found');
        }

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
    }

    async deleteAsset(id, userId) {
        const asset = await Asset.findOne({
            where: { id, userId }
        });

        if (!asset) {
            throw new ValidationError('Asset not found');
        }

        await asset.destroy();
    }

    async addLiability(userId, data) {
        const liability = await Liability.create({
            userId,
            ...data
        });

        return liability;
    }

    async updateLiability(id, userId, data) {
        const liability = await Liability.findOne({
            where: { id, userId }
        });

        if (!liability) {
            throw new ValidationError('Liability not found');
        }

        await liability.update(data);
        return liability;
    }

    async deleteLiability(id, userId) {
        const liability = await Liability.findOne({
            where: { id, userId }
        });

        if (!liability) {
            throw new ValidationError('Liability not found');
        }

        await liability.destroy();
    }

    calculateAssetsAtDate(assets, date) {
        return assets.reduce((total, asset) => {
            const historyPoint = asset.valueHistory
                .filter(h => new Date(h.date) <= date)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            return total + Number(historyPoint ? historyPoint.value : asset.value);
        }, 0);
    }

    calculateLiabilitiesAtDate(liabilities) {
        return liabilities.reduce((total, liability) => total + Number(liability.amount), 0);
    }

    calculateInvestmentsAtDate(investments, date) {
        return investments.reduce((total, investment) => {
            const transactions = investment.transactions
                .filter(t => new Date(t.date) <= date);

            // Calculate shares owned at date
            const shares = transactions.reduce((sum, t) => 
                sum + (t.type === 'buy' ? t.shares : -t.shares), 0);

            return total + (shares * investment.currentPrice);
        }, 0);
    }

    calculateDebtsAtDate(debts, date) {
        return debts.reduce((total, debt) => {
            const payments = debt.payments
                .filter(p => new Date(p.paymentDate) <= date);

            const totalPaid = payments.reduce((sum, p) => sum + p.principalAmount, 0);
            return total + (debt.initialBalance - totalPaid);
        }, 0);
    }

    async getNetWorthAnalytics(userId) {
        const assets = await Asset.findAll({ where: { userId } });
        const liabilities = await Liability.findAll({ where: { userId } });
        const investments = await Investment.findAll({ where: { userId } });
        const debts = await DebtItem.findAll({ where: { userId } });

        const analytics = {
            summary: {
                totalAssets: 0,
                totalLiabilities: 0,
                netWorth: 0
            },
            assetAllocation: {},
            liabilityBreakdown: {},
            trends: {
                monthlyChange: 0,
                yearlyChange: 0
            }
        };

        // Calculate current values
        analytics.summary.totalAssets = this.calculateAssetsAtDate(assets, new Date()) +
                                      this.calculateInvestmentsAtDate(investments, new Date());
        analytics.summary.totalLiabilities = this.calculateLiabilitiesAtDate(liabilities) +
                                           this.calculateDebtsAtDate(debts, new Date());
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
    }
}

module.exports = new NetWorthService();