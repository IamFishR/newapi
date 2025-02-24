const SessionService = require('../services/user/SessionService');
const RoleService = require('../services/user/RoleService');
const LoggingService = require('../services/monitoring/LoggingService');

const auth = {
    // Middleware to check if user is authenticated
    isAuthenticated: async (req, res, next) => {
        try {
            let token = req.cookies.session_token;
            
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

            req.user = { id: session.user_id };
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