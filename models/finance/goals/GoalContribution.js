const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../index');

class GoalContribution extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        this.belongsTo(models.FinancialGoal, {
            foreignKey: 'goal_id',
            onDelete: 'CASCADE'
        });
    }
}

GoalContribution.init({
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
    goal_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: {
            model: 'financial_goals',
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
    date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'GoalContribution',
    tableName: 'goal_contributions',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['goal_id', 'date']
        },
        {
            fields: ['user_id', 'date']
        }
    ]
});

module.exports = GoalContribution;