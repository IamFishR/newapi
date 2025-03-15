'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CreditCard extends Model {
    static associate(models) {
      CreditCard.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      CreditCard.hasMany(models.Transaction, {
        foreignKey: 'card_id',
        as: 'transactions'
      });
    }
  }

  CreditCard.init({
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
    card_number: {
      type: DataTypes.STRING(4),
      allowNull: false,
      validate: {
        len: [4, 4],
        isNumeric: true
      }
    },
    card_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    card_type: {
      type: DataTypes.ENUM('visa', 'mastercard', 'amex', 'discover', 'other'),
      allowNull: false
    },
    card_plan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    card_limit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
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
    modelName: 'CreditCard',
    tableName: 'credit_cards',
    timestamps: true,
    underscored: true
  });

  return CreditCard;
};