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

-- Create performance indexes
CREATE INDEX idx_debt_user_due ON debt_items(user_id, due_date);
CREATE INDEX idx_debt_payments_debt_date ON debt_payments(debt_id, payment_date);