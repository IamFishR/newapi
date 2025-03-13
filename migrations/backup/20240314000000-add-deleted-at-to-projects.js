'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('projects', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    } catch (error) {
      console.error('Migration Error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('projects', 'deleted_at');
    } catch (error) {
      console.error('Migration Rollback Error:', error);
      throw error;
    }
  }
};