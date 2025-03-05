const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../index');

class DebtPayment extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        this.belongsTo(models.DebtItem, {
            foreignKey: 'debt_id',
            onDelete: 'CASCADE'
        });
    }
}

DebtPayment.init({
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
    debt_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: {
            model: 'debt_items',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            notNull: true,
            gt: 0
        }
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    principal_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            notNull: true,
            gt: 0
        }
    },
    interest_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'DebtPayment',
    tableName: 'debt_payments',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['debt_id', 'payment_date']
        },
        {
            fields: ['user_id', 'payment_date']
        }
    ]
});

module.exports = DebtPayment;