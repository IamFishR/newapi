const fs = require('fs');
const path = require('path');

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            // Drop existing transactions table
            await queryInterface.dropTable('transactions');

            // Read and execute the correct table creation SQL
            const sqlPath = path.join(__dirname, '..', 'models', 'sql', 'finance', 'budget', 'tables.sql');
            const sql = fs.readFileSync(sqlPath, 'utf8');

            const statements = sql
                .split(';')
                .filter(statement => statement.trim().length > 0);

            // Execute each statement
            for (const statement of statements) {
                if (statement.trim()) {
                    await queryInterface.sequelize.query(statement + ';');
                }
            }
        } catch (error) {
            console.error('Migration Error:', error);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        try {
            // In case of rollback, we'll recreate the original table structure
            await queryInterface.createTable('transactions', {
                id: {
                    type: Sequelize.STRING(36),
                    primaryKey: true
                },
                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    }
                },
                date: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                description: {
                    type: Sequelize.STRING(255),
                    allowNull: false
                },
                amount: {
                    type: Sequelize.DECIMAL(15, 2),
                    allowNull: false
                },
                type: {
                    type: Sequelize.ENUM('income', 'expense'),
                    allowNull: false
                },
                created_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                },
                updated_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
                },
                deleted_at: {
                    type: Sequelize.DATE,
                    allowNull: true
                }
            });
        } catch (error) {
            console.error('Migration Rollback Error:', error);
            throw error;
        }
    }
};