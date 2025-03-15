'use strict';

const { v4: uuidv4 } = require('uuid');

const DEFAULT_CATEGORIES = [
  // Essential expenses
  { name: 'Housing', type: 'ESSENTIAL', color: '#FF8C00', is_default: true },
  { name: 'Utilities', type: 'ESSENTIAL', color: '#4169E1', is_default: true },
  { name: 'Groceries', type: 'ESSENTIAL', color: '#32CD32', is_default: true },
  { name: 'Healthcare', type: 'ESSENTIAL', color: '#FF69B4', is_default: true },
  { name: 'Insurance', type: 'ESSENTIAL', color: '#4B0082', is_default: true },
  { name: 'Transportation', type: 'ESSENTIAL', color: '#808080', is_default: true },
  { name: 'Education', type: 'ESSENTIAL', color: '#8B4513', is_default: true },
  { name: 'Debt Payments', type: 'ESSENTIAL', color: '#FF0000', is_default: true },

  // Discretionary expenses
  { name: 'Food & Dining', type: 'DISCRETIONARY', color: '#FFD700', is_default: true },
  { name: 'Shopping', type: 'DISCRETIONARY', color: '#9370DB', is_default: true },
  { name: 'Entertainment', type: 'DISCRETIONARY', color: '#00CED1', is_default: true },
  { name: 'Travel', type: 'DISCRETIONARY', color: '#98FB98', is_default: true },
  { name: 'Personal Care', type: 'DISCRETIONARY', color: '#DDA0DD', is_default: true },
  { name: 'Hobbies', type: 'DISCRETIONARY', color: '#F0E68C', is_default: true },
  { name: 'Gifts & Donations', type: 'DISCRETIONARY', color: '#FF69B4', is_default: true },

  // Financial expenses
  { name: 'Investments', type: 'FINANCIAL', color: '#20B2AA', is_default: true },
  { name: 'Savings', type: 'FINANCIAL', color: '#3CB371', is_default: true },
  { name: 'Taxes', type: 'FINANCIAL', color: '#DC143C', is_default: true },
  { name: 'Business Expenses', type: 'FINANCIAL', color: '#4682B4', is_default: true }
];

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all users
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE deleted_at IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create default categories for each user
    const categories = users.flatMap(user => 
      DEFAULT_CATEGORIES.map(category => ({
        id: uuidv4(),
        user_id: user.id,
        name: category.name,
        type: category.type,
        color: category.color,
        is_default: category.is_default,
        created_at: new Date(),
        updated_at: new Date()
      }))
    );

    return queryInterface.bulkInsert('budget_categories', categories, {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('budget_categories', {
      is_default: true
    }, {});
  }
};