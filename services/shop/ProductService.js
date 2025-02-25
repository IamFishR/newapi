const Product = require('../../models/shop/Product');
const Shop = require('../../models/shop/Shop');
const ShopCategory = require('../../models/shop/ShopCategory');
const ProductPriceHistory = require('../../models/shop/ProductPriceHistory');
const InventoryMovement = require('../../models/shop/InventoryMovement');
const ProductTag = require('../../models/shop/ProductTag');
const ShopAuditLog = require('../../models/shop/ShopAuditLog');
const { ValidationError, Op } = require('sequelize');
const sequelize = require('../../config/sequelize');

class ProductService {
    async createProduct(productData, userId) {
        const transaction = await sequelize.transaction();
        try {
            productData.created_by = userId;
            const product = await Product.create(productData, { transaction });

            // Create audit log for product creation
            await this.createAuditLog('CREATE', product.id, null, product.toJSON(), userId, transaction);

            await transaction.commit();
            return product;
        } catch (error) {
            await transaction.rollback();
            if (error instanceof ValidationError) {
                throw new Error('Invalid product data: ' + error.message);
            }
            throw error;
        }
    }

    async getProduct(id) {
        const product = await Product.findByPk(id, {
            include: [
                { model: ShopCategory },
                { model: Shop }
            ]
        });
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    async updateProduct(id, productData, userId) {
        const transaction = await sequelize.transaction();
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                throw new Error('Product not found');
            }
            if (product.created_by !== userId) {
                throw new Error('Unauthorized to update this product');
            }

            const oldData = product.toJSON();
            await product.update(productData, { transaction });

            // Create audit log for product update
            await this.createAuditLog('UPDATE', id, oldData, product.toJSON(), userId, transaction);

            await transaction.commit();
            return product;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async deleteProduct(id, userId) {
        const transaction = await sequelize.transaction();
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                throw new Error('Product not found');
            }
            if (product.created_by !== userId) {
                throw new Error('Unauthorized to delete this product');
            }

            const oldData = product.toJSON();
            await product.destroy({ transaction });

            // Create audit log for product deletion
            await this.createAuditLog('DELETE', id, oldData, null, userId, transaction);

            await transaction.commit();
            return { message: 'Product deleted successfully' };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async listProducts(query = {}) {
        const { page = 1, limit = 10, search, category_id, shop_id, ...filters } = query;
        const offset = (page - 1) * limit;
        
        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { sku: { [Op.like]: `%${search}%` } },
                { barcode: { [Op.like]: `%${search}%` } }
            ];
        }
        if (category_id) whereClause.category_id = category_id;
        if (shop_id) whereClause.shop_id = shop_id;
        
        return await Product.findAndCountAll({
            where: { ...whereClause, ...filters },
            limit,
            offset,
            include: [
                { model: ShopCategory },
                { model: Shop }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async updatePrice(id, newPrice, userId) {
        const transaction = await sequelize.transaction();
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                throw new Error('Product not found');
            }
            
            // Create price history record
            await ProductPriceHistory.create({
                product_id: id,
                old_price: product.price,
                new_price: newPrice,
                created_by: userId
            }, { transaction });

            // Update product price
            const oldData = product.toJSON();
            await product.update({ price: newPrice }, { transaction });

            // Create audit log
            await this.createAuditLog('PRICE_UPDATE', id, oldData, product.toJSON(), userId, transaction);

            await transaction.commit();
            return product;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getPriceHistory(productId, query = {}) {
        const { page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;

        return await ProductPriceHistory.findAndCountAll({
            where: { product_id: productId },
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
    }

    async updateInventory(id, quantity, type, userId, referenceType = null, referenceId = null, notes = null) {
        const transaction = await sequelize.transaction();
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                throw new Error('Product not found');
            }

            // Calculate new quantity
            let newQuantity = product.quantity;
            if (type === 'IN') {
                newQuantity += quantity;
            } else if (type === 'OUT') {
                if (product.quantity < quantity) {
                    throw new Error('Insufficient inventory');
                }
                newQuantity -= quantity;
            } else if (type === 'ADJUSTMENT') {
                newQuantity = quantity;
            } else {
                throw new Error('Invalid movement type');
            }

            // Create inventory movement record
            await InventoryMovement.create({
                product_id: id,
                movement_type: type,
                quantity,
                reference_type: referenceType,
                reference_id: referenceId,
                notes,
                created_by: userId
            }, { transaction });

            // Update product quantity
            const oldData = product.toJSON();
            await product.update({ quantity: newQuantity }, { transaction });

            // Create audit log
            await this.createAuditLog('INVENTORY_UPDATE', id, oldData, product.toJSON(), userId, transaction);

            await transaction.commit();
            return product;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getInventoryMovements(productId, query = {}) {
        const { page = 1, limit = 10, startDate, endDate } = query;
        const offset = (page - 1) * limit;

        const whereClause = { product_id: productId };
        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [startDate, endDate]
            };
        }

        return await InventoryMovement.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
    }

    async addTag(productId, tagName, userId) {
        const transaction = await sequelize.transaction();
        try {
            // Find or create tag
            const [tag] = await ProductTag.findOrCreate({
                where: { name: tagName },
                defaults: { created_by: userId }
            });

            const product = await Product.findByPk(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            // Add tag to product
            await product.addProductTag(tag, { 
                through: { created_by: userId }
            });

            await transaction.commit();
            return tag;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async removeTag(productId, tagId) {
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        await product.removeProductTag(tagId);
        return { message: 'Tag removed successfully' };
    }

    async getProductTags(productId) {
        const product = await Product.findByPk(productId, {
            include: [{
                model: ProductTag,
                through: { attributes: [] }
            }]
        });

        if (!product) {
            throw new Error('Product not found');
        }

        return product.ProductTags;
    }

    async createAuditLog(action, entityId, oldValues, newValues, userId, transaction) {
        await ShopAuditLog.create({
            entity_type: 'product',
            entity_id: entityId,
            action,
            old_values: oldValues,
            new_values: newValues,
            created_by: userId
        }, { transaction });
    }
}

module.exports = new ProductService();