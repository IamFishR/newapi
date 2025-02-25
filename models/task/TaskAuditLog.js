const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TaskAuditLog extends Model {
        static associate(models) {
            TaskAuditLog.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'user'
            });
        }
    }

    TaskAuditLog.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        entity_type: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        entity_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        action: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        old_values: {
            type: DataTypes.JSON
        },
        new_values: {
            type: DataTypes.JSON
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
        modelName: 'TaskAuditLog',
        tableName: 'task_audit_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                fields: ['entity_type', 'entity_id']
            },
            {
                fields: ['created_at']
            }
        ]
    });

    return TaskAuditLog;
};