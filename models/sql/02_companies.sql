-- Company basic information
CREATE TABLE companies (
    symbol VARCHAR(20) PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    isin VARCHAR(12) NOT NULL,
    listing_date DATE,
    face_value DECIMAL(10,2),
    issued_size BIGINT,
    industry VARCHAR(100),
    sector VARCHAR(100),
    macro_sector VARCHAR(100),
    basic_industry VARCHAR(100)
);

-- Stock indices that the company belongs to
CREATE TABLE company_indices (
    symbol VARCHAR(20),
    index_name VARCHAR(100),
    PRIMARY KEY (symbol, index_name),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Board meetings
CREATE TABLE board_meetings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(20),
    meeting_date DATE,
    purpose TEXT,
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Announcements
CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(20),
    broadcast_date DATETIME,
    subject TEXT,
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Financial results
CREATE TABLE financial_results (
    symbol VARCHAR(20),
    from_date DATE,
    to_date DATE,
    expenditure DECIMAL(15,2),
    income DECIMAL(15,2),
    profit_before_tax DECIMAL(15,2),
    profit_after_tax DECIMAL(15,2),
    eps DECIMAL(10,2),
    is_audited BOOLEAN,
    is_cumulative BOOLEAN,
    is_consolidated BOOLEAN,
    broadcast_timestamp DATETIME,
    xbrl_attachment_url VARCHAR(255),
    notes_attachment_url VARCHAR(255),
    PRIMARY KEY (symbol, to_date, is_consolidated),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Budget Categories
CREATE TABLE IF NOT EXISTS budgetcategories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME
);