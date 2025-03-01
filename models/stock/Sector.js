const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Sector extends Model {
        static associate(models) {
            Sector.belongsTo(models.MacroEconomicSector, {
                foreignKey: 'MES_Code',
                targetKey: 'MES_Code'
            });
            Sector.hasMany(models.Industry, {
                foreignKey: 'Sect_Code',
                sourceKey: 'Sect_Code'
            });
        }
    }

    Sector.init({
        Sect_Code: {
            type: DataTypes.STRING(10),
            primaryKey: true
        },
        SectorName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        MES_Code: {
            type: DataTypes.STRING(10),
            allowNull: false,
            references: {
                model: 'MacroEconomicSector',
                key: 'MES_Code'
            }
        }
    }, {
        sequelize,
        modelName: 'Sector',
        tableName: 'Sector',
        timestamps: false
    });

    return Sector;
};