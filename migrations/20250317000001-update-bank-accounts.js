'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('bank_accounts', 'ifsc_code', {
      type: Sequelize.STRING(11),
      allowNull: true,
      after: 'account_type'
    });

    await queryInterface.addColumn('bank_accounts', 'micr_code', {
      type: Sequelize.STRING(9),
      allowNull: true,
      after: 'ifsc_code'
    });

    await queryInterface.addColumn('bank_accounts', 'currency', {
      type: Sequelize.STRING(3),
      allowNull: false,
      defaultValue: 'INR'
    });

    await queryInterface.addColumn('bank_accounts', 'is_primary', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('bank_accounts', 'opening_balance', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    });

    await queryInterface.addColumn('bank_accounts', 'current_balance', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    });

    await queryInterface.addColumn('bank_accounts', 'branch_name', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('bank_accounts', 'ifsc_code');
    await queryInterface.removeColumn('bank_accounts', 'micr_code');
    await queryInterface.removeColumn('bank_accounts', 'currency');
    await queryInterface.removeColumn('bank_accounts', 'is_primary');
    await queryInterface.removeColumn('bank_accounts', 'opening_balance');
    await queryInterface.removeColumn('bank_accounts', 'current_balance');
    await queryInterface.removeColumn('bank_accounts', 'branch_name');
  }
};