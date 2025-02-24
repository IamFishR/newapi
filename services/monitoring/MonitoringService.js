const { UserSession } = require('../../models');
const { Op } = require('sequelize');

class MonitoringService {
    static metrics = {
        activeConnections: 0,
        failedLoginAttempts: 0,
        syncOperations: 0,
        offlineOperations: 0,
        errors: []
    };

    static async trackActiveSession(userId, deviceInfo) {
        this.metrics.activeConnections++;
        await UserSession.update(
            { last_activity: new Date() },
            { where: { user_id: userId } }
        );
    }

    static async trackFailedLogin(ipAddress) {
        this.metrics.failedLoginAttempts++;
        // Implement rate limiting check
        const recentAttempts = await UserSession.count({
            where: {
                ip_address: ipAddress,
                created_at: {
                    [Op.gte]: new Date(Date.now() - 3600000) // Last hour
                }
            }
        });
        return recentAttempts >= 5; // Return true if should be blocked
    }

    static trackSyncOperation(successful = true) {
        this.metrics.syncOperations++;
        if (!successful) {
            this.trackError('sync_failure');
        }
    }

    static trackOfflineOperation() {
        this.metrics.offlineOperations++;
    }

    static trackError(type, details = {}) {
        const error = {
            type,
            timestamp: new Date(),
            details
        };
        this.metrics.errors.push(error);
        
        // Keep last 100 errors only
        if (this.metrics.errors.length > 100) {
            this.metrics.errors.shift();
        }
    }

    static async getSystemHealth() {
        const activeSessions = await UserSession.count({
            where: {
                last_activity: {
                    [Op.gte]: new Date(Date.now() - 300000) // Last 5 minutes
                }
            }
        });

        return {
            activeConnections: this.metrics.activeConnections,
            activeSessions,
            failedLoginAttempts: this.metrics.failedLoginAttempts,
            syncOperations: this.metrics.syncOperations,
            offlineOperations: this.metrics.offlineOperations,
            recentErrors: this.metrics.errors.slice(-10), // Last 10 errors
            timestamp: new Date()
        };
    }

    static async cleanupStaleData() {
        // Clear old sessions
        await UserSession.destroy({
            where: {
                last_activity: {
                    [Op.lt]: new Date(Date.now() - 86400000) // 24 hours
                }
            }
        });

        // Reset metrics
        this.metrics.failedLoginAttempts = 0;
        this.metrics.syncOperations = 0;
        this.metrics.offlineOperations = 0;
        this.metrics.errors = this.metrics.errors.slice(-20); // Keep only recent errors
    }

    static resetMetrics() {
        this.metrics = {
            activeConnections: 0,
            failedLoginAttempts: 0,
            syncOperations: 0,
            offlineOperations: 0,
            errors: []
        };
    }
}

// Schedule cleanup
setInterval(() => {
    MonitoringService.cleanupStaleData();
}, 3600000); // Every hour

module.exports = MonitoringService;