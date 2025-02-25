const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CompanyIndex extends Model {
        static associate(models) {
            CompanyIndex.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    CompanyIndex.init({
        symbol: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            references: {
                model: 'companies',
                key: 'symbol'
            }
        },
        index_name: {
            type: DataTypes.STRING(100),
            primaryKey: true
        }
    }, {
        sequelize,
        modelName: 'CompanyIndex',
        tableName: 'company_indices',
        timestamps: false
    });

    return CompanyIndex;
};