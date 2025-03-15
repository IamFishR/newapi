'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FinancialTrend extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  
  FinancialTrend.init({
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
    month: {
      type: DataTypes.DATE,
      allowNull: false
    },
    income: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    expenses: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    savings: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    net_worth: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    needs_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    wants_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    savings_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'FinancialTrend',
    tableName: 'financial_trends',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'month']
      }
    ]
  });

  return FinancialTrend;
};