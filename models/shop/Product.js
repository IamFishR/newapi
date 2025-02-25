const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

class Product extends Model {}

Product.init({
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
    sku: {
        type: DataTypes.STRING(50),
        unique: true
    },
    barcode: {
        type: DataTypes.STRING(50)
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    cost_price: {
        type: DataTypes.DECIMAL(10, 2)
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    minimum_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    category_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'shop_categories',
            key: 'id'
        }
    },
    shop_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'shop',
            key: 'id'
        }
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
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Product;