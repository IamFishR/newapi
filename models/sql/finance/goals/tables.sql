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

-- Create performance indexes
CREATE INDEX idx_goals_user_target ON financial_goals(user_id, target_date);
CREATE INDEX idx_goal_contributions_goal_date ON goal_contributions(goal_id, date);