'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First create the financial_health_scores table
    await queryInterface.createTable('financial_health_scores', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      overall_score: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      savings_rate: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      debt_to_income_ratio: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      emergency_fund_months: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      last_calculated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      needs_percentage: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      wants_percentage: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      savings_percentage: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create financial_recommendations table
    await queryInterface.createTable('financial_recommendations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false
      },
      action: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      impact: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'dismissed'),
        defaultValue: 'pending'
      },
      completed_at: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create financial_trends table
    await queryInterface.createTable('financial_trends', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      month: {
        type: Sequelize.DATE,
        allowNull: false
      },
      income: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      expenses: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      savings: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      net_worth: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      needs_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      wants_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      savings_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('financial_health_scores', ['user_id', 'last_calculated_at']);
    await queryInterface.addIndex('financial_recommendations', ['user_id', 'status']);
    await queryInterface.addIndex('financial_trends', ['user_id', 'month']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('financial_trends');
    await queryInterface.dropTable('financial_recommendations');
    await queryInterface.dropTable('financial_health_scores');
  }
};