'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add columns first
    await queryInterface.sequelize.query(`
      ALTER TABLE companies 
      ADD COLUMN created_at DATETIME,
      ADD COLUMN updated_at DATETIME,
      ADD COLUMN deleted_at DATETIME;
    `);

    // Update existing rows
    await queryInterface.sequelize.query(`
      UPDATE companies SET created_at = NOW(), updated_at = NOW();
    `);

    // Modify column constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE companies
      MODIFY created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      MODIFY updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      MODIFY deleted_at DATETIME NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE companies 
      DROP COLUMN created_at,
      DROP COLUMN updated_at,
      DROP COLUMN deleted_at;
    `);
  }
};