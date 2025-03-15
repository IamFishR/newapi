'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('financial_goals', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      target_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      current_amount: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      target_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      monthly_contribution: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
      },
      progress: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      status: {
        type: Sequelize.ENUM('active', 'completed', 'cancelled'),
        defaultValue: 'active'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('financial_goals', ['user_id']);
    await queryInterface.addIndex('financial_goals', ['status']);
    await queryInterface.addIndex('financial_goals', ['category']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('financial_goals');
  }
};