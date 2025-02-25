const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TaskAttachment extends Model {
        static associate(models) {
            TaskAttachment.belongsTo(models.Task, {
                foreignKey: 'task_id',
                as: 'task'
            });
            TaskAttachment.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'creator'
            });
        }
    }

    TaskAttachment.init({
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
        file_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        file_path: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        file_size: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        mime_type: {
            type: DataTypes.STRING(100)
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
        modelName: 'TaskAttachment',
        tableName: 'task_attachments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                fields: ['task_id']
            }
        ]
    });

    return TaskAttachment;
};