module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modify tasks table to ensure assigned_to has appropriate default
    await queryInterface.changeColumn('tasks', 'assigned_to', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Add index for assigned_to for better query performance
    await queryInterface.addIndex('tasks', ['assigned_to'], {
      name: 'idx_tasks_assigned_to'
    });

    // Add project members role index
    await queryInterface.addIndex('project_members', ['role'], {
      name: 'idx_project_members_role'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('tasks', 'idx_tasks_assigned_to');
    await queryInterface.removeIndex('project_members', 'idx_project_members_role');
    
    await queryInterface.changeColumn('tasks', 'assigned_to', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });
  }
};