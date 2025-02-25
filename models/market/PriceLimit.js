const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class PriceLimit extends Model {
        static associate(models) {
            PriceLimit.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    PriceLimit.init({
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
        lower_circuit: {
            type: DataTypes.DECIMAL(10, 2)
        },
        upper_circuit: {
            type: DataTypes.DECIMAL(10, 2)
        },
        price_band: {
            type: DataTypes.STRING(20)
        }
    }, {
        sequelize,
        modelName: 'PriceLimit',
        tableName: 'price_limits',
        timestamps: false
    });

    return PriceLimit;
};