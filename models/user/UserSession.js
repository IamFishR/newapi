const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserSession extends Model {
        static associate(models) {
            UserSession.belongsTo(models.User, { foreignKey: 'user_id' });
        }
    }

    UserSession.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        session_token: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        expiry: {
            type: DataTypes.DATE,
            allowNull: false
        },
        device_info: {
            type: DataTypes.JSON,
            allowNull: true
        },
        last_activity: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'UserSession',
        tableName: 'sessions',
        timestamps: true,
        indexes: [{
            fields: ['session_token']
        }]
    });

    return UserSession;
}