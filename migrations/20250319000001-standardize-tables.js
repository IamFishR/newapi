'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add UUID extension if not exists (for PostgreSQL)
    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `).catch(error => {
      // Ignore if not PostgreSQL or extension already exists
      console.log('Note: uuid-ossp extension not added - might be MySQL or already exists');
    });

    // Helper function to add timestamp columns
    const addTimestampsIfNotExists = async (tableName) => {
      const tableDescribe = await queryInterface.describeTable(tableName);
      
      const columnsToAdd = [];
      
      if (!tableDescribe.created_at) {
        columnsToAdd.push(['created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }]);
      }
      
      if (!tableDescribe.updated_at) {
        columnsToAdd.push(['updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }]);
      }
      
      if (!tableDescribe.deleted_at) {
        columnsToAdd.push(['deleted_at', {
          type: Sequelize.DATE,
          allowNull: true
        }]);
      }

      for (const [columnName, columnDefinition] of columnsToAdd) {
        await queryInterface.addColumn(tableName, columnName, columnDefinition)
          .catch(error => {
            // Column might already exist
            console.log(`Note: Column ${columnName} not added to ${tableName} - might already exist`);
          });
      }
    };

    // List of tables that need timestamp standardization
    const tables = [
      'users',
      'roles',
      'permissions',
      'user_roles',
      'user_permissions',
      'sessions',
      'financial_profiles',
      'bank_accounts',
      'budget_categories',
      'transactions',
      'investments',
      'investment_transactions',
      'debt_items',
      'debt_payments',
      'financial_goals',
      'goal_contributions',
      'assets',
      'liabilities',
      'tax_profiles',
      'tax_deductions',
      'shops',
      'products',
      'orders',
      'order_items'
    ];

    // Add timestamps to all tables
    for (const table of tables) {
      await addTimestampsIfNotExists(table);
    }

    // Add indexes for timestamps
    for (const table of tables) {
      await queryInterface.addIndex(table, ['created_at'])
        .catch(error => console.log(`Note: Index on created_at not added to ${table} - might already exist`));
      
      await queryInterface.addIndex(table, ['deleted_at'])
        .catch(error => console.log(`Note: Index on deleted_at not added to ${table} - might already exist`));
    }
  },

  async down(queryInterface, Sequelize) {
    // Helper function to remove timestamp columns
    const removeTimestampsIfExists = async (tableName) => {
      const columns = ['created_at', 'updated_at', 'deleted_at'];
      
      for (const column of columns) {
        await queryInterface.removeColumn(tableName, column)
          .catch(error => {
            // Column might not exist
            console.log(`Note: Column ${column} not removed from ${tableName} - might not exist`);
          });
      }
    };

    const tables = [
      'users',
      'roles',
      'permissions',
      'user_roles',
      'user_permissions',
      'sessions',
      'financial_profiles',
      'bank_accounts',
      'budget_categories',
      'transactions',
      'investments',
      'investment_transactions',
      'debt_items',
      'debt_payments',
      'financial_goals',
      'goal_contributions',
      'assets',
      'liabilities',
      'tax_profiles',
      'tax_deductions',
      'shops',
      'products',
      'orders',
      'order_items'
    ];

    // Remove timestamps from all tables
    for (const table of tables) {
      await removeTimestampsIfExists(table);
    }
  }
};