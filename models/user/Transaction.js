const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {
        static associate(models) {
            Transaction.belongsTo(models.User, { foreignKey: 'user_id' });
            Transaction.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    Transaction.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        symbol: {
            type: DataTypes.STRING(20),
            allowNull: false,
            references: {
                model: 'companies',
                key: 'symbol'
            }
        },
        transaction_type: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                isIn: [['BUY', 'SELL']]
            }
        },
        quantity: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        transaction_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Transaction',
        tableName: 'transactions',
        timestamps: true
    });

    return Transaction;
}