'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('expenses', 'is_recurring', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('expenses', 'frequency', {
      type: Sequelize.ENUM('one_time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
      allowNull: true
    });

    await queryInterface.addColumn('expenses', 'sub_category', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    await queryInterface.addColumn('expenses', 'recurring_end_date', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });

    await queryInterface.addIndex('expenses', ['is_recurring']);
    await queryInterface.addIndex('expenses', ['frequency']);
    await queryInterface.addIndex('expenses', ['sub_category']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('expenses', 'is_recurring');
    await queryInterface.removeColumn('expenses', 'frequency');
    await queryInterface.removeColumn('expenses', 'sub_category');
    await queryInterface.removeColumn('expenses', 'recurring_end_date');
  }
};