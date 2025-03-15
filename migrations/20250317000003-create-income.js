'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('income', {
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
      type: {
        type: Sequelize.ENUM('salary', 'business', 'rental', 'interest', 'dividend', 'capital_gains', 'other'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      frequency: {
        type: Sequelize.ENUM('one_time', 'monthly', 'quarterly', 'yearly'),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
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

    await queryInterface.addIndex('income', ['user_id']);
    await queryInterface.addIndex('income', ['type']);
    await queryInterface.addIndex('income', ['date']);
    await queryInterface.addIndex('income', ['frequency']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('income');
  }
};