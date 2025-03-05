const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../index');

class FinancialGoal extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        this.hasMany(models.GoalContribution, {
            foreignKey: 'goal_id'
        });
    }
}

FinancialGoal.init({
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
    target_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            notNull: true,
            gt: 0
        }
    },
    current_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    target_date: {
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
    monthly_contribution: {
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
    underscored: true,
    indexes: [
        {
            fields: ['user_id', 'target_date']
        },
        {
            fields: ['user_id', 'status']
        }
    ]
});

module.exports = FinancialGoal;