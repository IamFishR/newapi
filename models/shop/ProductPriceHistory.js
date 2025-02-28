const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductPriceHistory extends Model {
        static associate(models) {
            ProductPriceHistory.belongsTo(models.Product, {
                foreignKey: 'product_id'
            });
            ProductPriceHistory.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'creator'
            });
        }
    }

    ProductPriceHistory.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id'
            }
        },
        old_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        new_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
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
        modelName: 'ProductPriceHistory',
        tableName: 'product_price_history',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                fields: ['product_id']
            },
            {
                fields: ['created_by']
            }
        ]
    });

    return ProductPriceHistory;
};