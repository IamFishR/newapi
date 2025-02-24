const db = require('../../models');
const { AuditLog } = db;

class AuditService {
    static async log(params) {
        const {
            userId,
            action,
            entityType,
            entityId,
            oldValues,
            newValues,
            ipAddress,
            userAgent
        } = params;

        return await AuditLog.create({
            user_id: userId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            old_values: oldValues,
            new_values: newValues,
            ip_address: ipAddress,
            user_agent: userAgent
        });
    }

    static async getAuditLogs({
        userId = null,
        entityType = null,
        entityId = null,
        action = null,
        startDate = null,
        endDate = null,
        limit = 50,
        offset = 0
    }) {
        const where = {};
        
        if (userId) where.user_id = userId;
        if (entityType) where.entity_type = entityType;
        if (entityId) where.entity_id = entityId;
        if (action) where.action = action;
        
        if (startDate || endDate) {
            where.created_at = {};
            if (startDate) where.created_at.$gte = startDate;
            if (endDate) where.created_at.$lte = endDate;
        }

        return await AuditLog.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: ['User']
        });
    }

    // Helper methods for common audit actions
    static async logUserAction(userId, action, details, req = null) {
        return await this.log({
            userId,
            action,
            entityType: 'USER',
            entityId: userId.toString(),
            newValues: details,
            ipAddress: req?.ip,
            userAgent: req?.headers['user-agent']
        });
    }

    static async logPortfolioChange(userId, symbol, oldValues, newValues, req = null) {
        return await this.log({
            userId,
            action: 'PORTFOLIO_UPDATE',
            entityType: 'PORTFOLIO',
            entityId: `${userId}_${symbol}`,
            oldValues,
            newValues,
            ipAddress: req?.ip,
            userAgent: req?.headers['user-agent']
        });
    }

    static async logTransactionCreated(userId, transactionId, details, req = null) {
        return await this.log({
            userId,
            action: 'TRANSACTION_CREATED',
            entityType: 'TRANSACTION',
            entityId: transactionId.toString(),
            newValues: details,
            ipAddress: req?.ip,
            userAgent: req?.headers['user-agent']
        });
    }

    static async logPreferencesUpdate(userId, oldValues, newValues, req = null) {
        return await this.log({
            userId,
            action: 'PREFERENCES_UPDATE',
            entityType: 'PREFERENCES',
            entityId: userId.toString(),
            oldValues,
            newValues,
            ipAddress: req?.ip,
            userAgent: req?.headers['user-agent']
        });
    }
}

module.exports = AuditService;