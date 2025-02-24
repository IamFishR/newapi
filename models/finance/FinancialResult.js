const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class FinancialResult extends Model {
        static associate(models) {
            FinancialResult.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    FinancialResult.init({
        symbol: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            references: {
                model: 'companies',
                key: 'symbol'
            }
        },
        from_date: DataTypes.DATE,
        to_date: {
            type: DataTypes.DATE,
            primaryKey: true
        },
        expenditure: DataTypes.DECIMAL(15, 2),
        income: DataTypes.DECIMAL(15, 2),
        profit_before_tax: DataTypes.DECIMAL(15, 2),
        profit_after_tax: DataTypes.DECIMAL(15, 2),
        eps: DataTypes.DECIMAL(10, 2),
        is_audited: DataTypes.BOOLEAN,
        is_cumulative: DataTypes.BOOLEAN,
        is_consolidated: {
            type: DataTypes.BOOLEAN,
            primaryKey: true
        },
        broadcast_timestamp: DataTypes.DATE,
        xbrl_attachment_url: DataTypes.STRING(255),
        notes_attachment_url: DataTypes.STRING(255)
    }, {
        sequelize,
        modelName: 'FinancialResult',
        tableName: 'financial_results',
        timestamps: false,
        indexes: [{
            fields: ['to_date']
        }]
    });

    return FinancialResult;
}