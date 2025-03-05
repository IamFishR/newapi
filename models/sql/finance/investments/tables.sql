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

-- Create performance indexes
CREATE INDEX idx_investments_user_type ON investments(user_id, type);
CREATE INDEX idx_investment_transactions_investment_date ON investment_transactions(investment_id, date);