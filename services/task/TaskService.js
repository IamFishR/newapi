const { 
    Task, User, Sprint, Project, TaskType, TaskPriority, 
    TaskComment, TaskAttachment, TaskTimeLog, TaskLabel,
    TaskStatusHistory, TaskAssignmentHistory, TaskMetrics,
    sequelize
} = require('../../models');
const { Op } = require('sequelize');
const LoggingService = require('../monitoring/LoggingService');

class TaskService {
    async createTask(data, userId) {
        const transaction = await sequelize.transaction();
        try {
            // Set creator and reporter
            data.created_by = userId;
            data.reporter = data.reporter || userId;

            const task = await Task.create(data, { transaction });

            // Initialize task metrics
            await TaskMetrics.create({
                task_id: task.id
            }, { transaction });

            // Log task creation in audit
            await this.createAuditLog('CREATE', task.id, null, task.toJSON(), userId, transaction);

            // Create initial status history
            await TaskStatusHistory.create({
                task_id: task.id,
                new_status: task.status,
                changed_by: userId
            }, { transaction });

            // If task is assigned, create assignment history
            if (task.assigned_to) {
                await TaskAssignmentHistory.create({
                    task_id: task.id,
                    new_assignee: task.assigned_to,
                    changed_by: userId
                }, { transaction });
            }

            await transaction.commit();
            return this.getTask(task.id);
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Create task' });
            throw error;
        }
    }

    async getTask(id) {
        const task = await Task.findByPk(id, {
            include: [
                {
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'name', 'code']
                },
                {
                    model: Sprint,
                    as: 'sprint',
                    attributes: ['id', 'name']
                },
                {
                    model: Task,
                    as: 'parentTask',
                    attributes: ['id', 'title']
                },
                {
                    model: TaskType,
                    as: 'type'
                },
                {
                    model: TaskPriority,
                    as: 'priority'
                },
                {
                    model: User,
                    as: 'assignee',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: User,
                    as: 'reportedBy',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: TaskLabel,
                    as: 'labels',
                    through: { attributes: [] }
                },
                {
                    model: User,
                    as: 'watchers',
                    attributes: ['id', 'username', 'email'],
                    through: { attributes: [] }
                },
                {
                    model: TaskMetrics,
                    as: 'metrics'
                }
            ]
        });

