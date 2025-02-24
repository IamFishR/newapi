const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class PriceData extends Model {
        static associate(models) {
            PriceData.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    PriceData.init({
        symbol: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            references: {
                model: 'companies',
                key: 'symbol'
            }
        },
        date: {
            type: DataTypes.DATE,
            primaryKey: true
        },
        last_price: DataTypes.DECIMAL(10, 2),
        previous_close: DataTypes.DECIMAL(10, 2),
        open_price: DataTypes.DECIMAL(10, 2),
        high_price: DataTypes.DECIMAL(10, 2),
        low_price: DataTypes.DECIMAL(10, 2),
        close_price: DataTypes.DECIMAL(10, 2),
        vwap: DataTypes.DECIMAL(10, 2),
        volume: DataTypes.BIGINT,
        traded_value: DataTypes.DECIMAL(15, 2),
        market_cap: DataTypes.DECIMAL(15, 2),
        last_update_time: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'PriceData',
        tableName: 'price_data',
        timestamps: false,
        indexes: [{
            fields: ['date']
        }]
    });

    return PriceData;
}