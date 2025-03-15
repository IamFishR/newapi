-- Budget Categories Table
CREATE TABLE IF NOT EXISTS budget_categories (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    budgeted_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    color VARCHAR(7) NULL,
    is_default BOOLEAN DEFAULT FALSE,
    type ENUM('ESSENTIAL', 'DISCRETIONARY', 'FINANCIAL') NOT NULL DEFAULT 'ESSENTIAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY user_category_name (user_id, name, deleted_at)
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date DATE NOT NULL,
    type ENUM('expense', 'income') NOT NULL DEFAULT 'expense',
    recurring_type ENUM('none', 'daily', 'weekly', 'monthly', 'yearly') NOT NULL DEFAULT 'none',
    recurring_end_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE RESTRICT,
    INDEX idx_user_date (user_id, date),
    INDEX idx_category (category_id),
    INDEX idx_type (type),
    INDEX idx_recurring (recurring_type)
);