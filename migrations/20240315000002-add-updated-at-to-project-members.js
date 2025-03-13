'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the column first
    await queryInterface.sequelize.query(`
      ALTER TABLE project_members 
      ADD COLUMN updated_at DATETIME;
    `);

    // Update existing rows
    await queryInterface.sequelize.query(`
      UPDATE project_members SET updated_at = created_at;
    `);

    // Modify column to add default and auto-update
    await queryInterface.sequelize.query(`
      ALTER TABLE project_members
      MODIFY updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE project_members 
      DROP COLUMN updated_at;
    `);
  }
};