const { UserPreference } = require('../../models');
const AuditService = require('../audit/AuditService');
const ValidationService = require('../../utils/ValidationService');
const WebSocketService = require('../WebSocketService');

class PreferenceService {
    async createOrUpdatePreferences(userId, preferences, req = null) {
        const [prefs, created] = await UserPreference.findOrCreate({
            where: { user_id: userId },
            defaults: preferences
        });

        if (!created) {
            const oldValues = prefs.toJSON();
            await prefs.update(preferences);
            await AuditService.logPreferencesUpdate(userId, oldValues, preferences, req);
        }

        WebSocketService.notifyPreferencesUpdate(userId, preferences);
        return prefs;
    }

    async getPreferences(userId) {
        return await UserPreference.findOne({ where: { user_id: userId } });
    }

    async updateProfile(userId, profileData, req = null) {
        const prefs = await this.getPreferences(userId);
        const oldValues = prefs.toJSON();
        const updatedPrefs = await prefs.update(profileData);

        await AuditService.logPreferencesUpdate(userId, oldValues, profileData, req);
        WebSocketService.notifyPreferencesUpdate(userId, profileData);
        return updatedPrefs;
    }

    async updateNotificationSettings(userId, settings, req = null) {
        const prefs = await this.getPreferences(userId);
        const oldValues = prefs.toJSON();
        const updatedPrefs = await prefs.update({ notification_settings: settings });

        await AuditService.logPreferencesUpdate(userId, oldValues, { notification_settings: settings }, req);
        WebSocketService.notifyPreferencesUpdate(userId, { notification_settings: settings });
        return updatedPrefs;
    }

    async updateTheme(userId, theme, req = null) {
        const prefs = await this.getPreferences(userId);
        const oldValues = prefs.toJSON();
        const updatedPrefs = await prefs.update({ theme });

        await AuditService.logPreferencesUpdate(userId, oldValues, { theme }, req);
        WebSocketService.notifyPreferencesUpdate(userId, { theme });
        return updatedPrefs;
    }

    async updateLanguage(userId, language, req = null) {
        const prefs = await this.getPreferences(userId);
        const oldValues = prefs.toJSON();
        const updatedPrefs = await prefs.update({ language });

        await AuditService.logPreferencesUpdate(userId, oldValues, { language }, req);
        WebSocketService.notifyPreferencesUpdate(userId, { language });
        return updatedPrefs;
    }
}

module.exports = new PreferenceService();