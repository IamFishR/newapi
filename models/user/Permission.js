const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Permission extends Model {
        static associate(models) {
            Permission.belongsToMany(models.Role, {
                through: 'role_permissions',
                foreignKey: 'permission_id'
            });
            Permission.belongsToMany(models.User, {
                through: 'user_permissions',
                foreignKey: 'permission_id'
            });
        }
    }

    Permission.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        permission_name: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        }
    }, {
        sequelize,
        modelName: 'Permission',
        tableName: 'permissions',
        timestamps: false
    });

    return Permission;
}