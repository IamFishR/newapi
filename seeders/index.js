const rolePermissionSeeder = require('./rolePermissionSeeder');
const preferenceSeeder = require('./preferenceSeeder');
const taskManagementSeeder = require('./taskManagementSeeder');
const LoggingService = require('../services/monitoring/LoggingService');

async function runSeeders() {
    try {
        // Run all seeders
        await rolePermissionSeeder();
        await preferenceSeeder();
        await taskManagementSeeder();
        
        LoggingService.logDebug('All seeders completed successfully');
    } catch (error) {
        LoggingService.logError(error, {
            context: 'Database Seeding',
            message: 'Error running seeders'
        });
        throw error;
    }
}

module.exports = runSeeders;