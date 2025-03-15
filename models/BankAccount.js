'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BankAccount extends Model {
    static associate(models) {
      BankAccount.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      BankAccount.hasMany(models.Transaction, {
        foreignKey: 'account_id',
        as: 'transactions'
      });
    }
  }

  BankAccount.init({
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
    account_number: {
      type: DataTypes.STRING(4),
      allowNull: false,
      validate: {
        len: [4, 4]
      }
    },
    account_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    account_type: {
      type: DataTypes.ENUM('checking', 'savings', 'credit_card', 'investment', 'loan', 'other'),
      allowNull: false
    },
    ifsc_code: {
      type: DataTypes.STRING(11),
      allowNull: true,
      validate: {
        len: [11, 11]
      }
    },
    micr_code: {
      type: DataTypes.STRING(9),
      allowNull: true,
      validate: {
        len: [9, 9]
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'INR'
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    opening_balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    current_balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    branch_name: {
      type: DataTypes.STRING(100),
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
    modelName: 'BankAccount',
    tableName: 'bank_accounts',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (account) => {
        if (account.is_primary) {
          // Set all other accounts of this user to non-primary
          await BankAccount.update(
            { is_primary: false },
            {
              where: {
                user_id: account.user_id,
                is_primary: true
              }
            }
          );
        }
      },
      beforeUpdate: async (account) => {
        if (account.changed('is_primary') && account.is_primary) {
          // Set all other accounts of this user to non-primary
          await BankAccount.update(
            { is_primary: false },
            {
              where: {
                user_id: account.user_id,
                id: { [sequelize.Sequelize.Op.ne]: account.id },
                is_primary: true
              }
            }
          );
        }
      }
    }
  });

  return BankAccount;
};