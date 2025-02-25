-- Risk metrics
CREATE TABLE risk_metrics (
    symbol VARCHAR(20),
    date DATE,
    impact_cost DECIMAL(10,2),
    daily_volatility DECIMAL(10,2),
    annual_volatility DECIMAL(10,2),
    security_var DECIMAL(10,2),
    index_var DECIMAL(10,2),
    var_margin DECIMAL(10,2),
    extreme_loss_margin DECIMAL(10,2),
    adhoc_margin DECIMAL(10,2),
    applicable_margin DECIMAL(10,2),
    PRIMARY KEY (symbol, date),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Delivery positions
CREATE TABLE delivery_positions (
    symbol VARCHAR(20),
    date DATE,
    quantity_traded BIGINT,
    delivery_quantity BIGINT,
    delivery_percentage DECIMAL(10,2),
    PRIMARY KEY (symbol, date),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Shareholding patterns
CREATE TABLE shareholding_patterns (
    symbol VARCHAR(20),
    period_end_date DATE,
    promoter_group_percentage DECIMAL(10,2),
    public_percentage DECIMAL(10,2),
    employee_trusts_percentage DECIMAL(10,2),
    PRIMARY KEY (symbol, period_end_date),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- User watchlist
CREATE TABLE watchlist (
    user_id INT,
    symbol VARCHAR(20),
    PRIMARY KEY (user_id, symbol),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- User portfolio
CREATE TABLE portfolio (
    user_id INT,
    symbol VARCHAR(20),
    quantity BIGINT,
    average_price DECIMAL(10,2),
    PRIMARY KEY (user_id, symbol),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- User transactions
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    symbol VARCHAR(20),
    transaction_type VARCHAR(10),
    quantity BIGINT,
    price DECIMAL(10,2),
    transaction_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);