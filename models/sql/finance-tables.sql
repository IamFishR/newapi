-- Financial Profile Table
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

-- Budget Categories Table
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

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
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
    FOREIGN KEY (category_id) REFERENCES budget_categories(id)
);

-- Debt Items Table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Debt Payments Table
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

-- Financial Goals Table
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

-- Goal Contributions Table
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

-- Investments Table
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

-- Investment Transactions Table
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

-- Assets Table
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

-- Liabilities Table
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

-- Tax Profiles Table
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

-- Tax Deductions Table
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