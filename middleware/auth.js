const SessionService = require('../services/user/SessionService');
const RoleService = require('../services/user/RoleService');

const auth = {
    // Middleware to check if user is authenticated
    isAuthenticated: async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1] || 
                         req.cookies.session_token;

            if (!token) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            const session = await SessionService.validateSession(token);
            if (!session) {
                return res.status(401).json({ message: 'Invalid or expired session' });
            }

            req.user = { id: session.user_id };
            next();
        } catch (error) {
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
            res.status(403).json({ message: 'Permission verification failed' });
        }
    }
};

module.exports = auth;