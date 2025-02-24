const rolePermissionSeeder = require('./rolePermissionSeeder');
const preferenceSeeder = require('./preferenceSeeder');
const LoggingService = require('../services/monitoring/LoggingService');

async function runSeeders() {
    try {
        // Run all seeders
        await rolePermissionSeeder();
        await preferenceSeeder();
        
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