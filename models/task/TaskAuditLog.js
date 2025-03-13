const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TaskAuditLog extends Model {
        static associate(models) {
            TaskAuditLog.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'user'
            });
            TaskAuditLog.belongsTo(models.Task, {
                foreignKey: 'task_id',
                as: 'task'
            });
        }
    }

    TaskAuditLog.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        task_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tasks',
                key: 'id'
            }
        },
        action: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        field: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        old_value: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        new_value: {
            type: DataTypes.TEXT,
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
        modelName: 'TaskAuditLog',
        tableName: 'task_audit_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return TaskAuditLog;
};