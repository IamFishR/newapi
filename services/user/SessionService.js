const { UserSession } = require('../../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const LoggingService = require('../monitoring/LoggingService');

class SessionService {
    async createSession(userId, deviceInfo = {}, ipAddress = null, retryCount = 0) {
        try {
            const session = await UserSession.create({
                user_id: userId,
                device_info: deviceInfo,
                session_token: '', // Will be updated after token generation
                ip_address: ipAddress,
                last_activity: new Date(),
                expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            });

            // Generate token after session creation so we can include the session ID
            const sessionToken = jwt.sign(
                { 
                    sessionId: session.id,  // Using the actual session ID
                    userId: userId 
                }, 
                process.env.JWT_SECRET || 'your-secret-key', 
                { expiresIn: '7d' }
            );

            // Update the session with the generated token
            await session.update({ session_token: sessionToken });
            session.session_token = sessionToken; // Update the instance

            return session;
        } catch (error) {
            // If we get a unique constraint violation and haven't exceeded retry attempts
            if (error.name === 'SequelizeUniqueConstraintError' && retryCount < 3) {
                // Retry with incremented counter
                return this.createSession(userId, deviceInfo, ipAddress, retryCount + 1);
            }
            LoggingService.logError(error);
            throw new Error('Failed to create session');
        }
    }

    async validateSession(token) {
        try {
            // First verify the JWT is valid
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

            const session = await UserSession.findOne({
                where: {
                    id: decoded.sessionId,
                    user_id: decoded.userId,
                    session_token: token,
                    expiry: { [Op.gt]: new Date() }
                }
            });

            if (!session) return null;

            // Update last activity
            await session.update({
                last_activity: new Date()
            });

            return session;
        } catch (error) {
            LoggingService.logError(error);
            return null;
        }
    }

    async invalidateSession(token) {
        return await UserSession.destroy({
            where: { session_token: token }
        });
    }

    async invalidateAllUserSessions(userId) {
        return await UserSession.destroy({
            where: { user_id: userId }
        });
    }

    async cleanupExpiredSessions() {
        return await UserSession.destroy({
            where: {
                expiry: { [Op.lt]: new Date() }
            }
        });
    }

    async getUserActiveSessions(userId) {
        return await UserSession.findAll({
            where: {
                user_id: userId,
                expiry: { [Op.gt]: new Date() }
            },
            order: [['last_activity', 'DESC']]
        });
    }
}

module.exports = new SessionService();