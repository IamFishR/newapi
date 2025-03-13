'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE project_members 
      ADD COLUMN created_at DATETIME,
      ADD COLUMN updated_at DATETIME;

      UPDATE project_members SET created_at = NOW(), updated_at = NOW();

      ALTER TABLE project_members
      MODIFY created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      MODIFY updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE project_members 
      DROP COLUMN created_at,
      DROP COLUMN updated_at;
    `);
  }
};