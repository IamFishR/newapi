-- Financial system tables for tracking accounts, transactions, and investments

-- Bank accounts
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    account_number VARCHAR(50),
    institution VARCHAR(100),
    balance DECIMAL(12, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Budget categories
CREATE TABLE budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL, -- income or expense
    color VARCHAR(20),
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    payee VARCHAR(100),
    notes TEXT,
    is_reconciled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Transfer transactions (for transfers between accounts)
CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    to_transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT different_transactions CHECK (from_transaction_id != to_transaction_id)
);

-- Investment accounts
CREATE TABLE investment_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    institution VARCHAR(100),
    account_number VARCHAR(50),
    account_type VARCHAR(50) NOT NULL,
    current_value DECIMAL(14, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Investment assets
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES investment_accounts(id) ON DELETE CASCADE,
    symbol VARCHAR(20),
    name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    shares DECIMAL(12, 6) DEFAULT 0,
    cost_basis DECIMAL(14, 2),
    current_price DECIMAL(14, 2),
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Investment transactions
CREATE TABLE investment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- buy, sell, dividend, etc.
    transaction_date DATE NOT NULL,
    shares DECIMAL(12, 6),
    price_per_share DECIMAL(14, 2),
    total_amount DECIMAL(14, 2) NOT NULL,
    fees DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assets (property, vehicles, etc.)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    purchase_date DATE,
    purchase_price DECIMAL(14, 2),
    current_value DECIMAL(14, 2),
    depreciation_rate DECIMAL(5, 2), -- annual percentage
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Liabilities (loans, mortgages, etc.)
CREATE TABLE liabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    liability_type VARCHAR(50) NOT NULL,
    lender VARCHAR(100),
    initial_amount DECIMAL(14, 2) NOT NULL,
    current_balance DECIMAL(14, 2) NOT NULL,
    interest_rate DECIMAL(5, 3),
    minimum_payment DECIMAL(12, 2),
    start_date DATE,
    end_date DATE,
    payment_day SMALLINT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Financial goals
CREATE TABLE financial_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_amount DECIMAL(14, 2) NOT NULL,
    current_amount DECIMAL(14, 2) DEFAULT 0,
    target_date DATE,
    status VARCHAR(20) DEFAULT 'in_progress',
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_bank_accounts_timestamp BEFORE UPDATE ON bank_accounts
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_budget_categories_timestamp BEFORE UPDATE ON budget_categories
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_transactions_timestamp BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_investment_accounts_timestamp BEFORE UPDATE ON investment_accounts
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_investments_timestamp BEFORE UPDATE ON investments
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_investment_transactions_timestamp BEFORE UPDATE ON investment_transactions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_assets_timestamp BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_liabilities_timestamp BEFORE UPDATE ON liabilities
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_financial_goals_timestamp BEFORE UPDATE ON financial_goals
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
