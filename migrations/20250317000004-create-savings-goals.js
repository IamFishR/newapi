'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('savings_goals', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      current_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      target_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      target_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      monthly_contribution: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      savings_type: {
        type: Sequelize.ENUM('emergency', 'retirement', 'education', 'house', 'car', 'travel', 'wedding', 'other'),
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('savings_goals', ['user_id']);
    await queryInterface.addIndex('savings_goals', ['savings_type']);
    await queryInterface.addIndex('savings_goals', ['target_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('savings_goals');
  }
};