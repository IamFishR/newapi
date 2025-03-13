const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TaskTimeLog extends Model {
        static associate(models) {
            TaskTimeLog.belongsTo(models.Task, {
                foreignKey: 'task_id',
                as: 'task'
            });
            TaskTimeLog.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }
    }

    TaskTimeLog.init({
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
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        logged_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        hours_spent: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'TaskTimeLog',
        tableName: 'task_time_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return TaskTimeLog;
};