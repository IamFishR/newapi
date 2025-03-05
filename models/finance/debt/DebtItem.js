const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../index');

class DebtItem extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        this.hasMany(models.DebtPayment, {
            foreignKey: 'debt_id'
        });
    }
}

DebtItem.init({
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
    type: {
        type: DataTypes.ENUM('credit_card', 'loan', 'mortgage', 'other'),
        allowNull: false
    },
    balance: {
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
        allowNull: false,
        defaultValue: 0
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    initial_balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'DebtItem',
    tableName: 'debt_items',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        {
            fields: ['user_id', 'due_date']
        },
        {
            fields: ['user_id', 'type']
        }
    ]
});

module.exports = DebtItem;