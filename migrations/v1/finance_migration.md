# Finance API Database Migration Plan

## Tasks
- [ ] Create new migration folder structure for finance modules
- [ ] Document existing finance database schema
- [ ] Create base migration scripts for finance modules
- [ ] Implement test cases for migrations
- [ ] Establish relationships between finance entities
- [ ] Add proper indexing for performance

## Folder Structure
```
migrations/
├── v1/
│   ├── up/
│   │   ├── 01_init.sql                 # Database initialization
│   │   ├── 02_auth_tables.sql          # Users, roles, permissions
│   │   ├── 03_profile_tables.sql       # Financial profiles
│   │   ├── 04_budget_tables.sql        # Budget categories, transactions
│   │   ├── 05_bank_tables.sql          # Bank accounts, statements
│   │   ├── 06_investment_tables.sql    # Investments, transactions
│   │   ├── 07_debt_tables.sql          # Debt items, payments
│   │   ├── 08_goals_tables.sql         # Financial goals, contributions
│   │   ├── 09_assets_tables.sql        # Assets, liabilities
│   │   └── 10_tax_tables.sql           # Tax profiles, deductions
│   ├── down/
│   │   └── revert_finance.sql          # Script to revert all finance changes
│   └── finance_migration.md            # This file - tracks progress
```

## Migration Order
1. Profile System
   - [ ] Financial profiles
   - [ ] User preferences
   - [ ] Financial settings

2. Budget Management
   - [ ] Budget categories
   - [ ] Transactions
   - [ ] Recurring transactions
   - [ ] Transaction categories
   - [ ] Budget reports

3. Banking
   - [ ] Bank accounts
   - [ ] Bank statements
   - [ ] Account types
   - [ ] Transaction import
   - [ ] Statement parsing

4. Investment Tracking
   - [ ] Investments
   - [ ] Investment transactions
   - [ ] Investment types
   - [ ] Portfolio analysis
   - [ ] Performance metrics

5. Debt Management
   - [ ] Debt items
   - [ ] Debt payments
   - [ ] Interest calculations
   - [ ] Payment schedules
   - [ ] Debt snowball/avalanche strategies

6. Financial Goals
   - [ ] Financial goals
   - [ ] Goal contributions
   - [ ] Goal categories
   - [ ] Progress tracking
   - [ ] Goal projections

7. Asset Management
   - [ ] Assets
   - [ ] Asset value history
   - [ ] Liabilities
   - [ ] Net worth calculations

8. Tax Planning
   - [ ] Tax profiles
   - [ ] Tax deductions
   - [ ] Tax categories
   - [ ] Document storage
   - [ ] Tax estimations

## Table Standards
- All tables include:
  - [ ] UUID primary keys
  - [ ] Proper timestamps (created_at, updated_at, deleted_at)
  - [ ] User associations
  - [ ] Consistent foreign key relationships
  - [ ] Appropriate indexes
  - [ ] Standardized column naming (snake_case)
  - [ ] Proper data types
  - [ ] Default values where appropriate
  - [ ] Soft delete capability

## Database Schema Details

### Profile System
```sql
-- Financial Profiles
CREATE TABLE IF NOT EXISTS financial_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    monthly_income DECIMAL(15, 2) NOT NULL DEFAULT 0,
    monthly_savings_goal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    current_savings DECIMAL(15, 2) NOT NULL DEFAULT 0,
    monthly_expenses JSON NOT NULL,
    investment_profile JSON NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_profile (user_id)
);
```

### Budget Management
```sql
-- Budget Categories
CREATE TABLE IF NOT EXISTS budget_categories (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    budgeted_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    color VARCHAR(7),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_category_name (user_id, name)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36),
    date TIMESTAMP NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    recurring_type ENUM('none', 'daily', 'weekly', 'monthly', 'yearly') DEFAULT 'none',
    recurring_end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES budget_categories(id),
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id)
);
```

### Banking System
```sql
-- Bank Accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(100),
    account_type VARCHAR(50) COMMENT 'e.g., PRIME POTENTIAL, Savings, Current, etc.',
    bank_name VARCHAR(100) NOT NULL,
    branch_name VARCHAR(100),
    ifsc_code VARCHAR(20),
    micr_code VARCHAR(20),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    is_primary BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
    opening_balance DECIMAL(15, 2) DEFAULT 0,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    last_synced_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_account (user_id, account_number, bank_name)
);

-- Bank Statements
CREATE TABLE IF NOT EXISTS bank_statements (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    statement_date TIMESTAMP NOT NULL,
    filename VARCHAR(255),
    file_url VARCHAR(255),
    file_type VARCHAR(50),
    status ENUM('pending', 'processing', 'completed', 'error') DEFAULT 'pending',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE
);

-- Statement Transactions (raw import before categorization)
CREATE TABLE IF NOT EXISTS statement_transactions (
    id VARCHAR(36) PRIMARY KEY,
    statement_id VARCHAR(36) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    value_date TIMESTAMP,
    description TEXT NOT NULL,
    reference_number VARCHAR(100),
    debit_amount DECIMAL(15, 2),
    credit_amount DECIMAL(15, 2),
    balance DECIMAL(15, 2),
    is_processed BOOLEAN DEFAULT FALSE,
    categorized_transaction_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (statement_id) REFERENCES bank_statements(id) ON DELETE CASCADE,
    FOREIGN KEY (categorized_transaction_id) REFERENCES transactions(id)
);
```

