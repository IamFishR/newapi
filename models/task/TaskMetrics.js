const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TaskMetrics extends Model {
        static associate(models) {
            TaskMetrics.belongsTo(models.Task, {
                foreignKey: 'task_id',
                as: 'task'
            });
        }
    }

    TaskMetrics.init({
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
        time_in_todo: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        time_in_progress: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        time_in_review: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        cycle_time: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        lead_time: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        number_of_comments: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        number_of_attachments: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        number_of_revisions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'TaskMetrics',
        tableName: 'task_metrics',
        timestamps: true,
        createdAt: false,
        updatedAt: 'last_updated',
        indexes: [
            {
                fields: ['task_id'],
                unique: true
            }
        ]
    });

    return TaskMetrics;
};