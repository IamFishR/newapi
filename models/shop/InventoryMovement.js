const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class InventoryMovement extends Model {
        static associate(models) {
            InventoryMovement.belongsTo(models.Product, {
                foreignKey: 'product_id'
            });
            InventoryMovement.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'creator'
            });
        }
    }

    InventoryMovement.init({
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
        movement_type: {
            type: DataTypes.ENUM('IN', 'OUT', 'ADJUSTMENT'),
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reference_type: {
            type: DataTypes.STRING(50)
        },
        reference_id: {
            type: DataTypes.INTEGER
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
        modelName: 'InventoryMovement',
        tableName: 'inventory_movements',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                fields: ['product_id']
            },
            {
                fields: ['reference_type', 'reference_id']
            }
        ]
    });

    return InventoryMovement;
};