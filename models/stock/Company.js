const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Company extends Model {
        static associate(models) {
            Company.hasMany(models.PriceData, { foreignKey: 'symbol' });
            Company.hasMany(models.FinancialResult, { foreignKey: 'symbol' });
            Company.belongsToMany(models.User, { 
                through: models.Portfolio,
                foreignKey: 'symbol'
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
        basic_industry: DataTypes.STRING(100)
    }, {
        sequelize,
        modelName: 'Company',
        tableName: 'companies',
        timestamps: false
    });

    return Company;
}