'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Expenses', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      description: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      frequency: {
        type: Sequelize.ENUM('one-time', 'monthly', 'quarterly', 'yearly'),
        allowNull: false,
        defaultValue: 'one-time'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('Expenses', ['user_id']);
    await queryInterface.addIndex('Expenses', ['category']);
    await queryInterface.addIndex('Expenses', ['date']);
    await queryInterface.addIndex('Expenses', ['frequency']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Expenses');
  }
};