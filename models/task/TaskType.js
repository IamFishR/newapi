const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TaskType extends Model {
        static associate(models) {
            TaskType.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'creator'
            });
            TaskType.hasMany(models.Task, {
                foreignKey: 'type_id',
                as: 'tasks'
            });
        }
    }

    TaskType.init({
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
        icon: {
            type: DataTypes.STRING(50)
        },
        color: {
            type: DataTypes.STRING(7)
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
        modelName: 'TaskType',
        tableName: 'task_types',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return TaskType;
};