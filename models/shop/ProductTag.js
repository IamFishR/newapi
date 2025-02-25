const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

class ProductTag extends Model {}

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

module.exports = ProductTag;