        if (!task) {
            throw new Error('Task not found');
        }
        return task;
    }

    async updateTask(id, data, userId) {
        const transaction = await sequelize.transaction();
        try {
            const task = await Task.findByPk(id);
            if (!task) {
                throw new Error('Task not found');
            }

            const oldData = task.toJSON();
            
            // Track status change
            if (data.status && data.status !== task.status) {
                await TaskStatusHistory.create({
                    task_id: id,
                    old_status: task.status,
                    new_status: data.status,
                    changed_by: userId
                }, { transaction });

                // Update metrics
                await this.updateTaskMetrics(id, oldData.status, data.status, transaction);
            }

            // Track assignment change
            if (data.assigned_to !== undefined && data.assigned_to !== task.assigned_to) {
                await TaskAssignmentHistory.create({
                    task_id: id,
                    old_assignee: task.assigned_to,
                    new_assignee: data.assigned_to,
                    changed_by: userId
                }, { transaction });
            }

            await task.update(data, { transaction });

            // Log task update in audit
            await this.createAuditLog('UPDATE', id, oldData, task.toJSON(), userId, transaction);

            await transaction.commit();
            return this.getTask(id);
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Update task' });
            throw error;
        }
    }

    async deleteTask(id, userId) {
        const transaction = await sequelize.transaction();
        try {
            const task = await Task.findByPk(id);
            if (!task) {
                throw new Error('Task not found');
            }

            // Log task deletion in audit
            await this.createAuditLog('DELETE', id, task.toJSON(), null, userId, transaction);

            await task.destroy({ transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Delete task' });
            throw error;
        }
    }

    async listTasks(query = {}) {
        const { 
            page = 1, 
            limit = 10, 
            project_id, 
            sprint_id,
            assigned_to,
            status,
            type_id,
            priority_id,
            search 
        } = query;
        const offset = (page - 1) * limit;

        const where = {};
        if (project_id) where.project_id = project_id;
        if (sprint_id) where.sprint_id = sprint_id;
        if (assigned_to) where.assigned_to = assigned_to;
        if (status) where.status = status;
        if (type_id) where.type_id = type_id;
        if (priority_id) where.priority_id = priority_id;
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        return await Task.findAndCountAll({
            where,
            include: [
                {
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'name', 'code']
                },
                {
                    model: Sprint,
                    as: 'sprint',
                    attributes: ['id', 'name']
                },
                {
                    model: TaskType,
                    as: 'type'
                },
                {
                    model: TaskPriority,
                    as: 'priority'
                },
                {
                    model: User,
                    as: 'assignee',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: TaskLabel,
                    as: 'labels',
                    through: { attributes: [] }
                }
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
    }

    async addComment(taskId, content, userId) {
        const transaction = await sequelize.transaction();
        try {
            const comment = await TaskComment.create({
                task_id: taskId,
                content,
                created_by: userId
            }, { transaction });

            // Update metrics
            await this.updateCommentMetrics(taskId, transaction);

            await transaction.commit();
            return comment;
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Add comment' });
            throw error;
        }
    }

    async addAttachment(taskId, fileData, userId) {
        const transaction = await sequelize.transaction();
        try {
            const attachment = await TaskAttachment.create({
                task_id: taskId,
                ...fileData,
                created_by: userId
            }, { transaction });

            // Update metrics
            await this.updateAttachmentMetrics(taskId, transaction);

            await transaction.commit();
            return attachment;
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Add attachment' });
            throw error;
        }
    }

    async logTime(taskId, timeData, userId) {
        const transaction = await sequelize.transaction();
        try {
            const timeLog = await TaskTimeLog.create({
                task_id: taskId,
                user_id: userId,
                ...timeData
            }, { transaction });

            // Update actual hours in task
            const totalHours = await TaskTimeLog.sum('hours_spent', {
                where: { task_id: taskId }
            });

            await Task.update({ 
                actual_hours: totalHours 
            }, { 
                where: { id: taskId },
                transaction 
            });

            await transaction.commit();
            return timeLog;
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Log time' });
            throw error;
        }
    }

    async addLabel(taskId, labelId, userId) {
        const transaction = await sequelize.transaction();
        try {
            const task = await Task.findByPk(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            await task.addLabel(labelId, { transaction });

            // Log label addition in audit
            await this.createAuditLog('ADD_LABEL', taskId, null, { labelId }, userId, transaction);

            await transaction.commit();
            return this.getTask(taskId);
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Add label' });
            throw error;
        }
    }

    async removeLabel(taskId, labelId, userId) {
        const transaction = await sequelize.transaction();
        try {
            const task = await Task.findByPk(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            await task.removeLabel(labelId, { transaction });

            // Log label removal in audit
            await this.createAuditLog('REMOVE_LABEL', taskId, { labelId }, null, userId, transaction);

            await transaction.commit();
            return this.getTask(taskId);
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Remove label' });
            throw error;
        }
    }

    async addWatcher(taskId, watcherId, userId) {
        const transaction = await sequelize.transaction();
        try {
            const task = await Task.findByPk(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            await task.addWatcher(watcherId, { transaction });

            // Log watcher addition in audit
            await this.createAuditLog('ADD_WATCHER', taskId, null, { watcherId }, userId, transaction);

            await transaction.commit();
            return this.getTask(taskId);
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Add watcher' });
            throw error;
        }
    }

    async removeWatcher(taskId, watcherId, userId) {
        const transaction = await sequelize.transaction();
        try {
            const task = await Task.findByPk(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            await task.removeWatcher(watcherId, { transaction });

            // Log watcher removal in audit
            await this.createAuditLog('REMOVE_WATCHER', taskId, { watcherId }, null, userId, transaction);

            await transaction.commit();
            return this.getTask(taskId);
        } catch (error) {
            await transaction.rollback();
            LoggingService.logError(error, { context: 'Remove watcher' });
            throw error;
        }
    }

    async getTaskHistory(taskId) {
        return {
            statusHistory: await TaskStatusHistory.findAll({
                where: { task_id: taskId },
                include: [{
                    model: User,
                    as: 'changer',
                    attributes: ['id', 'username', 'email']
                }],
                order: [['changed_at', 'DESC']]
            }),
            assignmentHistory: await TaskAssignmentHistory.findAll({
                where: { task_id: taskId },
                include: [
                    {
                        model: User,
                        as: 'previousAssignee',
                        attributes: ['id', 'username', 'email']
                    },
                    {
                        model: User,
                        as: 'newAssignee',
                        attributes: ['id', 'username', 'email']
                    },
                    {
                        model: User,
                        as: 'changer',
                        attributes: ['id', 'username', 'email']
                    }
                ],
                order: [['changed_at', 'DESC']]
            })
        };
    }

    async getTaskMetrics(taskId) {
        const metrics = await TaskMetrics.findOne({
            where: { task_id: taskId }
        });

        if (!metrics) {
            throw new Error('Task metrics not found');
        }

        return metrics;
    }

    async updateTaskMetrics(taskId, oldStatus, newStatus, transaction) {
        const metrics = await TaskMetrics.findOne({
            where: { task_id: taskId },
            transaction
        });

        if (!metrics) return;

        // Calculate time spent in previous status
        const now = new Date();
        const timeInStatus = now - metrics.last_updated;

        // Update time in respective status
        const updates = {};
        switch (oldStatus) {
            case 'todo':
                updates.time_in_todo = metrics.time_in_todo + timeInStatus;
                break;
            case 'in_progress':
                updates.time_in_progress = metrics.time_in_progress + timeInStatus;
                break;
            case 'in_review':
                updates.time_in_review = metrics.time_in_review + timeInStatus;
                break;
        }

        if (newStatus === 'done') {
            updates.cycle_time = 
                metrics.time_in_progress + 
                metrics.time_in_review + 
                (oldStatus === 'in_progress' ? timeInStatus : 0);
            updates.lead_time = 
                metrics.time_in_todo + 
                metrics.time_in_progress + 
                metrics.time_in_review + 
                timeInStatus;
        }

        await metrics.update(updates, { transaction });
    }

    async updateCommentMetrics(taskId, transaction) {
        const commentCount = await TaskComment.count({
            where: { task_id: taskId },
            transaction
        });

        await TaskMetrics.update(
            { number_of_comments: commentCount },
            { 
                where: { task_id: taskId },
                transaction
            }
        );
    }

    async updateAttachmentMetrics(taskId, transaction) {
        const attachmentCount = await TaskAttachment.count({
            where: { task_id: taskId },
            transaction
        });

        await TaskMetrics.update(
            { number_of_attachments: attachmentCount },
            { 
                where: { task_id: taskId },
                transaction
            }
        );
    }

    async createAuditLog(action, taskId, oldValues, newValues, userId, transaction) {
        await sequelize.models.TaskAuditLog.create({
            entity_type: 'task',
            entity_id: taskId.toString(),
            action,
            old_values: oldValues,
            new_values: newValues,
            created_by: userId
        }, { transaction });
    }
}

module.exports = new TaskService();