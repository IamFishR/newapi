const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserPermission extends Model {
        static associate(models) {
            // No need to define associations here as they're defined in User and Permission models
        }
    }

    UserPermission.init({
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'users',
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
        modelName: 'UserPermission',
        tableName: 'user_permissions',
        timestamps: false
    });

    return UserPermission;
};