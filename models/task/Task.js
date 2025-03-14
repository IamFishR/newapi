const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Task extends Model {
        static associate(models) {
            Task.belongsTo(models.Project, {
                foreignKey: 'project_id',
                as: 'project'
            });
            Task.belongsTo(models.Sprint, {
                foreignKey: 'sprint_id',
                as: 'sprint'
            });
            Task.belongsTo(models.Task, {
                foreignKey: 'parent_task_id',
                as: 'parentTask'
            });
            Task.hasMany(models.Task, {
                foreignKey: 'parent_task_id',
                as: 'subtasks'
            });
            Task.belongsTo(models.TaskType, {
                foreignKey: 'type_id',
                as: 'type'
            });
            Task.belongsTo(models.TaskPriority, {
                foreignKey: 'priority_id',
                as: 'priority'
            });
            Task.belongsTo(models.User, {
                foreignKey: 'assigned_to',
                as: 'assignee'
            });
            Task.belongsTo(models.User, {
                foreignKey: 'reporter',
                as: 'reportedBy'
            });
            Task.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'creator'
            });
            Task.hasMany(models.TaskComment, {
                foreignKey: 'task_id',
                as: 'comments'
            });
            Task.hasMany(models.TaskAttachment, {
                foreignKey: 'task_id',
                as: 'attachments'
            });
            Task.hasMany(models.TaskTimeLog, {
                foreignKey: 'task_id',
                as: 'timeLogs'
            });
            Task.hasMany(models.TaskStatusHistory, {
                foreignKey: 'task_id',
                as: 'statusHistory'
            });
            Task.hasMany(models.TaskAssignmentHistory, {
                foreignKey: 'task_id',
                as: 'assignmentHistory'
            });
            Task.belongsToMany(models.Task, {
                through: 'task_relationships',
                foreignKey: 'source_task_id',
                otherKey: 'target_task_id',
                as: 'relatedTasks'
            });
            Task.belongsToMany(models.TaskLabel, {
                through: 'task_label_assignments',
                foreignKey: 'task_id',
                as: 'labels'
            });
            Task.belongsToMany(models.User, {
                through: {
                    model: 'task_watchers',
                    timestamps: true,
                    createdAt: 'added_at',
                    updatedAt: false
                },
                foreignKey: 'task_id',
                otherKey: 'user_id',
                as: 'watchers'
            });
            Task.hasOne(models.TaskMetrics, {
                foreignKey: 'task_id',
                as: 'metrics'
            });
        }
    }

    Task.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        project_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'projects',
                key: 'id'
            }
        },
        sprint_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'sprints',
                key: 'id'
            }
        },
        parent_task_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'tasks',
                key: 'id'
            }
        },
        type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'task_types',
                key: 'id'
            }
        },
        priority_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'task_priorities',
                key: 'id'
            }
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        status: {
            type: DataTypes.ENUM('todo', 'in_progress', 'in_review', 'done', 'cancelled'),
            defaultValue: 'todo'
        },
        estimated_hours: {
            type: DataTypes.DECIMAL(5,2)
        },
        actual_hours: {
            type: DataTypes.DECIMAL(5,2)
        },
        assigned_to: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        reporter: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        due_date: {
            type: DataTypes.DATEONLY
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
        modelName: 'Task',
        tableName: 'tasks',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['status']
            },
            {
                fields: ['sprint_id']
            },
            {
                fields: ['assigned_to']
            },
            {
                fields: ['parent_task_id']
            }
        ]
    });

    return Task;
};