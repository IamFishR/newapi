const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Portfolio, { foreignKey: 'user_id' });
            User.hasMany(models.Transaction, { foreignKey: 'user_id' });
            User.belongsToMany(models.Company, { 
                through: models.Portfolio,
                foreignKey: 'user_id'
            });
            User.hasOne(models.UserPreference, { foreignKey: 'user_id' });
            User.hasMany(models.UserSession, { foreignKey: 'user_id' });
            User.hasMany(models.WatchList, { foreignKey: 'user_id' });

            User.belongsToMany(models.Role, {
                through: 'user_roles',
                foreignKey: 'user_id'
            });
            User.belongsToMany(models.Permission, {
                through: 'user_permissions',
                foreignKey: 'user_id'
            });
        }

        async validatePassword(password) {
            return bcrypt.compare(password, this.password);
        }
    }

    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            }
        }
    });

    return User;
}