const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Portfolio extends Model {
        static associate(models) {
            Portfolio.belongsTo(models.User, { foreignKey: 'user_id' });
            Portfolio.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    Portfolio.init({
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        symbol: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            references: {
                model: 'companies',
                key: 'symbol'
            }
        },
        quantity: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        average_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Portfolio',
        tableName: 'portfolio',
        timestamps: false
    });

    return Portfolio;
}