'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create bank_accounts table
    await queryInterface.createTable('bank_accounts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,  // Changed from UUID to INTEGER to match users table
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      account_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      account_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      account_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'e.g., PRIME POTENTIAL, Savings, Current, etc.'
      },
      bank_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      branch_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      ifsc_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      micr_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'INR',
        allowNull: false,
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'closed'),
        defaultValue: 'active',
      },
      opening_balance: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      current_balance: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      last_synced_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indices on bank_accounts
    await queryInterface.addIndex('bank_accounts', ['user_id']);
    await queryInterface.addIndex('bank_accounts', ['account_number', 'bank_name'], {
      unique: true
    });
    await queryInterface.addIndex('bank_accounts', ['status']);

    // Add account_id to transactions table
    await queryInterface.addColumn('transactions', 'account_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'bank_accounts',
        key: 'id'
      },
      after: 'user_id' // Position the column right after user_id
    });

    // Add index on account_id in transactions
    await queryInterface.addIndex('transactions', ['account_id']);
  },

  async down(queryInterface, Sequelize) {
    // Remove account_id from transactions table
    await queryInterface.removeIndex('transactions', ['account_id']);
    await queryInterface.removeColumn('transactions', 'account_id');

    // Remove bank_accounts table
    await queryInterface.dropTable('bank_accounts');
  }
};