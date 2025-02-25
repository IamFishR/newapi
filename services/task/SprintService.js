const { Sprint, Task, User, sequelize } = require('../../models');
const { Op } = require('sequelize');
const LoggingService = require('../monitoring/LoggingService');

class SprintService {
    async createSprint(data, userId) {
        const transaction = await sequelize.transaction();
        try {
            data.created_by = userId;
            const sprint = await Sprint.create(data, { transaction });

            // Log sprint creation in audit
            await this.createAuditLog('CREATE', sprint.id, null, sprint.toJSON(), userId, transaction);

            await transaction.commit();
            return this.getSprint(sprint.id);
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Create sprint' });
            throw error;
        }
    }

    async getSprint(id) {
        const sprint = await Sprint.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: Task,
                    as: 'tasks',
                    include: [
                        {
                            model: User,
                            as: 'assignee',
                            attributes: ['id', 'username', 'email']
                        }
                    ]
                }
            ]
        });

        if (!sprint) {
            throw new Error('Sprint not found');
        }
        return sprint;
    }

    async updateSprint(id, data, userId) {
        const transaction = await sequelize.transaction();
        try {
            const sprint = await Sprint.findByPk(id);
            if (!sprint) {
                throw new Error('Sprint not found');
            }

            const oldData = sprint.toJSON();
            await sprint.update(data, { transaction });

            // Log sprint update in audit
            await this.createAuditLog('UPDATE', id, oldData, sprint.toJSON(), userId, transaction);

            await transaction.commit();
            return this.getSprint(id);
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Update sprint' });
            throw error;
        }
    }

    async deleteSprint(id, userId) {
        const transaction = await sequelize.transaction();
        try {
            const sprint = await Sprint.findByPk(id);
            if (!sprint) {
                throw new Error('Sprint not found');
            }

            // Log sprint deletion in audit
            await this.createAuditLog('DELETE', id, sprint.toJSON(), null, userId, transaction);

            await sprint.destroy({ transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Delete sprint' });
            throw error;
        }
    }

    async listSprints(projectId, query = {}) {
        const { page = 1, limit = 10, status } = query;
        const offset = (page - 1) * limit;

        const where = { project_id: projectId };
        if (status) where.status = status;

        return await Sprint.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: Task,
                    as: 'tasks',
                    separate: true,
                    include: [
                        {
                            model: User,
                            as: 'assignee',
                            attributes: ['id', 'username', 'email']
                        }
                    ]
                }
            ],
            limit,
            offset,
            order: [['start_date', 'DESC']]
        });
    }

    async getSprintMetrics(sprintId) {
        const sprint = await Sprint.findByPk(sprintId, {
            include: [
                {
                    model: Task,
                    as: 'tasks',
                    attributes: ['status', 'estimated_hours', 'actual_hours']
                }
            ]
        });

        if (!sprint) {
            throw new Error('Sprint not found');
        }

        const tasks = sprint.tasks || [];
        return {
            totalTasks: tasks.length,
            tasksByStatus: tasks.reduce((acc, task) => {
                acc[task.status] = (acc[task.status] || 0) + 1;
                return acc;
            }, {}),
            completedTasks: tasks.filter(task => task.status === 'done').length,
            estimatedHours: tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0),
            actualHours: tasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0),
            progress: tasks.length > 0 
                ? (tasks.filter(task => task.status === 'done').length / tasks.length) * 100 
                : 0
        };
    }

    async createAuditLog(action, sprintId, oldValues, newValues, userId, transaction) {
        await sequelize.models.TaskAuditLog.create({
            entity_type: 'sprint',
            entity_id: sprintId.toString(),
            action,
            old_values: oldValues,
            new_values: newValues,
            created_by: userId
        }, { transaction });
    }
}

module.exports = new SprintService();