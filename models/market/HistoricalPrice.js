const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class HistoricalPrice extends Model {
        static associate(models) {
            HistoricalPrice.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    HistoricalPrice.init({
        symbol: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            references: {
                model: 'companies',
                key: 'symbol'
            }
        },
        timestamp: {
            type: DataTypes.BIGINT,
            primaryKey: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2)
        },
        market_type: {
            type: DataTypes.STRING(10)
        }
    }, {
        sequelize,
        modelName: 'HistoricalPrice',
        tableName: 'historical_prices',
        timestamps: false
    });

    return HistoricalPrice;
};