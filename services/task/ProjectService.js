const { Project, User, Sprint, Task, TaskLabel, sequelize } = require('../../models');
const { Op } = require('sequelize');
const LoggingService = require('../monitoring/LoggingService');

class ProjectService {
    async createProject(data, userId) {
        const transaction = await sequelize.transaction();
        try {
            data.created_by = userId;
            const project = await Project.create(data, { transaction });

            // Add creator as project owner
            await project.addMember(userId, {
                through: { role: 'owner' },
                transaction
            });

            await transaction.commit();
            return this.getProject(project.id);
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Create project' });
            throw error;
        }
    }

    async getProject(id, includeMembers = true) {
        const include = [
            {
                model: User,
                as: 'creator',
                attributes: ['id', 'username', 'email']
            }
        ];

        if (includeMembers) {
            include.push({
                model: User,
                as: 'members',
                attributes: ['id', 'username', 'email'],
                through: { attributes: ['role'] }
            });
        }

        const project = await Project.findByPk(id, { include });
        if (!project) {
            throw new Error('Project not found');
        }
        return project;
    }

    async updateProject(id, data, userId) {
        const transaction = await sequelize.transaction();
        try {
            const project = await this.getProject(id, false);
            const oldData = project.toJSON();
            
            await project.update(data, { transaction });

            // Log the update in audit
            await this.createAuditLog('UPDATE', id, oldData, project.toJSON(), userId, transaction);

            await transaction.commit();
            return this.getProject(id);
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Update project' });
            throw error;
        }
    }

    async deleteProject(id, userId) {
        const transaction = await sequelize.transaction();
        try {
            const project = await this.getProject(id, false);
            
            // Log deletion in audit
            await this.createAuditLog('DELETE', id, project.toJSON(), null, userId, transaction);

            await project.destroy({ transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Delete project' });
            throw error;
        }
    }

    async listProjects(query = {}) {
        const { page = 1, limit = 10, status, search } = query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { code: { [Op.like]: `%${search}%` } }
            ];
        }

        return await Project.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: User,
                    as: 'members',
                    attributes: ['id', 'username', 'email'],
                    through: { attributes: ['role'] }
                }
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
    }

    async addProjectMember(projectId, userId, role, addedBy) {
        const transaction = await sequelize.transaction();
        try {
            const project = await this.getProject(projectId, false);
            await project.addMember(userId, {
                through: { role },
                transaction
            });

            // Log member addition in audit
            await this.createAuditLog('ADD_MEMBER', projectId, null, { userId, role }, addedBy, transaction);

            await transaction.commit();
            return this.getProject(projectId);
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Add project member' });
            throw error;
        }
    }

    async removeProjectMember(projectId, userId, removedBy) {
        const transaction = await sequelize.transaction();
        try {
            const project = await this.getProject(projectId, false);
            await project.removeMember(userId, { transaction });

            // Log member removal in audit
            await this.createAuditLog('REMOVE_MEMBER', projectId, { userId }, null, removedBy, transaction);

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Remove project member' });
            throw error;
        }
    }

    async updateProjectMemberRole(projectId, userId, newRole, updatedBy) {
        const transaction = await sequelize.transaction();
        try {
            const project = await this.getProject(projectId, false);
            const memberRole = await project.getMember(userId, { through: { attributes: ['role'] } });
            
            if (!memberRole) {
                throw new Error('User is not a member of this project');
            }

            const oldRole = memberRole.project_members.role;
            await project.setMembers(userId, {
                through: { role: newRole },
                transaction
            });

            // Log role update in audit
            await this.createAuditLog('UPDATE_MEMBER_ROLE', projectId, 
                { userId, oldRole }, 
                { userId, newRole }, 
                updatedBy, 
                transaction
            );

            await transaction.commit();
            return this.getProject(projectId);
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Update project member role' });
            throw error;
        }
    }

    async getProjectMetrics(projectId) {
        try {
            const project = await Project.findByPk(projectId, {
                include: [
                    {
                        model: Task,
                        as: 'tasks',
                        attributes: ['status', 'estimated_hours', 'actual_hours']
                    },
                    {
                        model: Sprint,
                        as: 'sprints',
                        attributes: ['status']
                    }
                ]
            });

            if (!project) {
                throw new Error('Project not found');
            }

            const tasks = project.tasks || [];
            const sprints = project.sprints || [];

            return {
                totalTasks: tasks.length,
                tasksByStatus: tasks.reduce((acc, task) => {
                    acc[task.status] = (acc[task.status] || 0) + 1;
                    return acc;
                }, {}),
                completedTasks: tasks.filter(task => task.status === 'done').length,
                totalSprints: sprints.length,
                activeSprints: sprints.filter(sprint => sprint.status === 'active').length,
                estimatedHours: tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0),
                actualHours: tasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0)
            };
        } catch (error) {
            LoggingService.logError(error, { context: 'getProjectMetrics', projectId });
            throw error;
        }
    }

    async createAuditLog(action, projectId, oldValues, newValues, userId, transaction) {
        await sequelize.models.TaskAuditLog.create({
            entity_type: 'project',
            entity_id: projectId.toString(),
            action,
            old_values: oldValues,
            new_values: newValues,
            created_by: userId
        }, { transaction });
    }
}

module.exports = new ProjectService();