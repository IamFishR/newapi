'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Income extends Model {
    static associate(models) {
      Income.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  Income.init({
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
    type: {
      type: DataTypes.ENUM('salary', 'business', 'rental', 'interest', 'dividend', 'capital_gains', 'other'),
      allowNull: false
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
    frequency: {
      type: DataTypes.ENUM('one_time', 'monthly', 'quarterly', 'yearly'),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    modelName: 'Income',
    tableName: 'income',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (income) => {
        // Add any validation or processing hooks here
      },
      afterCreate: async (income) => {
        // Update user's financial metrics after income creation
      }
    }
  });

  return Income;
};