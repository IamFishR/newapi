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