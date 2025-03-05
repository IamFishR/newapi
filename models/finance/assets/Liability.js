const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../index');

class Liability extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
    }
}

Liability.init({
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
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('mortgage', 'loan', 'credit_card', 'other'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    interest_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    minimum_payment: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    payment_due_date: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 31
        }
    },
    lender: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    account_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Liability',
    tableName: 'liabilities',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        {
            fields: ['user_id', 'category']
        },
        {
            fields: ['user_id', 'payment_due_date']
        }
    ]
});

module.exports = Liability;