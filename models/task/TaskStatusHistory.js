const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TaskStatusHistory extends Model {
        static associate(models) {
            TaskStatusHistory.belongsTo(models.Task, {
                foreignKey: 'task_id',
                as: 'task'
            });
            TaskStatusHistory.belongsTo(models.User, {
                foreignKey: 'changed_by',
                as: 'changer'
            });
        }
    }

    TaskStatusHistory.init({
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
        old_status: {
            type: DataTypes.STRING(20)
        },
        new_status: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        changed_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'TaskStatusHistory',
        tableName: 'task_status_history',
        timestamps: true,
        createdAt: 'changed_at',
        updatedAt: false,
        indexes: [
            {
                fields: ['task_id']
            }
        ]
    });

    return TaskStatusHistory;
};