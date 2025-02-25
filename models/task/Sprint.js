const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Sprint extends Model {
        static associate(models) {
            Sprint.belongsTo(models.Project, {
                foreignKey: 'project_id',
                as: 'project'
            });
            Sprint.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'creator'
            });
            Sprint.hasMany(models.Task, {
                foreignKey: 'sprint_id',
                as: 'tasks'
            });
        }
    }

    Sprint.init({
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
            type: DataTypes.STRING(100),
            allowNull: false
        },
        goal: {
            type: DataTypes.TEXT
        },
        start_date: {
            type: DataTypes.DATEONLY
        },
        end_date: {
            type: DataTypes.DATEONLY
        },
        status: {
            type: DataTypes.ENUM('planned', 'active', 'completed', 'cancelled'),
            defaultValue: 'planned'
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
        modelName: 'Sprint',
        tableName: 'sprints',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['status']
            },
            {
                fields: ['start_date', 'end_date']
            }
        ]
    });

    return Sprint;
};