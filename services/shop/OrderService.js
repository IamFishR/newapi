const Order = require('../../models/shop/Order');
const OrderItem = require('../../models/shop/OrderItem');
const OrderStatusHistory = require('../../models/shop/OrderStatusHistory');
const Product = require('../../models/shop/Product');
const Shop = require('../../models/shop/Shop');
const ShopAuditLog = require('../../models/shop/ShopAuditLog');
const { ValidationError } = require('sequelize');
const sequelize = require('../../config/sequelize');

class OrderService {
    async createOrder(orderData, userId) {
        const transaction = await sequelize.transaction();
        try {
            // Create the order
            const order = await Order.create({
                shop_id: orderData.shop_id,
                notes: orderData.notes,
                created_by: userId
            }, { transaction });

            // Calculate total amount and create order items
            let totalAmount = 0;
            const orderItems = [];
            
            for (const item of orderData.items) {
                const product = await Product.findByPk(item.product_id);
                if (!product) {
                    throw new Error(`Product ${item.product_id} not found`);
                }

                if (product.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}`);
                }

                const totalPrice = product.price * item.quantity;
                totalAmount += totalPrice;

                orderItems.push({
                    order_id: order.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: product.price,
                    total_price: totalPrice
                });

                // Update product quantity
                await product.update({
                    quantity: product.quantity - item.quantity
                }, { transaction });
            }

            // Create order items
            await OrderItem.bulkCreate(orderItems, { transaction });

            // Update order total
            await order.update({ total_amount: totalAmount }, { transaction });

            // Create audit log
            await this.createAuditLog('CREATE', order.id, null, {
                ...order.toJSON(),
                items: orderItems
            }, userId, transaction);

            await transaction.commit();
            return this.getOrder(order.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getOrder(id) {
        const order = await Order.findByPk(id, {
            include: [{
                model: OrderItem,
                as: 'items',
                include: [Product]
            }, {
                model: Shop
            }, {
                model: OrderStatusHistory,
                attributes: ['status', 'notes', 'created_at', 'created_by'],
                order: [['created_at', 'DESC']]
            }]
        });

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    async updateOrderStatus(id, status, userId, notes = '') {
        const transaction = await sequelize.transaction();
        try {
            const order = await Order.findByPk(id);
            if (!order) {
                throw new Error('Order not found');
            }

            const oldStatus = order.status;
            await order.update({ status }, { transaction });

            // Create status history entry
            await OrderStatusHistory.create({
                order_id: id,
                status,
                notes,
                created_by: userId
            }, { transaction });

            // Create audit log
            await this.createAuditLog('UPDATE_STATUS', id, 
                { status: oldStatus }, 
                { status, notes }, 
                userId, 
                transaction
            );

            await transaction.commit();
            return this.getOrder(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async listOrders(query = {}) {
        const { page = 1, limit = 10, shop_id, status, ...filters } = query;
        const offset = (page - 1) * limit;
        
        const whereClause = {};
        if (shop_id) whereClause.shop_id = shop_id;
        if (status) whereClause.status = status;

        return await Order.findAndCountAll({
            where: { ...whereClause, ...filters },
            limit,
            offset,
            include: [{
                model: OrderItem,
                include: [Product]
            }, {
                model: Shop
            }],
            order: [['created_at', 'DESC']]
        });
    }

    async createAuditLog(action, entityId, oldValues, newValues, userId, transaction) {
        await ShopAuditLog.create({
            entity_type: 'order',
            entity_id: entityId,
            action,
            old_values: oldValues,
            new_values: newValues,
            created_by: userId
        }, { transaction });
    }
}

module.exports = new OrderService();