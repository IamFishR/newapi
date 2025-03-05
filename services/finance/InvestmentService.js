const { Investment, InvestmentTransaction, User } = require('../../models');
const ValidationError = require('../../utils/ValidationError');
const { Op } = require('sequelize');
const marketDataService = require('../market/MarketDataService');

class InvestmentService {
    async getInvestmentPortfolio(userId) {
        const investments = await Investment.findAll({
            where: { userId },
            include: [{
                model: InvestmentTransaction,
                as: 'transactions',
                attributes: ['id', 'type', 'shares', 'pricePerShare', 'date']
            }],
            order: [['symbol', 'ASC']]
        });

        // Update current prices
        for (const investment of investments) {
            try {
                const latestPrice = await marketDataService.getLatestPrice(investment.symbol);
                if (latestPrice) {
                    await investment.update({
                        currentPrice: latestPrice,
                        lastPriceUpdate: new Date()
                    });
                }
            } catch (error) {
                console.error(`Failed to update price for ${investment.symbol}:`, error);
            }
        }

        return investments;
    }

    async addInvestment(userId, data) {
        // Validate symbol exists
        const symbolExists = await marketDataService.validateSymbol(data.symbol);
        if (!symbolExists) {
            throw new ValidationError('Invalid symbol');
        }

        const existing = await Investment.findOne({
            where: { userId, symbol: data.symbol }
        });

        if (existing) {
            throw new ValidationError('Investment already exists in portfolio');
        }

        const investment = await Investment.create({
            userId,
            ...data,
            averageCost: data.purchasePrice
        });

        // Record initial transaction
        await InvestmentTransaction.create({
            investmentId: investment.id,
            userId,
            type: 'buy',
            shares: data.shares,
            pricePerShare: data.purchasePrice,
            date: data.purchaseDate
        });

        return this.getInvestmentById(investment.id, userId);
    }

    async updateInvestment(id, userId, data) {
        const investment = await this.getInvestmentById(id, userId);
        if (!investment) {
            throw new ValidationError('Investment not found');
        }

        await investment.update(data);
        return this.getInvestmentById(id, userId);
    }

    async deleteInvestment(id, userId) {
        const investment = await this.getInvestmentById(id, userId);
        if (!investment) {
            throw new ValidationError('Investment not found');
        }

        await investment.destroy();
    }

    async getInvestmentById(id, userId) {
        return await Investment.findOne({
            where: { id, userId },
            include: [{
                model: InvestmentTransaction,
                as: 'transactions',
                attributes: ['id', 'type', 'shares', 'pricePerShare', 'date']
            }]
        });
    }

    async addTransaction(userId, investmentId, data) {
        const investment = await this.getInvestmentById(investmentId, userId);
        if (!investment) {
            throw new ValidationError('Investment not found');
        }

        const transaction = await InvestmentTransaction.create({
            investmentId,
            userId,
            ...data
        });

        // Update investment shares and average cost
        const totalShares = data.type === 'buy' 
            ? Number(investment.shares) + Number(data.shares)
            : Number(investment.shares) - Number(data.shares);

        if (totalShares < 0) {
            throw new ValidationError('Cannot sell more shares than owned');
        }

        if (data.type === 'buy') {
            const totalCost = (Number(investment.shares) * Number(investment.averageCost)) +
                            (Number(data.shares) * Number(data.pricePerShare));
            const newAverageCost = totalShares > 0 ? totalCost / totalShares : 0;

            await investment.update({
                shares: totalShares,
                averageCost: newAverageCost
            });
        } else {
            await investment.update({
                shares: totalShares
            });
        }

        return transaction;
    }

    async getInvestmentAnalytics(userId) {
        const investments = await this.getInvestmentPortfolio(userId);
        
        const analytics = {
            totalValue: 0,
            totalCost: 0,
            totalGain: 0,
            totalGainPercentage: 0,
            allocationByType: {},
            performanceBySymbol: [],
            dividendIncome: 0
        };

        if (!investments.length) return analytics;

        for (const investment of investments) {
            const currentValue = Number(investment.shares) * Number(investment.currentPrice || investment.averageCost);
            const totalCost = Number(investment.shares) * Number(investment.averageCost);
            const gain = currentValue - totalCost;
            const gainPercentage = (gain / totalCost) * 100;

            analytics.totalValue += currentValue;
            analytics.totalCost += totalCost;
            analytics.totalGain += gain;

            // Calculate allocation by type
            if (!analytics.allocationByType[investment.type]) {
                analytics.allocationByType[investment.type] = 0;
            }
            analytics.allocationByType[investment.type] += currentValue;

            // Record individual performance
            analytics.performanceBySymbol.push({
                symbol: investment.symbol,
                shares: investment.shares,
                currentPrice: investment.currentPrice || investment.averageCost,
                averageCost: investment.averageCost,
                value: currentValue,
                gain,
                gainPercentage
            });
        }

        // Calculate total gain percentage
        analytics.totalGainPercentage = (analytics.totalGain / analytics.totalCost) * 100;

        // Convert allocation to percentages
        Object.keys(analytics.allocationByType).forEach(type => {
            analytics.allocationByType[type] = (analytics.allocationByType[type] / analytics.totalValue) * 100;
        });

        // Sort performance by gain
        analytics.performanceBySymbol.sort((a, b) => b.gain - a.gain);

        return analytics;
    }
}

module.exports = new InvestmentService();