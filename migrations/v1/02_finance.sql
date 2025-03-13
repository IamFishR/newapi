-- Finance Database Schema

-- Bank Accounts Table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(100),
    account_type VARCHAR(50) COMMENT 'e.g., Savings, Current, etc.',
    bank_name VARCHAR(100) NOT NULL,
    branch_name VARCHAR(100),
    ifsc_code VARCHAR(20),
    micr_code VARCHAR(20),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    is_primary BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
    opening_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    last_synced_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_account (account_number, bank_name)
);

-- Budget Categories Table
CREATE TABLE IF NOT EXISTS budget_categories (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    budgeted_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    color VARCHAR(7) NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_category_name (user_id, name)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    account_id VARCHAR(36),
    category_id VARCHAR(36) NOT NULL,
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
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES budget_categories(id)
);

-- Investments Table
CREATE TABLE IF NOT EXISTS investments (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    shares DECIMAL(15, 6) NOT NULL DEFAULT 0,
    average_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    type ENUM('stock', 'etf', 'mutual_fund', 'crypto', 'other') NOT NULL,
    purchase_date TIMESTAMP NULL,
    current_price DECIMAL(15, 2) NULL,
    last_price_update TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_investment (user_id, symbol)
);

-- Investment Transactions Table
CREATE TABLE IF NOT EXISTS investment_transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    investment_id VARCHAR(36) NOT NULL,
    type ENUM('buy', 'sell') NOT NULL,
    shares DECIMAL(15, 6) NOT NULL,
    price_per_share DECIMAL(15, 2) NOT NULL,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (investment_id) REFERENCES investments(id)
);

-- Financial Goals Table
CREATE TABLE IF NOT EXISTS financial_goals (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    target_date TIMESTAMP NOT NULL,
    category ENUM('savings', 'investment', 'debt', 'retirement', 'other') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Goal Contributions Table
CREATE TABLE IF NOT EXISTS goal_contributions (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    goal_id VARCHAR(36) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES financial_goals(id)
);

-- Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
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

-- Create indexes
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_investments_user ON investments(user_id);
CREATE INDEX idx_investments_symbol ON investments(symbol);
CREATE INDEX idx_assets_user_category ON assets(user_id, category);
CREATE INDEX idx_bank_accounts_user ON bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_status ON bank_accounts(status);