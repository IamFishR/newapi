module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('task_types', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('task_types', 'deleted_at');
  }
};