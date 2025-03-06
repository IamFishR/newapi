const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DebtItem extends Model {
        static associate(models) {
            DebtItem.belongsTo(models.User, { foreignKey: 'user_id' });
            DebtItem.hasMany(models.DebtPayment, {
                foreignKey: 'debt_id',
                as: 'payments'
            });
        }
    }

    DebtItem.init({
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
            defaultValue: 0
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
            allowNull: false,
            defaultValue: DataTypes.NOW
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
        modelName: 'DebtItem',
        tableName: 'debt_items',
        timestamps: true,
        paranoid: true,
        underscored: true,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['type']
            },
            {
                fields: ['due_date']
            }
        ]
    });

    return DebtItem;
};