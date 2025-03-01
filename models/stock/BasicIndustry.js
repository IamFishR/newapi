const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class BasicIndustry extends Model {
        static associate(models) {
            BasicIndustry.belongsTo(models.Industry, {
                foreignKey: 'Ind_Code',
                targetKey: 'Ind_Code'
            });
            BasicIndustry.hasMany(models.Company, {
                foreignKey: 'basic_industry',
                sourceKey: 'Basic_Ind_Code'
            });
        }
    }

    BasicIndustry.init({
        Basic_Ind_Code: {
            type: DataTypes.STRING(12),
            primaryKey: true
        },
        BasicIndustryName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        Ind_Code: {
            type: DataTypes.STRING(10),
            allowNull: false,
            references: {
                model: 'Industry',
                key: 'Ind_Code'
            }
        },
        Definition: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'BasicIndustry',
        tableName: 'BasicIndustry',
        timestamps: false
    });

    return BasicIndustry;
};