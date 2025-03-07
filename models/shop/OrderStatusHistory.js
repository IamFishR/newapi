const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class OrderStatusHistory extends Model {}

    OrderStatusHistory.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'orders',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false
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
        modelName: 'OrderStatusHistory',
        tableName: 'order_status_history',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return OrderStatusHistory;
};