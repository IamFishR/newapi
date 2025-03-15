'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('credit_cards', {
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
      card_number: {
        type: Sequelize.STRING(4),
        allowNull: false,
        comment: 'Last 4 digits of card'
      },
      card_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      card_type: {
        type: Sequelize.ENUM('visa', 'mastercard', 'amex', 'discover', 'other'),
        allowNull: false
      },
      card_plan: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      card_limit: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
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

    await queryInterface.addIndex('credit_cards', ['user_id']);
    await queryInterface.addIndex('credit_cards', ['card_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('credit_cards');
  }
};