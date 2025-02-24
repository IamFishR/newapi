const { Role, Permission, User } = require('../../models');

class RoleService {
    // Role Management
    async createRole(roleName) {
        return await Role.create({ role_name: roleName });
    }

    async assignRoleToUser(userId, roleId) {
        const user = await User.findByPk(userId);
        const role = await Role.findByPk(roleId);
        if (!user || !role) throw new Error('User or Role not found');
        return await user.addRole(role);
    }

    async removeRoleFromUser(userId, roleId) {
        const user = await User.findByPk(userId);
        const role = await Role.findByPk(roleId);
        if (!user || !role) throw new Error('User or Role not found');
        return await user.removeRole(role);
    }

    async getUserRoles(userId) {
        const user = await User.findByPk(userId, {
            include: [{ model: Role }]
        });
        return user ? user.Roles : [];
    }

    // Permission Management
    async addPermissionToRole(roleId, permissionId) {
        const role = await Role.findByPk(roleId);
        const permission = await Permission.findByPk(permissionId);
        if (!role || !permission) throw new Error('Role or Permission not found');
        return await role.addPermission(permission);
    }

    async removePermissionFromRole(roleId, permissionId) {
        const role = await Role.findByPk(roleId);
        const permission = await Permission.findByPk(permissionId);
        if (!role || !permission) throw new Error('Role or Permission not found');
        return await role.removePermission(permission);
    }

    async getRolePermissions(roleId) {
        const role = await Role.findByPk(roleId, {
            include: [{ model: Permission }]
        });
        return role ? role.Permissions : [];
    }

    // Direct User Permissions
    async addDirectPermissionToUser(userId, permissionId) {
        const user = await User.findByPk(userId);
        const permission = await Permission.findByPk(permissionId);
        if (!user || !permission) throw new Error('User or Permission not found');
        return await user.addPermission(permission);
    }

    async removeDirectPermissionFromUser(userId, permissionId) {
        const user = await User.findByPk(userId);
        const permission = await Permission.findByPk(permissionId);
        if (!user || !permission) throw new Error('User or Permission not found');
        return await user.removePermission(permission);
    }

    async getUserPermissions(userId) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User not found');

        // Get direct permissions
        const directPermissions = await user.getPermissions();
        
        // Get role-based permissions
        const roles = await user.getRoles({
            include: [{ model: Permission }]
        });
        
        const rolePermissions = roles.flatMap(role => role.Permissions);

        // Combine and deduplicate permissions
        const allPermissions = [...directPermissions, ...rolePermissions];
        const uniquePermissions = [...new Map(allPermissions.map(item => 
            [item.id, item])).values()];

        return uniquePermissions;
    }

    // Helper Methods
    async checkUserPermission(userId, permissionName) {
        const permissions = await this.getUserPermissions(userId);
        return permissions.some(p => p.permission_name === permissionName);
    }

    async isUserInRole(userId, roleName) {
        const roles = await this.getUserRoles(userId);
        return roles.some(r => r.role_name === roleName);
    }
}

module.exports = new RoleService();