const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DebtItem extends Model {
        static associate(models) {
            DebtItem.belongsTo(models.User, { foreignKey: 'userId' });
            DebtItem.hasMany(models.DebtPayment, {
                foreignKey: 'debtId',
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
        userId: {
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
        interestRate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0
        },
        minimumPayment: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        initialBalance: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'DebtItem',
        tableName: 'debt_items',
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['type']
            },
            {
                fields: ['dueDate']
            }
        ]
    });

    return DebtItem;
};