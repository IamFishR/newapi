const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Company extends Model {
        static associate(models) {
            // Market data associations
            Company.hasMany(models.PriceData, { foreignKey: 'symbol' });
            Company.hasMany(models.CompanyIndex, { foreignKey: 'symbol' });
            Company.hasMany(models.CorporateAction, { foreignKey: 'symbol' });
            Company.hasMany(models.BoardMeeting, { foreignKey: 'symbol' });
            Company.hasMany(models.SecurityInfo, { foreignKey: 'symbol' });
            Company.hasMany(models.RiskMetric, { foreignKey: 'symbol' });
            Company.hasMany(models.DeliveryPosition, { foreignKey: 'symbol' });
            Company.hasMany(models.PriceLimit, { foreignKey: 'symbol' });
            Company.hasMany(models.HistoricalPrice, { foreignKey: 'symbol' });
            Company.hasMany(models.HistoricalExtreme, { foreignKey: 'symbol' });
            Company.hasMany(models.MarketDepth, { foreignKey: 'symbol' });

            // Financial associations
            Company.hasMany(models.FinancialResult, { foreignKey: 'symbol' });
            Company.hasMany(models.ShareholdingPattern, { foreignKey: 'symbol' });
            Company.hasMany(models.Announcement, { foreignKey: 'symbol' });

            // User-related associations
            Company.belongsToMany(models.User, { 
                through: models.Portfolio,
                foreignKey: 'symbol'
            });

            // Sector hierarchy associations
            Company.belongsTo(models.BasicIndustry, {
                foreignKey: 'basic_industry',
                targetKey: 'Basic_Ind_Code'
            });
        }
    }

    Company.init({
        symbol: {
            type: DataTypes.STRING(20),
            primaryKey: true
        },
        company_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        isin: {
            type: DataTypes.STRING(12),
            allowNull: false
        },
        listing_date: DataTypes.DATE,
        face_value: DataTypes.DECIMAL(10, 2),
        issued_size: DataTypes.BIGINT,
        industry: DataTypes.STRING(100),
        sector: DataTypes.STRING(100),
        macro_sector: DataTypes.STRING(100),
        basic_industry: {
            type: DataTypes.STRING(12),
            allowNull: true,
            references: {
                model: 'BasicIndustry',
                key: 'Basic_Ind_Code'
            }
        }
    }, {
        sequelize,
        modelName: 'Company',
        tableName: 'companies',
        timestamps: false
    });

    return Company;
};