'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    static associate(models) {
      Expense.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Expense.belongsTo(models.BankAccount, {
        foreignKey: 'account_id',
        as: 'account'
      });
    }

    // Get next occurrence of a recurring expense
    getNextOccurrence() {
      if (!this.is_recurring) return null;

      const today = new Date();
      const lastDate = new Date(this.date);
      let nextDate = new Date(lastDate);

      switch (this.frequency) {
        case 'daily':
          nextDate.setDate(lastDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(lastDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(lastDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDate.setMonth(lastDate.getMonth() + 3);
          break;
        case 'yearly':
          nextDate.setFullYear(lastDate.getFullYear() + 1);
          break;
      }

      // If recurring_end_date is set and next occurrence is after it, return null
      if (this.recurring_end_date && nextDate > new Date(this.recurring_end_date)) {
        return null;
      }

      return nextDate;
    }

    // Check if expense is recurring and active
    isActiveRecurring() {
      if (!this.is_recurring) return false;
      if (!this.recurring_end_date) return true;
      return new Date(this.recurring_end_date) > new Date();
    }
  }

  Expense.init({
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
    account_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'bank_accounts',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    sub_category: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    frequency: {
      type: DataTypes.ENUM('one_time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
      allowNull: true
    },
    recurring_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isValidEndDate(value) {
          if (this.is_recurring && value && new Date(value) <= new Date(this.date)) {
            throw new Error('Recurring end date must be after the start date');
          }
        }
      }
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
    modelName: 'Expense',
    tableName: 'expenses',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: async (expense) => {
        // If expense is recurring, frequency must be set
        if (expense.is_recurring && !expense.frequency) {
          throw new Error('Frequency must be set for recurring expenses');
        }
        // If frequency is set, expense must be recurring
        if (expense.frequency && !expense.is_recurring) {
          throw new Error('Cannot set frequency for non-recurring expenses');
        }
      },
      afterCreate: async (expense) => {
        // Update account balance if account_id is provided
        if (expense.account_id) {
          const account = await sequelize.models.BankAccount.findByPk(expense.account_id);
          if (account) {
            await account.update({
              current_balance: sequelize.literal(`current_balance - ${expense.amount}`)
            });
          }
        }
      }
    }
  });

  return Expense;
};