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

-- Create performance indexes
CREATE INDEX idx_tax_user_year ON tax_profiles(user_id, tax_year);
CREATE INDEX idx_tax_deductions_profile ON tax_deductions(tax_profile_id, date);