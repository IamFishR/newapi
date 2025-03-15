'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SavingsGoal extends Model {
    static associate(models) {
      SavingsGoal.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }

    // Calculate progress percentage
    getProgress() {
      return (this.current_amount / this.target_amount) * 100;
    }

    // Calculate remaining amount
    getRemainingAmount() {
      return this.target_amount - this.current_amount;
    }

    // Check if goal is achieved
    isAchieved() {
      return this.current_amount >= this.target_amount;
    }

    // Calculate monthly contribution needed
    getRequiredMonthlyContribution() {
      if (this.isAchieved()) return 0;

      const today = new Date();
      const targetDate = new Date(this.target_date);
      const monthsRemaining = Math.max(1, 
        (targetDate.getFullYear() - today.getFullYear()) * 12 + 
        (targetDate.getMonth() - today.getMonth()));

      return (this.target_amount - this.current_amount) / monthsRemaining;
    }
  }

  SavingsGoal.init({
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
    current_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    target_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
        isGreaterThanCurrent(value) {
          if (value <= this.current_amount) {
            throw new Error('Target amount must be greater than current amount');
          }
        }
      }
    },
    target_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isFutureDate(value) {
          if (new Date(value) <= new Date()) {
            throw new Error('Target date must be in the future');
          }
        }
      }
    },
    monthly_contribution: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    savings_type: {
      type: DataTypes.ENUM('emergency', 'retirement', 'education', 'house', 'car', 'travel', 'wedding', 'other'),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    modelName: 'SavingsGoal',
    tableName: 'savings_goals',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (goal) => {
        // Validate target date is in future
        if (new Date(goal.target_date) <= new Date()) {
          throw new Error('Target date must be in the future');
        }
      },
      afterCreate: async (goal) => {
        // Any actions needed after goal creation
      }
    }
  });

  return SavingsGoal;
};