const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductTag extends Model {
        static associate(models) {
            ProductTag.belongsToMany(models.Product, {
                through: 'product_tag_relations',
                foreignKey: 'tag_id'
            });
            ProductTag.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'creator'
            });
        }
    }

    ProductTag.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
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
        modelName: 'ProductTag',
        tableName: 'product_tags',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return ProductTag;
};