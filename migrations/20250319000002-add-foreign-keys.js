'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Helper function to add a foreign key
    const addForeignKeyIfNotExists = async (sourceTable, targetTable, columnName, options = {}) => {
      try {
        await queryInterface.addConstraint(sourceTable, {
          fields: [columnName],
          type: 'foreign key',
          name: `fk_${sourceTable}_${columnName}`,
          references: {
            table: targetTable,
            field: options.targetKey || 'id'
          },
          onDelete: options.onDelete || 'CASCADE',
          onUpdate: options.onUpdate || 'CASCADE'
        });
      } catch (error) {
        // Constraint might already exist
        console.log(`Note: Foreign key ${columnName} not added to ${sourceTable} - might already exist`);
      }
    };

    // Add foreign keys for financial tables
    await addForeignKeyIfNotExists('financial_profiles', 'users', 'user_id');
    await addForeignKeyIfNotExists('bank_accounts', 'users', 'user_id');
    await addForeignKeyIfNotExists('transactions', 'users', 'user_id');
    await addForeignKeyIfNotExists('transactions', 'bank_accounts', 'account_id', { onDelete: 'SET NULL' });
    await addForeignKeyIfNotExists('transactions', 'budget_categories', 'category_id');
    
    // Investment related foreign keys
    await addForeignKeyIfNotExists('investments', 'users', 'user_id');
    await addForeignKeyIfNotExists('investment_transactions', 'investments', 'investment_id');
    await addForeignKeyIfNotExists('investment_transactions', 'users', 'user_id');

    // Debt related foreign keys
    await addForeignKeyIfNotExists('debt_items', 'users', 'user_id');
    await addForeignKeyIfNotExists('debt_payments', 'debt_items', 'debt_id');
    await addForeignKeyIfNotExists('debt_payments', 'users', 'user_id');

    // Goals related foreign keys
    await addForeignKeyIfNotExists('financial_goals', 'users', 'user_id');
    await addForeignKeyIfNotExists('goal_contributions', 'financial_goals', 'goal_id');
    await addForeignKeyIfNotExists('goal_contributions', 'users', 'user_id');

    // Assets and liabilities
    await addForeignKeyIfNotExists('assets', 'users', 'user_id');
    await addForeignKeyIfNotExists('liabilities', 'users', 'user_id');

    // Tax related foreign keys
    await addForeignKeyIfNotExists('tax_profiles', 'users', 'user_id');
    await addForeignKeyIfNotExists('tax_deductions', 'tax_profiles', 'tax_profile_id');
    await addForeignKeyIfNotExists('tax_deductions', 'users', 'user_id');

    // Shop related foreign keys
    await addForeignKeyIfNotExists('products', 'shops', 'shop_id');
    await addForeignKeyIfNotExists('orders', 'shops', 'shop_id');
    await addForeignKeyIfNotExists('orders', 'users', 'user_id', { onDelete: 'SET NULL' });
    await addForeignKeyIfNotExists('order_items', 'orders', 'order_id');
    await addForeignKeyIfNotExists('order_items', 'products', 'product_id');

    // Add additional indexes for better query performance
    await queryInterface.addIndex('transactions', ['date']);
    await queryInterface.addIndex('transactions', ['type']);
    await queryInterface.addIndex('investments', ['type']);
    await queryInterface.addIndex('financial_goals', ['status']);
    await queryInterface.addIndex('debt_items', ['category']);
    await queryInterface.addIndex('bank_accounts', ['status']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('products', ['status']);
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign keys
    const tables = [
      'financial_profiles',
      'bank_accounts',
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
      'products',
      'orders',
      'order_items'
    ];

    for (const table of tables) {
      const tableDescription = await queryInterface.describeTable(table);
      const foreignKeys = Object.keys(tableDescription).filter(column => 
        tableDescription[column].references
      );

      for (const column of foreignKeys) {
        await queryInterface.removeConstraint(table, `fk_${table}_${column}`)
          .catch(error => {
            console.log(`Note: Foreign key for ${column} not removed from ${table} - might not exist`);
          });
      }
    }

    // Remove additional indexes
    await queryInterface.removeIndex('transactions', ['date']).catch(() => {});
    await queryInterface.removeIndex('transactions', ['type']).catch(() => {});
    await queryInterface.removeIndex('investments', ['type']).catch(() => {});
    await queryInterface.removeIndex('financial_goals', ['status']).catch(() => {});
    await queryInterface.removeIndex('debt_items', ['category']).catch(() => {});
    await queryInterface.removeIndex('bank_accounts', ['status']).catch(() => {});
    await queryInterface.removeIndex('orders', ['status']).catch(() => {});
    await queryInterface.removeIndex('products', ['status']).catch(() => {});
  }
};