const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserRole extends Model {
        static associate(models) {
            // No need to define associations here as they're defined in User and Role models
        }
    }

    UserRole.init({
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'roles',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'UserRole',
        tableName: 'user_roles',
        timestamps: false
    });

    return UserRole;
};