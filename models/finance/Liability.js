const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Liability extends Model {
        static associate(models) {
            Liability.belongsTo(models.User, { foreignKey: 'userId' });
        }
    }

    Liability.init({
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
        category: {
            type: DataTypes.ENUM('mortgage', 'loan', 'credit_card', 'other'),
            allowNull: false
        },
        amount: {
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
            allowNull: true
        },
        paymentDueDate: {
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
        accountNumber: {
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
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['category']
            }
        ]
    });

    return Liability;
};