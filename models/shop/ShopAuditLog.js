const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ShopAuditLog extends Model {
        static associate(models) {
            ShopAuditLog.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'creator'
            });
        }
    }

    ShopAuditLog.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        entity_type: {
            type: DataTypes.ENUM('shop', 'product', 'category', 'inventory'),
            allowNull: false
        },
        entity_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        action: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        old_values: {
            type: DataTypes.JSON,
            allowNull: true
        },
        new_values: {
            type: DataTypes.JSON,
            allowNull: true
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
        modelName: 'ShopAuditLog',
        tableName: 'shop_audit_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                fields: ['entity_type', 'entity_id']
            },
            {
                fields: ['action']
            },
            {
                fields: ['created_by']
            }
        ]
    });

    return ShopAuditLog;
};