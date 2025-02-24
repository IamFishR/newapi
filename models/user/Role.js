const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        static associate(models) {
            Role.belongsToMany(models.User, { 
                through: 'user_roles',
                foreignKey: 'role_id'
            });
            Role.belongsToMany(models.Permission, {
                through: 'role_permissions',
                foreignKey: 'role_id'
            });
        }
    }

    Role.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        role_name: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        }
    }, {
        sequelize,
        modelName: 'Role',
        tableName: 'roles',
        timestamps: false
    });

    return Role;
}