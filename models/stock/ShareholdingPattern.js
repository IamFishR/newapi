const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ShareholdingPattern extends Model {
        static associate(models) {
            ShareholdingPattern.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    ShareholdingPattern.init({
        symbol: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            references: {
                model: 'companies',
                key: 'symbol'
            }
        },
        period_end_date: {
            type: DataTypes.DATEONLY,
            primaryKey: true
        },
        promoter_group_percentage: {
            type: DataTypes.DECIMAL(10, 2)
        },
        public_percentage: {
            type: DataTypes.DECIMAL(10, 2)
        },
        employee_trusts_percentage: {
            type: DataTypes.DECIMAL(10, 2)
        }
    }, {
        sequelize,
        modelName: 'ShareholdingPattern',
        tableName: 'shareholding_patterns',
        timestamps: false
    });

    return ShareholdingPattern;
};