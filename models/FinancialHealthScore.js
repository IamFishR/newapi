'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FinancialHealthScore extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  
  FinancialHealthScore.init({
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
    overall_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    savings_rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    debt_to_income_ratio: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    emergency_fund_months: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    last_calculated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    needs_percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    wants_percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    savings_percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    }
  }, {
    sequelize,
    modelName: 'FinancialHealthScore',
    tableName: 'financial_health_scores',
    underscored: true,
  });

  return FinancialHealthScore;
};