const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserPreference extends Model {
        static associate(models) {
            UserPreference.belongsTo(models.User, { foreignKey: 'user_id' });
        }
    }

    UserPreference.init({
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        theme: {
            type: DataTypes.STRING(20),
            defaultValue: 'light'
        },
        language: {
            type: DataTypes.STRING(20),
            defaultValue: 'en'
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        avatar_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        social_media: {
            type: DataTypes.JSON,
            allowNull: true
        },
        notification_preferences: {
            type: DataTypes.JSON,
            defaultValue: {
                email: true,
                push: true,
                price_alerts: true
            }
        }
    }, {
        sequelize,
        modelName: 'UserPreference',
        tableName: 'preferences',
        timestamps: true
    });

    return UserPreference;
}