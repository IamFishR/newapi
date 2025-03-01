const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Industry extends Model {
        static associate(models) {
            Industry.belongsTo(models.Sector, {
                foreignKey: 'Sect_Code',
                targetKey: 'Sect_Code'
            });
            Industry.hasMany(models.BasicIndustry, {
                foreignKey: 'Ind_Code',
                sourceKey: 'Ind_Code'
            });
        }
    }

    Industry.init({
        Ind_Code: {
            type: DataTypes.STRING(10),
            primaryKey: true
        },
        IndustryName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        Sect_Code: {
            type: DataTypes.STRING(10),
            allowNull: false,
            references: {
                model: 'Sector',
                key: 'Sect_Code'
            }
        }
    }, {
        sequelize,
        modelName: 'Industry',
        tableName: 'Industry',
        timestamps: false
    });

    return Industry;
};