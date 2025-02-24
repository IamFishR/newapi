const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AuditLog extends Model {
        static associate(models) {
            AuditLog.belongsTo(models.User, { foreignKey: 'user_id' });
        }
    }

    AuditLog.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        action: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        entity_type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        entity_id: {
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
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        user_agent: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'AuditLog',
        tableName: 'audit_logs',
        timestamps: false,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['action']
            },
            {
                fields: ['entity_type', 'entity_id']
            },
            {
                fields: ['created_at']
            }
        ]
    });

    return AuditLog;
}