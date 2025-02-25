const { TaskType, TaskPriority } = require('../models');
const LoggingService = require('../services/monitoring/LoggingService');

const defaultTaskTypes = [
    {
        name: 'Task',
        description: 'A general task item',
        icon: 'task',
        color: '#4A90E2'
    },
    {
        name: 'Bug',
        description: 'A software bug that needs to be fixed',
        icon: 'bug',
        color: '#E74C3C'
    },
    {
        name: 'Feature',
        description: 'A new feature to be implemented',
        icon: 'feature',
        color: '#2ECC71'
    },
    {
        name: 'Epic',
        description: 'A large body of work that can be broken down into smaller tasks',
        icon: 'epic',
        color: '#8E44AD'
    },
    {
        name: 'Story',
        description: 'A user story representing a feature from user perspective',
        icon: 'story',
        color: '#F1C40F'
    }
];

const defaultTaskPriorities = [
    {
        name: 'Critical',
        description: 'Must be fixed/completed immediately',
        level: 1,
        icon: 'critical',
        color: '#E74C3C'
    },
    {
        name: 'High',
        description: 'Should be fixed/completed as soon as possible',
        level: 2,
        icon: 'high',
        color: '#F39C12'
    },
    {
        name: 'Medium',
        description: 'Should be fixed/completed in the normal course of work',
        level: 3,
        icon: 'medium',
        color: '#3498DB'
    },
    {
        name: 'Low',
        description: 'Can be fixed/completed when time permits',
        level: 4,
        icon: 'low',
        color: '#95A5A6'
    }
];

async function seedTaskManagement() {
    try {
        // Create task types
        const taskTypePromises = defaultTaskTypes.map(type => 
            TaskType.findOrCreate({
                where: { name: type.name },
                defaults: { 
                    ...type,
                    created_by: 1 // Assuming admin user has ID 1
                }
            })
        );
        await Promise.all(taskTypePromises);

        // Create task priorities
        const priorityPromises = defaultTaskPriorities.map(priority => 
            TaskPriority.findOrCreate({
                where: { name: priority.name },
                defaults: priority
            })
        );
        await Promise.all(priorityPromises);

        LoggingService.logDebug('Successfully seeded task types and priorities');
    } catch (error) {
        LoggingService.logError(error, {
            context: 'Database Seeding',
            message: 'Error seeding task management data'
        });
        throw error;
    }
}

module.exports = seedTaskManagement;