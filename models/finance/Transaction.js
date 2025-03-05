const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {
        static associate(models) {
            Transaction.belongsTo(models.User, { foreignKey: 'userId' });
            Transaction.belongsTo(models.BudgetCategory, { 
                foreignKey: 'categoryId',
                as: 'category'
            });
        }
    }

    Transaction.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        categoryId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'budget_categories',
                key: 'id'
            }
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('income', 'expense'),
            allowNull: false
        },
        recurringType: {
            type: DataTypes.ENUM('none', 'daily', 'weekly', 'monthly', 'yearly'),
            defaultValue: 'none'
        },
        recurringEndDate: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Transaction',
        tableName: 'transactions',
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['categoryId']
            },
            {
                fields: ['date']
            },
            {
                fields: ['type']
            }
        ]
    });

    return Transaction;
};