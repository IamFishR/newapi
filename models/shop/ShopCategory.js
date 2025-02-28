const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ShopCategory extends Model {
        static associate(models) {
            ShopCategory.hasMany(models.Product, {
                foreignKey: 'category_id',
                as: 'products'
            });
            ShopCategory.hasMany(models.ShopCategory, {
                foreignKey: 'parent_category_id',
                as: 'subcategories'
            });
            ShopCategory.belongsTo(models.ShopCategory, {
                foreignKey: 'parent_category_id',
                as: 'parent'
            });
        }
    }

    ShopCategory.init({
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
        parent_category_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'shop_categories',
                key: 'id'
            }
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
        modelName: 'ShopCategory',
        tableName: 'shop_categories',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return ShopCategory;
};