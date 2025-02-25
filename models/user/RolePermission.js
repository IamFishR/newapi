const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class RolePermission extends Model {
        static associate(models) {
            // No need to define associations here as they're defined in Role and Permission models
        }
    }

    RolePermission.init({
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'roles',
                key: 'id'
            }
        },
        permission_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'permissions',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'RolePermission',
        tableName: 'role_permissions',
        timestamps: false
    });

    return RolePermission;
};