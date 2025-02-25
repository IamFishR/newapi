const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TaskAssignmentHistory extends Model {
        static associate(models) {
            TaskAssignmentHistory.belongsTo(models.Task, {
                foreignKey: 'task_id',
                as: 'task'
            });
            TaskAssignmentHistory.belongsTo(models.User, {
                foreignKey: 'old_assignee',
                as: 'previousAssignee'
            });
            TaskAssignmentHistory.belongsTo(models.User, {
                foreignKey: 'new_assignee',
                as: 'newAssignee'
            });
            TaskAssignmentHistory.belongsTo(models.User, {
                foreignKey: 'changed_by',
                as: 'changer'
            });
        }
    }

    TaskAssignmentHistory.init({
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
        old_assignee: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        new_assignee: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
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
        modelName: 'TaskAssignmentHistory',
        tableName: 'task_assignment_history',
        timestamps: true,
        createdAt: 'changed_at',
        updatedAt: false,
        indexes: [
            {
                fields: ['task_id']
            }
        ]
    });

    return TaskAssignmentHistory;
};