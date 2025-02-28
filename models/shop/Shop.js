const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Shop extends Model {
        static associate(models) {
            Shop.hasMany(models.Product, {
                foreignKey: 'shop_id',
                as: 'products'
            });
            Shop.hasMany(models.Order, {
                foreignKey: 'shop_id',
                as: 'orders'
            });
        }
    }

    Shop.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        business_hours: {
            type: DataTypes.JSON,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
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
        modelName: 'Shop',
        tableName: 'shop',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Shop;
};