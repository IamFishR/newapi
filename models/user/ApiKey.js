const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ApiKey extends Model {
        static associate(models) {
            ApiKey.belongsTo(models.User, { foreignKey: 'user_id' });
        }
    }

    ApiKey.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        api_key: {
            type: DataTypes.STRING(100)
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'ApiKey',
        tableName: 'api_keys',
        timestamps: false
    });

    return ApiKey;
};