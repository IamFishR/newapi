module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('task_labels', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('task_labels', 'deleted_at');
  },
};
