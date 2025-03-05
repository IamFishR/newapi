const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DebtPayment extends Model {
        static associate(models) {
            DebtPayment.belongsTo(models.DebtItem, {
                foreignKey: 'debtId',
                as: 'debt'
            });
            DebtPayment.belongsTo(models.User, { foreignKey: 'userId' });
        }
    }

    DebtPayment.init({
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
        debtId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'debt_items',
                key: 'id'
            }
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        paymentDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        principalAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        interestAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        paymentMethod: {
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
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['debtId']
            },
            {
                fields: ['paymentDate']
            }
        ]
    });

    return DebtPayment;
};