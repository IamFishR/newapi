const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class BidAsk extends Model {
        static associate(models) {
            BidAsk.belongsTo(models.MarketDepth, { 
                foreignKey: ['symbol', 'date', 'timestamp']
            });
        }
    }

    BidAsk.init({
        symbol: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            references: {
                model: 'market_depth',
                key: 'symbol'
            }
        },
        date: {
            type: DataTypes.DATEONLY,
            primaryKey: true,
            references: {
                model: 'market_depth',
                key: 'date'
            }
        },
        timestamp: {
            type: DataTypes.DATE,
            primaryKey: true,
            references: {
                model: 'market_depth',
                key: 'timestamp'
            }
        },
        level: {
            type: DataTypes.TINYINT,
            primaryKey: true
        },
        bid_price: {
            type: DataTypes.DECIMAL(10, 2)
        },
        bid_quantity: {
            type: DataTypes.BIGINT
        },
        ask_price: {
            type: DataTypes.DECIMAL(10, 2)
        },
        ask_quantity: {
            type: DataTypes.BIGINT
        }
    }, {
        sequelize,
        modelName: 'BidAsk',
        tableName: 'bid_ask',
        timestamps: false
    });

    return BidAsk;
};