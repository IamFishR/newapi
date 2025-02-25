const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

class Order extends Model {}

Order.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    shop_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'shop',
            key: 'id'
        }
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'pending'
    },
    notes: {
        type: DataTypes.TEXT
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Order;