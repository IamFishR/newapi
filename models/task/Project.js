const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Project extends Model {
        static associate(models) {
            Project.belongsTo(models.User, { 
                foreignKey: 'created_by',
                as: 'creator'
            });
            Project.belongsToMany(models.User, {
                through: 'project_members',
                foreignKey: 'project_id',
                as: 'members'
            });
            Project.hasMany(models.Sprint, {
                foreignKey: 'project_id',
                as: 'sprints'
            });
            Project.hasMany(models.Task, {
                foreignKey: 'project_id',
                as: 'tasks'
            });
            Project.hasMany(models.TaskLabel, {
                foreignKey: 'project_id',
                as: 'labels'
            });
        }
    }

    Project.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        code: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT
        },
        start_date: {
            type: DataTypes.DATEONLY
        },
        end_date: {
            type: DataTypes.DATEONLY
        },
        status: {
            type: DataTypes.ENUM('active', 'completed', 'on_hold', 'cancelled'),
            defaultValue: 'active'
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
        modelName: 'Project',
        tableName: 'projects',
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
            {
                fields: ['status']
            },
            {
                fields: ['code'],
                unique: true
            }
        ]
    });

    return Project;
};