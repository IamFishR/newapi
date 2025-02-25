const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TaskLabel extends Model {
        static associate(models) {
            TaskLabel.belongsTo(models.Project, {
                foreignKey: 'project_id',
                as: 'project'
            });
            TaskLabel.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'creator'
            });
            TaskLabel.belongsToMany(models.Task, {
                through: 'task_label_assignments',
                foreignKey: 'label_id',
                as: 'tasks'
            });
        }
    }

    TaskLabel.init({
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
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
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
        modelName: 'TaskLabel',
        tableName: 'task_labels',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                fields: ['project_id', 'name'],
                unique: true
            }
        ]
    });

    return TaskLabel;
};