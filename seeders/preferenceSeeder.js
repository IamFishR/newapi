const { User, UserPreference } = require('../models');
const LoggingService = require('../services/monitoring/LoggingService');

const defaultPreferences = {
    theme: 'light',
    language: 'en',
    notification_preferences: {
        email: true,
        push: true,
        price_alerts: true,
        portfolio_updates: true,
        market_news: true,
        dividend_alerts: true
    }
};

async function seedDefaultPreferences() {
    try {
        // Create default system user first
        const [defaultUser] = await User.findOrCreate({
            where: { username: 'system' },
            defaults: {
                email: 'system@example.com',
                password: 'systemDefaultPass123' // This should be a secure password in production
            }
        });

        // Create system default preferences using the default user's ID
        await UserPreference.findOrCreate({
            where: { user_id: defaultUser.id },
            defaults: {
                ...defaultPreferences,
                bio: 'System Default Settings',
                avatar_url: '/images/default-avatar.png'
            }
        });

        LoggingService.logDebug('Successfully seeded default preferences');
    } catch (error) {
        LoggingService.logError(error, { 
            context: 'Database Seeding',
            message: 'Error seeding default preferences' 
        });
        throw error;
    }
}

module.exports = seedDefaultPreferences;