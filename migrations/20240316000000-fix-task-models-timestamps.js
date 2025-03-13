'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // We'll check if columns exist before adding them
    const addColumnIfNotExists = async (table, column, columnDefinition) => {
      try {
        await queryInterface.addColumn(table, column, columnDefinition);
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log(`Column ${column} already exists in ${table}`);
        } else {
          throw error;
        }
      }
    };

    // Add updated_at to task_types if it doesn't exist
    await addColumnIfNotExists('task_types', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add timestamps to task_time_logs if they don't exist
    await addColumnIfNotExists('task_time_logs', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await addColumnIfNotExists('task_time_logs', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add updated_at to task_priorities if it doesn't exist
    await addColumnIfNotExists('task_priorities', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add timestamps to task_comments if they don't exist
    await addColumnIfNotExists('task_comments', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await addColumnIfNotExists('task_comments', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add updated_at to task_attachments if it doesn't exist
    await addColumnIfNotExists('task_attachments', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add timestamps to task_audit_logs if they don't exist
    await addColumnIfNotExists('task_audit_logs', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await addColumnIfNotExists('task_audit_logs', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Only remove columns that we successfully added
    const removeColumnIfExists = async (table, column) => {
      try {
        await queryInterface.removeColumn(table, column);
      } catch (error) {
        if (!error.message.includes('Unknown column')) {
          throw error;
        }
      }
    };

    await removeColumnIfExists('task_types', 'updated_at');
    await removeColumnIfExists('task_time_logs', 'created_at');
    await removeColumnIfExists('task_time_logs', 'updated_at');
    await removeColumnIfExists('task_priorities', 'updated_at');
    await removeColumnIfExists('task_comments', 'created_at');
    await removeColumnIfExists('task_comments', 'updated_at');
    await removeColumnIfExists('task_attachments', 'updated_at');
    await removeColumnIfExists('task_audit_logs', 'created_at');
    await removeColumnIfExists('task_audit_logs', 'updated_at');
  }
};