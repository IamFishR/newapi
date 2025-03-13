# Comprehensive Database Migration Plan

## Tasks
- [x] Create new migration folder structure
- [x] Remove previously created migrations
- [x] Create base migration scripts
- [ ] Test migration scripts
- [x] Document database schema

## Folder Structure
```
migrations/
├── v1/
│   ├── up/
│   │   ├── 01_init.sql                 # Database initialization
│   │   ├── 02_auth_tables.sql          # Users, roles, permissions
│   │   ├── 03_core_tables.sql          # Projects, tasks, sprints
│   │   ├── 04_finance_tables.sql       # Transactions, accounts, investments
│   │   └── 05_shop_tables.sql          # Products, orders, inventory
│   ├── down/
│   │   └── revert_all.sql              # Script to revert all changes
│   └── migration.md                     # This file - tracks progress
```

## Migration Order
1. Authentication & Users
   - [x] Users
   - [x] Roles
   - [x] Permissions
   - [x] Sessions
   - [x] API Keys

2. Core Business Logic 
   - [x] Projects
   - [x] Tasks
   - [x] Sprints
   - [x] Task Types
   - [x] Task Status History
   - [x] Task Comments
   - [x] Task Attachments

3. Financial System
   - [x] Bank Accounts
   - [x] Transactions
   - [x] Budget Categories
   - [x] Investments
   - [x] Investment Transactions
   - [x] Assets
   - [x] Liabilities
   - [x] Financial Goals

4. Shop System
   - [x] Shops
   - [x] Categories
   - [x] Products
   - [x] Product Images
   - [x] Inventory
   - [x] Orders
   - [x] Order Items
   - [x] Order Status History

## Table Standards
- All tables include:
  - [x] Proper timestamps (created_at, updated_at, deleted_at)
  - [x] Consistent foreign key relationships
  - [x] Appropriate indexes
  - [x] Standardized column naming (snake_case)
  - [x] Proper data types
  - [x] Default values where appropriate

## Next Steps:
1. ✅ Create folder structure and remove old migrations
2. ✅ Begin implementing SQL scripts in order
3. 🔄 Test each migration step
4. ✅ Document final schema