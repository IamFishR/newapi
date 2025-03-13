-- Script to revert all database changes in proper order (respecting foreign key constraints)

-- Drop shop system tables
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS inventory_transactions;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_categories;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS shops;

-- Drop financial system tables
DROP TABLE IF EXISTS financial_goals;
DROP TABLE IF EXISTS liabilities;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS investment_transactions;
DROP TABLE IF EXISTS investments;
DROP TABLE IF EXISTS investment_accounts;
DROP TABLE IF EXISTS transfers;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS budget_categories;
DROP TABLE IF EXISTS bank_accounts;

-- Drop core business tables
DROP TABLE IF EXISTS task_attachments;
DROP TABLE IF EXISTS task_comments;
DROP TABLE IF EXISTS task_status_history;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS task_types;
DROP TABLE IF EXISTS sprints;
DROP TABLE IF EXISTS project_members;
DROP TABLE IF EXISTS projects;

-- Drop authentication tables
DROP TABLE IF EXISTS api_keys;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS update_timestamp CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS user_status;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS transaction_type;
