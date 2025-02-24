const { WatchList, Company, PriceData } = require('../../models');

class WatchlistService {
    async addToWatchlist(userId, symbol) {
        return await WatchList.create({ user_id: userId, symbol });
    }

    async removeFromWatchlist(userId, symbol) {
        return await WatchList.destroy({
            where: { user_id: userId, symbol }
        });
    }

    async getWatchlist(userId) {
        return await WatchList.findAll({
            where: { user_id: userId },
            include: [{
                model: Company,
                include: [{
                    model: PriceData,
                    limit: 1,
                    order: [['date', 'DESC']],
                    attributes: ['last_price', 'previous_close', 'change_percentage']
                }]
            }]
        });
    }

    async isInWatchlist(userId, symbol) {
        const count = await WatchList.count({
            where: { user_id: userId, symbol }
        });
        return count > 0;
    }

    async getWatchlistCount(userId) {
        return await WatchList.count({
            where: { user_id: userId }
        });
    }
}

module.exports = new WatchlistService();