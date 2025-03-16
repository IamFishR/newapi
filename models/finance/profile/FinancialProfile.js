const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../index');

class FinancialProfile extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
    }
}

FinancialProfile.init({
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
    monthly_income: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    monthly_savings_goal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    current_savings: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    monthly_expenses: {
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
    investment_profile: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
            current_investments: 0,
            monthly_investment_goal: 0,
            risk_tolerance: 'medium'
        }
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'FinancialProfile',
    tableName: 'financial_profiles',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id']
        }
    ]
});

module.exports = FinancialProfile;