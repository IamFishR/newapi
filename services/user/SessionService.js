const { UserSession } = require('../../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const LoggingService = require('../monitoring/LoggingService');

class SessionService {
    async createSession(userId, deviceInfo = {}, ipAddress = null) {
        try {
            // Generate the session token first
            const sessionData = {
                type: 'session',
                userId: userId,
                deviceInfo: deviceInfo?.userAgent || 'unknown',
                createdAt: new Date().toISOString()
            };

            const sessionToken = jwt.sign(
                sessionData,
                process.env.JWT_SECRET || 'your-secret-key',
                {
                    expiresIn: '7d',
                    algorithm: 'HS256'
                }
            );
            LoggingService.logDebug('Session token created', { userId, sessionToken });
            // Create session with token already set
            const session = await UserSession.create({
                user_id: userId,
                device_info: deviceInfo,
                session_token: sessionToken, // Set token during creation
                ip_address: ipAddress,
                last_activity: new Date(),
                expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            });
            LoggingService.logDebug('from db', {
                session_token: session.session_token,
                expiry: session.expiry
            });
            return session;
        } catch (error) {
            LoggingService.logError(error, { 
                context: 'Session creation failed',
                userId,
                errors
            });
            throw new Error('Failed to create session');
        }
    }

    async validateSession(token) {
        try {
            if (!token || typeof token !== 'string') {
                return null;
            }

            // First verify JWT structure and signature
            let decoded;
            try {
                decoded = jwt.verify(token.trim(), process.env.JWT_SECRET || 'your-secret-key', {
                    algorithms: ['HS256']
                });
            } catch (jwtError) {
                LoggingService.logError(jwtError, { 
                    context: 'JWT verification',
                    token_length: token.length,
                    error_type: jwtError.name
                });
                return null;
            }

            // Verify this is a session token
            if (decoded.type !== 'session') {
                LoggingService.logError('Invalid token type', { 
                    context: 'Session validation',
                    expected: 'session',
                    received: decoded.type
                });
                return null;
            }

            // Then check if session exists in database and is valid
            const session = await UserSession.findOne({
                where: {
                    // id: decoded.sessionId,
                    user_id: decoded.userId,
                    session_token: token,
                    expiry: { [Op.gt]: new Date() }
                }
            });

            if (!session) {
                return null;
            }

            // Update last activity
            await session.update({ last_activity: new Date() });
            return session;

        } catch (error) {
            LoggingService.logError(error, { context: 'Session validation' });
            return null;
        }
    }

    async invalidateSession(token) {
        if (!token) return;
        
        try {
            const session = await UserSession.findOne({
                where: { session_token: token }
            });
            
            if (session) {
                await session.update({
                    session_token: '',
                    expiry: new Date()
                });
            }
        } catch (error) {
            LoggingService.logError(error, { context: 'Session invalidation' });
            throw error;
        }
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