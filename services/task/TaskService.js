const { sequelize } = require('../../config/sequelize');
const { Op } = require('sequelize');
const { Task, Project, Sprint, User, TaskType, TaskPriority, TaskLabel } = require('../../models');
const ValidationError = require('../../utils/ValidationError');

class TaskService {
  async listTasks(options) {
    try {
      const { page = 1, pageSize = 10, status, project_id, assigned_to, ...otherOptions } = options;
      const offset = (page - 1) * pageSize;

      const queryOptions = {
        where: {},
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: Sprint,
            as: 'sprint',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'username', 'email'],
            required: false
          },
          {
            model: TaskType,
            as: 'type',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: TaskPriority,
            as: 'priority',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: User,
            as: 'watchers',
            attributes: ['id', 'username', 'email'],
            through: {
              attributes: ['added_at']
            },
            required: false
          }
        ],
        limit: parseInt(pageSize),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        distinct: true
      };

      if (status) queryOptions.where.status = status;
      if (project_id) queryOptions.where.project_id = project_id;
      if (assigned_to) queryOptions.where.assigned_to = assigned_to;

      Object.keys(otherOptions).forEach(key => {
        if (otherOptions[key] !== undefined) {
          const columnName = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`); // convert camelCase to snake_case
          queryOptions.where[columnName] = otherOptions[key];
        }
      });

      const { count, rows } = await Task.findAndCountAll(queryOptions);

      const totalPages = Math.ceil(count / pageSize);

      return {
        rows,
        count,
        pagination: {
          currentPage: parseInt(page),
          pageSize: parseInt(pageSize),
          totalItems: count,
          totalPages: totalPages,
        },
      };
    } catch (error) {
      console.error('Error in TaskService.listTasks:', error);
      throw error;
    }
  }

  async createTask(data, userId) {
    const transaction = await sequelize.transaction();
    try {
      // Validate and convert priority name to ID
      if (data.priority && !data.priority_id) {
        const priority = await TaskPriority.findOne({
          where: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('name')),
            sequelize.fn('LOWER', data.priority)
          ),
          attributes: ['id', 'name']
        });
        if (!priority) {
          throw new ValidationError('Invalid priority. Please select from: Critical, High, Medium, Low');
        }
        data.priority_id = priority.id;
      }

      // Validate and convert or use default task type
      if (!data.type_id) {
        if (data.type) {
          const taskType = await TaskType.findOne({
            where: sequelize.where(
              sequelize.fn('LOWER', sequelize.col('name')),
              sequelize.fn('LOWER', data.type)
            ),
            attributes: ['id', 'name']
          });
          if (!taskType) {
            throw new ValidationError('Invalid task type. Please select from: Task, Bug, Feature, Epic, Story');
          }
          data.type_id = taskType.id;
        } else {
          const defaultType = await TaskType.findOne({
            where: { name: 'Task' },
            attributes: ['id']
          });
          if (!defaultType) {
            throw new ValidationError('Default task type not found. Please specify a task type.');
          }
          data.type_id = defaultType.id;
        }
      }

      // Set required fields and defaults
      data.created_by = userId;
      data.reporter = userId;
      // Set assignee as creator if not specified
      if (!data.assigned_to) {
        data.assigned_to = userId;
      }

      const task = await Task.create(data, { transaction });
      await this.createAuditLog('CREATE', task.id, null, task.toJSON(), userId, transaction);
      await transaction.commit();
      return this.getTask(task.id);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in TaskService.createTask:', error);
      throw error;
    }
  }

  async getTask(id) {
    return await Task.findByPk(id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: Sprint,
          as: 'sprint',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'username', 'email']
        },
        {
          model: TaskType,
          as: 'type',
          attributes: ['id', 'name']
        },
        {
          model: TaskPriority,
          as: 'priority',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'watchers',
          attributes: ['id', 'username', 'email'],
          through: {
            attributes: ['added_at']
          }
        }
      ]
    });
  }

  async updateTask(id, data, userId) {
    // Implementation for updateTask
    const transaction = await sequelize.transaction();
    try {
      const task = await Task.findByPk(id);
      if (!task) {
        throw new ValidationError('Task not found');
      }

      // Validate and convert priority name to ID
      if (data.priority && !data.priority_id) {
        const priority = await TaskPriority.findOne({
          where: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('name')),
            sequelize.fn('LOWER', data.priority)
          ),
          attributes: ['id', 'name']
        });
        if (!priority) {
          throw new ValidationError('Invalid priority. Please select from: Critical, High, Medium, Low');
        }
        data.priority_id = priority.id;
      }

      // Validate and convert or use default task type
      if (!data.type_id) {
        if (data.type) {
          const taskType = await TaskType.findOne({
            where: sequelize.where(
              sequelize.fn('LOWER', sequelize.col('name')),
              sequelize.fn('LOWER', data.type)
            ),
            attributes: ['id', 'name']
          });
          if (!taskType) {
            throw new ValidationError('Invalid task type. Please select from: Task, Bug, Feature, Epic, Story');
          }
          data.type_id = taskType.id;
        } else {
          const defaultType = await TaskType.findOne({
            where: { name: 'Task' },
            attributes: ['id']
          });
          if (!defaultType) {
            throw new ValidationError('Default task type not found. Please specify a task type.');
          }
          data.type_id = defaultType.id;
        }
      }

      // Update the task
      await task.update(data, { transaction });

      await this.createAuditLog('UPDATE', id, task.toJSON(), data, userId, transaction);
      await transaction.commit();
      return this.getTask(id);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in TaskService.updateTask:', error);
      throw error;
    }
  }

  async deleteTask(id, userId) {
    const transaction = await sequelize.transaction();
    try {
      const task = await Task.findByPk(id);
      if (!task) {
        throw new ValidationError('Task not found');
      }

      // Log the deletion in the audit log
      await this.createAuditLog('DELETE', id, task.toJSON(), null, userId, transaction);

      // Delete the task
      await task.destroy({ transaction });

      await transaction.commit();
      return { message: 'Task deleted successfully' };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in TaskService.deleteTask:', error);
      throw error;
    }
  }

  async addComment(taskId, content, userId) {
    const transaction = await sequelize.transaction();
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new ValidationError('Task not found');
      }

      // Add the comment
      const comment = await task.createComment({
        content,
        created_by: userId
      }, { transaction });

      // Log the addition of the comment in the audit log
      await this.createAuditLog('ADD_COMMENT', taskId, null, { content }, userId, transaction);

      await transaction.commit();
      return comment;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in TaskService.addComment:', error);
      throw error;
    }
  }

  async addAttachment(taskId, fileData, userId) {
    const transaction = await sequelize.transaction();
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new ValidationError('Task not found');
      }

      // Add the attachment
      const attachment = await task.createAttachment({
        file_name: fileData.fileName,
        file_path: fileData.filePath,
        uploaded_by: userId
      }, { transaction });

      // Log the addition of the attachment in the audit log
      await this.createAuditLog('ADD_ATTACHMENT', taskId, null, { fileName: fileData.fileName }, userId, transaction);

      await transaction.commit();
      return attachment;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in TaskService.addAttachment:', error);
      throw error;
    }
  }

  async logTime(taskId, timeData, userId) {
    const transaction = await sequelize.transaction();
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new ValidationError('Task not found');
      }

      // Log the time entry
      const timeEntry = await task.createTimeLog({
        hours: timeData.hours,
        description: timeData.description,
        logged_by: userId
      }, { transaction });

      // Log the addition of the time entry in the audit log
      await this.createAuditLog('LOG_TIME', taskId, null, timeData, userId, transaction);

      await transaction.commit();
      return timeEntry;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in TaskService.logTime:', error);
      throw error;
    }
  }

  async addLabel(taskId, labelId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new ValidationError('Task not found');
      }

      // Add the label to the task
      await task.addLabel(labelId, { transaction });

      // Log the addition of the label in the audit log
      await this.createAuditLog('ADD_LABEL', taskId, null, { labelId }, userId, transaction);

      await transaction.commit();
      return { message: 'Label added successfully' };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in TaskService.addLabel:', error);
      throw error;
    }
  }

  async removeLabel(taskId, labelId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new ValidationError('Task not found');
      }

      // Remove the label from the task
      await task.removeLabel(labelId, { transaction });

      // Log the removal of the label in the audit log
      await this.createAuditLog('REMOVE_LABEL', taskId, null, { labelId }, userId, transaction);

      await transaction.commit();
      return { message: 'Label removed successfully' };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in TaskService.removeLabel:', error);
      throw error;
    }
  }

  async addWatcher(taskId, watcherId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new ValidationError('Task not found');
      }

      // Add the watcher to the task
      await task.addWatcher(watcherId, { transaction });

      // Log the addition of the watcher in the audit log
      await this.createAuditLog('ADD_WATCHER', taskId, null, { watcherId }, userId, transaction);

      await transaction.commit();
      return { message: 'Watcher added successfully' };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in TaskService.addWatcher:', error);
      throw error;
    }
  }

  async removeWatcher(taskId, watcherId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new ValidationError('Task not found');
      }

      // Remove the watcher from the task
      await task.removeWatcher(watcherId, { transaction });

      // Log the removal of the watcher in the audit log
      await this.createAuditLog('REMOVE_WATCHER', taskId, null, { watcherId }, userId, transaction);

      await transaction.commit();
      return { message: 'Watcher removed successfully' };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in TaskService.removeWatcher:', error);
      throw error;
    }
  }

  async getTaskHistory(taskId) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          {
            model: AuditLog,
            as: 'auditLogs',
            attributes: ['action', 'old_values', 'new_values', 'created_at', 'created_by'],
            order: [['created_at', 'DESC']]
          }
        ]
      });

      if (!task) {
        throw new ValidationError('Task not found');
      }

      return task.auditLogs;
    } catch (error) {
      console.error('Error in TaskService.getTaskHistory:', error);
      throw error;
    }
  }

  async getTaskMetrics(taskId) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          {
            model: TimeLog,
            as: 'timeLogs',
            attributes: ['hours']
          },
          {
            model: Comment,
            as: 'comments',
            attributes: ['id']
          },
          {
            model: Attachment,
            as: 'attachments',
            attributes: ['id']
          }
        ]
      });

      if (!task) {
        throw new ValidationError('Task not found');
      }

      const totalHours = task.timeLogs.reduce((sum, log) => sum + log.hours, 0);
      const totalComments = task.comments.length;
      const totalAttachments = task.attachments.length;

      return {
        totalHours,
        totalComments,
        totalAttachments
      };
    } catch (error) {
      console.error('Error in TaskService.getTaskMetrics:', error);
      throw error;
    }
  }

  async updateTaskMetrics(taskId, oldStatus, newStatus, transaction) {
    try {
      const task = await Task.findByPk(taskId, { transaction });
      if (!task) {
        throw new ValidationError('Task not found');
      }

      // Update metrics based on status change
      if (oldStatus !== newStatus) {
        await this.createAuditLog('STATUS_CHANGE', taskId, { status: oldStatus }, { status: newStatus }, null, transaction);
      }

      // Additional logic for updating metrics can be added here
    } catch (error) {
      console.error('Error in TaskService.updateTaskMetrics:', error);
      throw error;
    }
  }

  async updateCommentMetrics(taskId, transaction) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          {
            model: Comment,
            as: 'comments',
            attributes: ['id']
          }
        ],
        transaction
      });

      if (!task) {
        throw new ValidationError('Task not found');
      }

      const totalComments = task.comments.length;

      // Update the task's comment metrics
      await task.update({ total_comments: totalComments }, { transaction });
    } catch (error) {
      console.error('Error in TaskService.updateCommentMetrics:', error);
      throw error;
    }
  }

  async updateAttachmentMetrics(taskId, transaction) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          {
            model: Attachment,
            as: 'attachments',
            attributes: ['id']
          }
        ],
        transaction
      });

      if (!task) {
        throw new ValidationError('Task not found');
      }

      const totalAttachments = task.attachments.length;

      // Update the task's attachment metrics
      await task.update({ total_attachments: totalAttachments }, { transaction });
    } catch (error) {
      console.error('Error in TaskService.updateAttachmentMetrics:', error);
      throw error;
    }
  }

  async createAuditLog(action, taskId, oldValues, newValues, userId, transaction) {
    try {
      const { AuditLog } = require('../../models');  // Using the correct import from models index

      const logEntry = {
        action,
        entity_type: 'TASK',
        entity_id: taskId.toString(),
        old_values: oldValues ? JSON.stringify(oldValues) : null,
        new_values: newValues ? JSON.stringify(newValues) : null,
        user_id: userId,
        created_at: new Date()
      };

      await AuditLog.create(logEntry, { transaction });
    } catch (error) {
      console.error('Error in createAuditLog:', error);
      throw error;
    }
  }

  async getTaskPriorities() {
    try {
        const priorities = await TaskPriority.findAll({
            attributes: ['id', 'name'],
            order: [['id', 'ASC']]
        });
        return priorities.map(priority => priority.name);
    } catch (error) {
        console.error('Error in TaskService.getTaskPriorities:', error);
        throw error;
    }
  }

  async getTaskTypes() {
    try {
        const types = await TaskType.findAll({
            attributes: ['id', 'name'],
            order: [['id', 'ASC']]
        });
        return types.map(type => type.name);
    } catch (error) {
        console.error('Error in TaskService.getTaskTypes:', error);
        throw error;
    }
  }

  async getTaskStatuses() {
    try {
        const statuses = await Task.findAll({
            attributes: ['status'],
            group: ['status'],
            order: [['status', 'ASC']]
        });
        return statuses.map(status => status.status);
    } catch (error) {
        console.error('Error in TaskService.getTaskStatuses:', error);
        throw error;
    }
  }

  async getLabels(projectId) {
    try {
      const labels = await TaskLabel.findAll({
        where: { project_id: projectId },
        attributes: ['id', 'name'],
        order: [['name', 'ASC']]
      });
      return labels.map(label => ({ id: label.id, name: label.name }));
    } catch (error) {
      console.error('Error in TaskService.getLabels:', error);
      throw error;
    }
  }

  async getWatchers(projectId) {
    try {
      const watchers = await Task.findAll({
        where: { project_id: projectId },
        include: [
          {
            model: User,
            as: 'watchers',
            attributes: ['id', 'username', 'email']
          }
        ]
      });

      return watchers.map(task => task.watchers).flat();
    } catch (error) {
      console.error('Error in TaskService.getWatchers:', error);
      throw error;
    }
  }
}

module.exports = new TaskService();