### Investment Tracking
```sql
-- Investments
CREATE TABLE IF NOT EXISTS investments (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    shares DECIMAL(15, 6) NOT NULL DEFAULT 0,
    average_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    type ENUM('stock', 'etf', 'mutual_fund', 'crypto', 'other') NOT NULL,
    purchase_date TIMESTAMP NOT NULL,
    current_price DECIMAL(15, 2),
    last_price_update TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_symbol (user_id, symbol)
);

-- Investment Transactions
CREATE TABLE IF NOT EXISTS investment_transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    investment_id VARCHAR(36) NOT NULL,
    type ENUM('buy', 'sell') NOT NULL,
    shares DECIMAL(15, 6) NOT NULL,
    price_per_share DECIMAL(15, 2) NOT NULL,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE
);
```

### Debt Management
```sql
-- Debt Items
CREATE TABLE IF NOT EXISTS debt_items (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('credit_card', 'loan', 'mortgage', 'other') NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
    minimum_payment DECIMAL(15, 2) NOT NULL DEFAULT 0,
    due_date TIMESTAMP NOT NULL,
    initial_balance DECIMAL(15, 2) NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lender VARCHAR(100),
    account_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Debt Payments
CREATE TABLE IF NOT EXISTS debt_payments (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    debt_id VARCHAR(36) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (debt_id) REFERENCES debt_items(id) ON DELETE CASCADE
);
```

### Financial Goals
```sql
-- Financial Goals
CREATE TABLE IF NOT EXISTS financial_goals (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    target_date TIMESTAMP NOT NULL,
    category ENUM('savings', 'investment', 'property', 'education', 'retirement', 'other') NOT NULL,
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    monthly_contribution DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Goal Contributions
CREATE TABLE IF NOT EXISTS goal_contributions (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    goal_id VARCHAR(36) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES financial_goals(id) ON DELETE CASCADE
);
```

### Asset Management
```sql
-- Assets
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    category ENUM('cash', 'investments', 'property', 'vehicle', 'other') NOT NULL,
    value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    purchase_value DECIMAL(15, 2),
    purchase_date TIMESTAMP,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    value_history JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Liabilities
CREATE TABLE IF NOT EXISTS liabilities (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    category ENUM('mortgage', 'loan', 'credit_card', 'other') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
    minimum_payment DECIMAL(15, 2),
    payment_due_date INT,
    lender VARCHAR(100),
    account_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Tax Planning
```sql
-- Tax Profiles
CREATE TABLE IF NOT EXISTS tax_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    tax_year INT NOT NULL,
    filing_status ENUM('single', 'married_joint', 'married_separate', 'head_household') NOT NULL,
    estimated_income DECIMAL(15, 2) NOT NULL DEFAULT 0,
    estimated_deductions DECIMAL(15, 2) NOT NULL DEFAULT 0,
    estimated_tax_credits DECIMAL(15, 2) NOT NULL DEFAULT 0,
    withholding_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    estimated_tax_liability DECIMAL(15, 2) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_year (user_id, tax_year)
);

-- Tax Deductions
CREATE TABLE IF NOT EXISTS tax_deductions (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    tax_profile_id VARCHAR(36) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date TIMESTAMP NOT NULL,
    status ENUM('verified', 'pending') NOT NULL DEFAULT 'pending',
    document_urls JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tax_profile_id) REFERENCES tax_profiles(id) ON DELETE CASCADE
);
```

## Performance Optimization

### Indexing Strategy
```sql
-- Budget Management Indexes
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_category_date ON transactions(category_id, date);
CREATE INDEX idx_transactions_account_date ON transactions(account_id, date);

-- Banking System Indexes
CREATE INDEX idx_bank_accounts_user ON bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_status ON bank_accounts(status);
CREATE INDEX idx_bank_statements_account ON bank_statements(account_id);
CREATE INDEX idx_bank_statements_status ON bank_statements(status);
CREATE INDEX idx_statement_transactions_date ON statement_transactions(transaction_date);
CREATE INDEX idx_statement_transactions_processed ON statement_transactions(is_processed);

-- Investment Tracking Indexes
CREATE INDEX idx_investments_user_type ON investments(user_id, type);
CREATE INDEX idx_investment_transactions_investment_date ON investment_transactions(investment_id, date);

-- Debt Management Indexes
CREATE INDEX idx_debt_user_due ON debt_items(user_id, due_date);
CREATE INDEX idx_debt_payments_debt_date ON debt_payments(debt_id, payment_date);

-- Financial Goals Indexes
CREATE INDEX idx_goals_user_target ON financial_goals(user_id, target_date);
CREATE INDEX idx_goal_contributions_goal_date ON goal_contributions(goal_id, date);

-- Asset Management Indexes
CREATE INDEX idx_assets_user_category ON assets(user_id, category);
CREATE INDEX idx_liabilities_user_category ON liabilities(user_id, category);

-- Tax Planning Indexes
CREATE INDEX idx_tax_user_year ON tax_profiles(user_id, tax_year);
CREATE INDEX idx_tax_deductions_profile ON tax_deductions(tax_profile_id, date);
```

## Dependencies Between Tables

To maintain referential integrity, tables should be created in the following order:

1. Users (already existing)
2. Financial profiles
3. Bank accounts → Bank statements → Statement transactions
4. Budget categories → Transactions (depends on bank accounts)
5. Investments → Investment transactions
6. Debt items → Debt payments
7. Financial goals → Goal contributions
8. Assets and Liabilities (independent)
9. Tax profiles → Tax deductions

## Next Steps:
1. [ ] Create folder structure and remove old migrations
2. [ ] Begin implementing SQL scripts in order
3. [ ] Test each migration step
4. [ ] Document final schema
5. [ ] Implement database indexing
6. [ ] Add foreign key constraints
7. [ ] Create test data