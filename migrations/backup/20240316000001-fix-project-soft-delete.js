'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First try to add the column - this will fail if it already exists
      try {
        await queryInterface.addColumn('projects', 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true
        });
      } catch (error) {
        // Column might already exist, try to modify it instead
        await queryInterface.changeColumn('projects', 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true
        });
      }

      // Ensure timestamps are properly configured
      await queryInterface.sequelize.query(`
        ALTER TABLE projects 
        MODIFY created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        MODIFY updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        MODIFY deleted_at DATETIME NULL;
      `);
    } catch (error) {
      console.error('Migration Error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // No down migration needed as we're just ensuring column exists correctly
  }
};