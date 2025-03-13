const fs = require('fs');
const path = require('path');

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            // Define the order of domains for proper table creation (handling dependencies)
            const domains = [
                'profile',
                'budget',
                'investments',
                'debt',
                'goals',
                'assets',
                'tax'
            ];

            // Process each domain's SQL file
            for (const domain of domains) {
                const sqlPath = path.join(__dirname, '..', 'models', 'sql', 'finance', domain, 'tables.sql');
                const sql = fs.readFileSync(sqlPath, 'utf8');

                const statements = sql
                    .split(';')
                    .filter(statement => statement.trim().length > 0);

                // Execute each statement in the domain's SQL file
                for (const statement of statements) {
                    if (statement.trim()) {
                        await queryInterface.sequelize.query(statement + ';');
                    }
                }
            }
        } catch (error) {
            console.error('Migration Error:', error);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        try {
            // Drop tables in reverse order to handle dependencies
            const dropOrder = [
                'tax_deductions',
                'tax_profiles',
                'investment_transactions',
                'investments',
                'goal_contributions',
                'financial_goals',
                'debt_payments',
                'debt_items',
                'transactions',
                'budget_categories',
                'assets',
                'liabilities',
                'financial_profiles'
            ];

            for (const table of dropOrder) {
                await queryInterface.dropTable(table);
            }
        } catch (error) {
            console.error('Migration Rollback Error:', error);
            throw error;
        }
    }
};