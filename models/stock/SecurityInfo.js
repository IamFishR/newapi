const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class SecurityInfo extends Model {
        static associate(models) {
            SecurityInfo.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    SecurityInfo.init({
        symbol: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            references: {
                model: 'companies',
                key: 'symbol'
            }
        },
        date: {
            type: DataTypes.DATEONLY,
            primaryKey: true
        },
        board_status: {
            type: DataTypes.STRING(20)
        },
        trading_status: {
            type: DataTypes.STRING(20)
        },
        trading_segment: {
            type: DataTypes.STRING(50)
        },
        slb: {
            type: DataTypes.STRING(5)
        },
        class_of_share: {
            type: DataTypes.STRING(20)
        },
        derivatives: {
            type: DataTypes.STRING(5)
        }
    }, {
        sequelize,
        modelName: 'SecurityInfo',
        tableName: 'security_info',
        timestamps: false
    });

    return SecurityInfo;
};