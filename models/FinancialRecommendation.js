'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FinancialRecommendation extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  
  FinancialRecommendation.init({
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
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['emergency_fund', 'debt_management', 'savings', 'investment', 'budget', 'income']]
      }
    },
    action: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    impact: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'dismissed'),
      defaultValue: 'pending'
    },
    completed_at: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'FinancialRecommendation',
    tableName: 'financial_recommendations',
    underscored: true,
    hooks: {
      beforeSave: async (recommendation, options) => {
        if (recommendation.status === 'completed' && !recommendation.completed_at) {
          recommendation.completed_at = new Date();
        }
      }
    }
  });

  return FinancialRecommendation;
};