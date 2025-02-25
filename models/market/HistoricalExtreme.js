const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class HistoricalExtreme extends Model {
        static associate(models) {
            HistoricalExtreme.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    HistoricalExtreme.init({
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
        week_low: {
            type: DataTypes.DECIMAL(10, 2)
        },
        week_low_date: {
            type: DataTypes.DATEONLY
        },
        week_high: {
            type: DataTypes.DECIMAL(10, 2)
        },
        week_high_date: {
            type: DataTypes.DATEONLY
        }
    }, {
        sequelize,
        modelName: 'HistoricalExtreme',
        tableName: 'historical_extremes',
        timestamps: false
    });

    return HistoricalExtreme;
};