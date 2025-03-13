const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TaskPriority extends Model {
        static associate(models) {
            TaskPriority.hasMany(models.Task, {
                foreignKey: 'priority_id',
                as: 'tasks'
            });
        }
    }

    TaskPriority.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        icon: {
            type: DataTypes.STRING(50)
        },
        color: {
            type: DataTypes.STRING(7)
        }
    }, {
        sequelize,
        modelName: 'TaskPriority',
        tableName: 'task_priorities',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    });

    return TaskPriority;
};