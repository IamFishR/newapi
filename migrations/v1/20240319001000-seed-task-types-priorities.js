const defaultTaskTypes = [
  {
    name: 'Task',
    description: 'A general task item',
    icon: 'task',
    color: '#4A90E2',
    created_by: 1
  },
  {
    name: 'Bug',
    description: 'A software bug that needs to be fixed',
    icon: 'bug',
    color: '#E74C3C',
    created_by: 1
  },
  {
    name: 'Feature',
    description: 'A new feature to be implemented',
    icon: 'feature',
    color: '#2ECC71',
    created_by: 1
  }
];

const defaultTaskPriorities = [
  {
    name: 'High',
    description: 'Should be fixed/completed as soon as possible',
    level: 1,
    icon: 'high',
    color: '#F39C12',
    created_by: 1
  },
  {
    name: 'Medium',
    description: 'Should be fixed/completed in the normal course of work',
    level: 2,
    icon: 'medium',
    color: '#3498DB',
    created_by: 1
  },
  {
    name: 'Low',
    description: 'Can be fixed/completed when time permits',
    level: 3,
    icon: 'low',
    color: '#95A5A6',
    created_by: 1
  }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert default task types if they don't exist
    for (const type of defaultTaskTypes) {
      await queryInterface.bulkInsert('task_types', [type], {
        ignoreDuplicates: true
      });
    }

    // Insert default task priorities if they don't exist
    for (const priority of defaultTaskPriorities) {
      await queryInterface.bulkInsert('task_priorities', [priority], {
        ignoreDuplicates: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('task_types', {
      name: defaultTaskTypes.map(t => t.name)
    });
    await queryInterface.bulkDelete('task_priorities', {
      name: defaultTaskPriorities.map(p => p.name)
    });
  }
};