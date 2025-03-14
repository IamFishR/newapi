module.exports = {
  async up(queryInterface, Sequelize) {
    // First, clean up existing priorities
    await queryInterface.bulkDelete('task_priorities', null, {});

    // Insert priorities matching our validation schema
    const priorities = [
      {
        name: 'Critical',
        description: 'Must be fixed/completed immediately',
        level: 1,
        icon: 'critical',
        color: '#E74C3C',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'High',
        description: 'Should be fixed/completed as soon as possible',
        level: 2,
        icon: 'high',
        color: '#F39C12',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Medium',
        description: 'Should be fixed/completed in the normal course of work',
        level: 3,
        icon: 'medium',
        color: '#3498DB',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Low',
        description: 'Can be fixed/completed when time permits',
        level: 4,
        icon: 'low',
        color: '#95A5A6',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('task_priorities', priorities);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('task_priorities', {
      name: ['Critical', 'High', 'Medium', 'Low']
    });
  }
};