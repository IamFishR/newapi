const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CorporateAction extends Model {
        static associate(models) {
            CorporateAction.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    CorporateAction.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        symbol: {
            type: DataTypes.STRING(20),
            allowNull: false,
            references: {
                model: 'companies',
                key: 'symbol'
            }
        },
        ex_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        purpose: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'CorporateAction',
        tableName: 'corporate_actions',
        timestamps: false
    });

    return CorporateAction;
};