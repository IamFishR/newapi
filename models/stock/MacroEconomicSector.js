const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MacroEconomicSector extends Model {
        static associate(models) {
            MacroEconomicSector.hasMany(models.Sector, {
                foreignKey: 'MES_Code',
                sourceKey: 'MES_Code'
            });
        }
    }

    MacroEconomicSector.init({
        MES_Code: {
            type: DataTypes.STRING(10),
            primaryKey: true
        },
        MacroEconomicSectorName: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'MacroEconomicSector',
        tableName: 'MacroEconomicSector',
        timestamps: false
    });

    return MacroEconomicSector;
};