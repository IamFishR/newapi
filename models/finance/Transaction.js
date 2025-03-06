const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {
        static associate(models) {
            Transaction.belongsTo(models.User, { foreignKey: 'user_id' });
            Transaction.belongsTo(models.BudgetCategory, { 
                foreignKey: 'category_id',
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
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        category_id: {
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
        recurring_type: {
            type: DataTypes.ENUM('none', 'daily', 'weekly', 'monthly', 'yearly'),
            defaultValue: 'none'
        },
        recurring_end_date: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Transaction',
        tableName: 'transactions',
        timestamps: true,
        paranoid: true,
        underscored: true,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['category_id']
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