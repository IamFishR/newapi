const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class FinancialGoal extends Model {
        static associate(models) {
            FinancialGoal.belongsTo(models.User, { foreignKey: 'userId' });
            FinancialGoal.hasMany(models.GoalContribution, {
                foreignKey: 'goalId',
                as: 'contributions'
            });
        }
    }

    FinancialGoal.init({
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
        targetAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        currentAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        targetDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        category: {
            type: DataTypes.ENUM('savings', 'investment', 'property', 'education', 'retirement', 'other'),
            allowNull: false
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high'),
            allowNull: false,
            defaultValue: 'medium'
        },
        monthlyContribution: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM('active', 'completed', 'cancelled'),
            defaultValue: 'active'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'FinancialGoal',
        tableName: 'financial_goals',
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['category']
            },
            {
                fields: ['priority']
            },
            {
                fields: ['status']
            }
        ]
    });

    return FinancialGoal;
};