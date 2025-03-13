module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add constraints and indexes for assignee relationship
    await queryInterface.addIndex('tasks', ['assigned_to'], {
      name: 'tasks_assigned_to_idx'
    });

    // Ensure assigned_to is a foreign key to users table
    await queryInterface.addConstraint('tasks', {
      fields: ['assigned_to'],
      type: 'foreign key',
      name: 'tasks_assigned_to_fkey',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('tasks', 'tasks_assigned_to_fkey');
    await queryInterface.removeIndex('tasks', 'tasks_assigned_to_idx');
  }
};