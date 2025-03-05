const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class FinancialProfile extends Model {
        static associate(models) {
            FinancialProfile.belongsTo(models.User, { foreignKey: 'userId' });
        }
    }

    FinancialProfile.init({
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
        monthlyIncome: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        monthlySavingsGoal: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        currentSavings: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        monthlyExpenses: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                housing: 0,
                utilities: 0,
                transportation: 0,
                groceries: 0,
                healthcare: 0,
                entertainment: 0,
                other: 0
            }
        },
        investmentProfile: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                currentInvestments: 0,
                monthlyInvestmentGoal: 0,
                riskTolerance: 'medium'
            }
        },
        lastUpdated: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'FinancialProfile',
        tableName: 'financial_profiles',
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                unique: true,
                fields: ['userId']
            }
        ]
    });

    return FinancialProfile;
};