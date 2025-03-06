const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../index');

class Transaction extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        this.belongsTo(models.BudgetCategory, {
            foreignKey: 'category_id',
            as: 'category'
        });
    }
}

Transaction.init({
    id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    category_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: {
            model: 'budget_categories',
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            notNull: true,
            notEqual: 0
        }
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
    underscored: true
});

module.exports = Transaction;