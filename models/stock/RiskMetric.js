const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class RiskMetric extends Model {
        static associate(models) {
            RiskMetric.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    RiskMetric.init({
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
        impact_cost: {
            type: DataTypes.DECIMAL(10, 2)
        },
        daily_volatility: {
            type: DataTypes.DECIMAL(10, 2)
        },
        annual_volatility: {
            type: DataTypes.DECIMAL(10, 2)
        },
        security_var: {
            type: DataTypes.DECIMAL(10, 2)
        },
        index_var: {
            type: DataTypes.DECIMAL(10, 2)
        },
        var_margin: {
            type: DataTypes.DECIMAL(10, 2)
        },
        extreme_loss_margin: {
            type: DataTypes.DECIMAL(10, 2)
        },
        adhoc_margin: {
            type: DataTypes.DECIMAL(10, 2)
        },
        applicable_margin: {
            type: DataTypes.DECIMAL(10, 2)
        }
    }, {
        sequelize,
        modelName: 'RiskMetric',
        tableName: 'risk_metrics',
        timestamps: false
    });

    return RiskMetric;
};