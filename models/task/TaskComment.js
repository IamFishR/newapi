const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TaskComment extends Model {
        static associate(models) {
            TaskComment.belongsTo(models.Task, {
                foreignKey: 'task_id',
                as: 'task'
            });
            TaskComment.belongsTo(models.TaskComment, {
                foreignKey: 'parent_comment_id',
                as: 'parentComment'
            });
            TaskComment.hasMany(models.TaskComment, {
                foreignKey: 'parent_comment_id',
                as: 'replies'
            });
            TaskComment.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'creator'
            });
        }
    }

    TaskComment.init({
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
        parent_comment_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'task_comments',
                key: 'id'
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
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
        modelName: 'TaskComment',
        tableName: 'task_comments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return TaskComment;
};