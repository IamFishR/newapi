const { Role, Permission } = require('../models');
const LoggingService = require('../services/monitoring/LoggingService');

const defaultRoles = [
    'admin',
    'user',
    'analyst',
    'guest'
];

const defaultPermissions = [
    // User management
    'manage_users',
    'view_users',
    // Portfolio management
    'manage_portfolio',
    'view_portfolio',
    // Market data
    'view_market_data',
    'export_market_data',
    // Company data
    'manage_companies',
    'view_companies',
    // Financial data
    'manage_financials',
    'view_financials'
];

const rolePermissionMap = {
    admin: defaultPermissions,
    user: [
        'view_users',
        'manage_portfolio',
        'view_portfolio',
        'view_market_data',
        'view_companies',
        'view_financials'
    ],
    analyst: [
        'view_users',
        'view_portfolio',
        'view_market_data',
        'export_market_data',
        'view_companies',
        'view_financials'
    ],
    guest: [
        'view_market_data',
        'view_companies'
    ]
};

async function seedRolesAndPermissions() {
    try {
        // Create permissions
        const permissionPromises = defaultPermissions.map(perm => 
            Permission.findOrCreate({
                where: { permission_name: perm }
            })
        );
        await Promise.all(permissionPromises);

        // Create roles
        const rolePromises = defaultRoles.map(role => 
            Role.findOrCreate({
                where: { role_name: role }
            })
        );
        const createdRoles = await Promise.all(rolePromises);

        // Assign permissions to roles
        for (const [roleIndex, [role]] of createdRoles.entries()) {
            const roleName = defaultRoles[roleIndex];
            const permissions = await Permission.findAll({
                where: {
                    permission_name: rolePermissionMap[roleName]
                }
            });
            await role.setPermissions(permissions);
        }

        LoggingService.logDebug('Successfully seeded roles and permissions');
    } catch (error) {
        LoggingService.logError(error, {
            context: 'Database Seeding',
            message: 'Error seeding roles and permissions'
        });
        throw error;
    }
}

module.exports = seedRolesAndPermissions;