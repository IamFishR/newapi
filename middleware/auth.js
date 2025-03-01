const SessionService = require('../services/user/SessionService');
const RoleService = require('../services/user/RoleService');
const LoggingService = require('../services/monitoring/LoggingService');
const UserService = require('../services/user/UserService');

const auth = {
    // Middleware to check if user is authenticated
    isAuthenticated: async (req, res, next) => {
        try {
            let token = req.cookies.exapis_session;
            
            // Check Authorization header if no cookie
            if (!token && req.headers.authorization) {
                const parts = req.headers.authorization.split(' ');
                if (parts.length === 2 && parts[0] === 'Bearer') {
                    token = parts[1];
                }
            }

            if (!token) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            // Clean the token
            token = token.trim();
            
            const session = await SessionService.validateSession(token);
            if (!session) {
                return res.status(401).json({ message: 'Invalid or expired session' });
            }

            // Fetch complete user information
            const user = await UserService.getUser(session.user_id);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Add user information to request
            req.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                lastActivity: session.last_activity,
                sessionId: session.id
            };
            
            next();
        } catch (error) {
            LoggingService.logError(error, { 
                context: 'Authentication middleware',
                path: req.path
            });
            res.status(401).json({ message: 'Authentication failed' });
        }
    },

    // Middleware to check if user has specific role
    hasRole: (roleName) => async (req, res, next) => {
        try {
            const hasRole = await RoleService.isUserInRole(req.user.id, roleName);
            if (!hasRole) {
                return res.status(403).json({ message: 'Insufficient role permissions' });
            }
            next();
        } catch (error) {
            LoggingService.logError(error, { 
                context: 'Role verification',
                role: roleName,
                userId: req.user?.id
            });
            res.status(403).json({ message: 'Role verification failed' });
        }
    },

    // Middleware to check if user has specific permission
    hasPermission: (permissionName) => async (req, res, next) => {
        try {
            const hasPermission = await RoleService.checkUserPermission(req.user.id, permissionName);
            if (!hasPermission) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }
            next();
        } catch (error) {
            LoggingService.logError(error, { 
                context: 'Permission verification',
                permission: permissionName,
                userId: req.user?.id
            });
            res.status(403).json({ message: 'Permission verification failed' });
        }
    }
};

module.exports = auth;