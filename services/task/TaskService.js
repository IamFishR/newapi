const { sequelize } = require('../../config/sequelize');
const { Op } = require('sequelize');
const { Task, Project, Sprint, User, TaskType, TaskPriority } = require('../../models');
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
    // Implementation for deleteTask
  }

  async addComment(taskId, content, userId) {
    // Implementation for addComment
  }

  async addAttachment(taskId, fileData, userId) {
    // Implementation for addAttachment
  }

  async logTime(taskId, timeData, userId) {
    // Implementation for logTime
  }

  async addLabel(taskId, labelId, userId) {
    // Implementation for addLabel
  }

  async removeLabel(taskId, labelId, userId) {
    // Implementation for removeLabel
  }

  async addWatcher(taskId, watcherId, userId) {
    // Implementation for addWatcher
  }

  async removeWatcher(taskId, watcherId, userId) {
    // Implementation for removeWatcher
  }

  async getTaskHistory(taskId) {
    // Implementation for getTaskHistory
  }

  async getTaskMetrics(taskId) {
    // Implementation for getTaskMetrics
  }

  async updateTaskMetrics(taskId, oldStatus, newStatus, transaction) {
    // Implementation for updateTaskMetrics
  }

  async updateCommentMetrics(taskId, transaction) {
    // Implementation for updateCommentMetrics
  }

  async updateAttachmentMetrics(taskId, transaction) {
    // Implementation for updateAttachmentMetrics
  }

  async createAuditLog(action, taskId, oldValues, newValues, userId, transaction) {
    // Implementation for createAuditLog
  }
}

module.exports = new TaskService();