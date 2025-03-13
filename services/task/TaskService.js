const { sequelize } = require('../../config/sequelize');
const { Task, Project, Sprint, User, TaskType, TaskPriority } = require('../../models');

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
            attributes: ['id', 'username', 'email'], // Changed from 'name' to match User model columns
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

      // Add filters if they exist
      if (status) queryOptions.where.status = status;
      if (project_id) queryOptions.where.project_id = project_id;
      if (assigned_to) queryOptions.where.assigned_to = assigned_to;

      // Add any other filters from otherOptions
      Object.keys(otherOptions).forEach(key => {
        if (otherOptions[key] !== undefined) {
          const columnName = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          queryOptions.where[columnName] = otherOptions[key];
        }
      });

      const { count, rows } = await Task.findAndCountAll(queryOptions);
      const totalPages = Math.ceil(count / pageSize);

      return {
        tasks: rows,
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
    // Implementation for createTask
  }

  async getTask(id) {
    // Implementation for getTask
  }

  async updateTask(id, data, userId) {
    // Implementation for updateTask
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