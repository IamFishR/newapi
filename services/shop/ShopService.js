const Shop = require('../../models/shop/Shop');
const Product = require('../../models/shop/Product');
const ShopCategory = require('../../models/shop/ShopCategory');
const { ValidationError } = require('sequelize');

class ShopService {
    async createShop(shopData, userId) {
        try {
            shopData.created_by = userId;
            return await Shop.create(shopData);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new Error('Invalid shop data: ' + error.message);
            }
            throw error;
        }
    }

    async getShop(id) {
        const shop = await Shop.findByPk(id, {
            include: [{
                model: Product,
                include: [ShopCategory]
            }]
        });
        if (!shop) {
            throw new Error('Shop not found');
        }
        return shop;
    }

    async updateShop(id, shopData, userId) {
        const shop = await Shop.findByPk(id);
        if (!shop) {
            throw new Error('Shop not found');
        }
        if (shop.created_by !== userId) {
            throw new Error('Unauthorized to update this shop');
        }
        return await shop.update(shopData);
    }

    async deleteShop(id, userId) {
        const shop = await Shop.findByPk(id);
        if (!shop) {
            throw new Error('Shop not found');
        }
        if (shop.created_by !== userId) {
            throw new Error('Unauthorized to delete this shop');
        }
        await shop.destroy();
        return { message: 'Shop deleted successfully' };
    }

    async listShops(query = {}) {
        const { page = 1, limit = 10, search, ...filters } = query;
        const offset = (page - 1) * limit;
        
        const whereClause = {};
        if (search) {
            whereClause.name = { [Op.like]: `%${search}%` };
        }
        
        return await Shop.findAndCountAll({
            where: { ...whereClause, ...filters },
            limit,
            offset,
            include: [{
                model: Product,
                include: [ShopCategory]
            }],
            order: [['created_at', 'DESC']]
        });
    }
}

module.exports = new ShopService();