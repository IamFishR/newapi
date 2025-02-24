const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MarketDepth extends Model {
        static associate(models) {
            MarketDepth.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    MarketDepth.init({
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
        timestamp: {
            type: DataTypes.DATE,
            primaryKey: true
        },
        total_buy_quantity: DataTypes.BIGINT,
        total_sell_quantity: DataTypes.BIGINT
    }, {
        sequelize,
        modelName: 'MarketDepth',
        tableName: 'market_depth',
        timestamps: false,
        indexes: [{
            fields: ['date', 'timestamp']
        }]
    });

    return MarketDepth;
}