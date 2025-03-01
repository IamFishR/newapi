CREATE DATABASE stock_market_app;
USE stock_market_app;


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

-- Stock price information
CREATE TABLE price_data (
    symbol VARCHAR(20),
    date DATE,
    last_price DECIMAL(10,2),
    previous_close DECIMAL(10,2),
    open_price DECIMAL(10,2),
    high_price DECIMAL(10,2),
    low_price DECIMAL(10,2),
    close_price DECIMAL(10,2),
    vwap DECIMAL(10,2),
    volume BIGINT,
    traded_value DECIMAL(15,2),
    market_cap DECIMAL(15,2),
    last_update_time DATETIME,
    PRIMARY KEY (symbol, date),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Price bands and circuit limits
CREATE TABLE price_limits (
    symbol VARCHAR(20),
    date DATE,
    lower_circuit DECIMAL(10,2),
    upper_circuit DECIMAL(10,2),
    price_band VARCHAR(20),
    PRIMARY KEY (symbol, date),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Historical high/low information
CREATE TABLE historical_extremes (
    symbol VARCHAR(20),
    date DATE,
    week_low DECIMAL(10,2),
    week_low_date DATE,
    week_high DECIMAL(10,2),
    week_high_date DATE,
    PRIMARY KEY (symbol, date),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Market depth information
CREATE TABLE market_depth (
    symbol VARCHAR(20),
    date DATE,
    timestamp DATETIME,
    total_buy_quantity BIGINT,
    total_sell_quantity BIGINT,
    PRIMARY KEY (symbol, date, timestamp),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);



-- Bid/Ask data
CREATE TABLE bid_ask (
    symbol VARCHAR(20),
    date DATE,
    timestamp DATETIME,
    level TINYINT,
    bid_price DECIMAL(10,2),
    bid_quantity BIGINT,
    ask_price DECIMAL(10,2),
    ask_quantity BIGINT,
    PRIMARY KEY (symbol, date, timestamp, level),
    FOREIGN KEY (symbol, date, timestamp) REFERENCES market_depth(symbol, date, timestamp)
);

-- Security trading information
CREATE TABLE security_info (
    symbol VARCHAR(20),
    date DATE,
    board_status VARCHAR(20),
    trading_status VARCHAR(20),
    trading_segment VARCHAR(50),
    slb VARCHAR(5),
    class_of_share VARCHAR(20),
    derivatives VARCHAR(5),
    PRIMARY KEY (symbol, date),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

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

-- Corporate actions
CREATE TABLE corporate_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(20),
    ex_date DATE,
    purpose VARCHAR(255),
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

-- Historical price data (for charts)
CREATE TABLE historical_prices (
    symbol VARCHAR(20),
    timestamp BIGINT,
    price DECIMAL(10,2),
    market_type VARCHAR(10),
    PRIMARY KEY (symbol, timestamp),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);


-- User information
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL
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

-- User notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    is_read BOOLEAN,
    timestamp DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User preferences
CREATE TABLE preferences (
    user_id INT PRIMARY KEY,
    theme VARCHAR(20),
    language VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User sessions
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(500) NOT NULL UNIQUE, -- Increased from 100 to 500
    expiry DATETIME NOT NULL,
    device_info JSON,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User API keys
CREATE TABLE api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    api_key VARCHAR(100),
    is_active BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(20)
);

-- User role mappings
CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- User permissions
CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(20)
);

-- Role permission mappings
CREATE TABLE role_permissions (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- User permission mappings
CREATE TABLE user_permissions (
    user_id INT,
    permission_id INT,
    PRIMARY KEY (user_id, permission_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- Insert default roles
INSERT INTO roles (role_name) VALUES ('admin'), ('user');

-- Insert default permissions
INSERT INTO permissions (permission_name) VALUES ('read'), ('write');

-- Assign all permissions to the admin role
INSERT INTO role_permissions (role_id, permission_id) SELECT 1, id FROM permissions;

-- Assign all permissions to the admin user
INSERT INTO user_permissions (user_id, permission_id) SELECT 1, id FROM permissions;

-- Assign the admin role to the first user
INSERT INTO user_roles (user_id, role_id) SELECT 1, id FROM roles;

-- Insert default user
-- INSERT INTO users (username, email, password) VALUES ('admin', 'thisisganesh353@gmail.com', 'securepassword123');

CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `user_id` INTEGER,
    `action` VARCHAR(50) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` VARCHAR(50) NOT NULL,
    `old_values` JSON,
    `new_values` JSON,
    `ip_address` VARCHAR(45),
    `user_agent` VARCHAR(255),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_action` (`action`),
    INDEX `idx_entity` (`entity_type`, `entity_id`),
    INDEX `idx_created_at` (`created_at`)
);

-- Shop Category Management
CREATE TABLE IF NOT EXISTS `shop_categories` (
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `parent_category_id` INTEGER,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`parent_category_id`) REFERENCES `shop_categories` (`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
);

-- Enhanced Shop Table
DROP TABLE IF EXISTS `shop`;
CREATE TABLE IF NOT EXISTS `shop` (
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `address` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `business_hours` JSON,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
);

-- Enhanced Product Table
DROP TABLE IF EXISTS `product`;
CREATE TABLE IF NOT EXISTS `products` (
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `sku` VARCHAR(50) UNIQUE,
    `barcode` VARCHAR(50),
    `price` DECIMAL(10,2) NOT NULL,
    `cost_price` DECIMAL(10,2),
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `minimum_quantity` INTEGER DEFAULT 0,
    `category_id` INTEGER,
    `shop_id` INTEGER NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `shop_categories` (`id`),
    FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
    INDEX `idx_product_sku` (`sku`),
    INDEX `idx_product_barcode` (`barcode`)
);

-- Product Images
CREATE TABLE IF NOT EXISTS `product_images` (
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `is_primary` BOOLEAN DEFAULT FALSE,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
);

-- Inventory Movement
CREATE TABLE IF NOT EXISTS `inventory_movements` (
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `movement_type` ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `reference_type` VARCHAR(50),
    `reference_id` INTEGER,
    `notes` TEXT,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
    INDEX `idx_inventory_product` (`product_id`),
    INDEX `idx_inventory_reference` (`reference_type`, `reference_id`)
);

-- Product Price History
CREATE TABLE IF NOT EXISTS `product_price_history` (
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `old_price` DECIMAL(10,2) NOT NULL,
    `new_price` DECIMAL(10,2) NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
    INDEX `idx_price_history_product` (`product_id`),
    INDEX `idx_price_history_created_by` (`created_by`)
);

-- Shop Audit Log
CREATE TABLE IF NOT EXISTS `shop_audit_logs` (
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `entity_type` ENUM('shop', 'product', 'category', 'inventory') NOT NULL,
    `entity_id` INTEGER NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `old_values` JSON,
    `new_values` JSON,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
    INDEX `idx_shop_audit_entity` (`entity_type`, `entity_id`),
    INDEX `idx_shop_audit_action` (`action`),
    INDEX `idx_shop_audit_created_by` (`created_by`)
);

-- Product Tags
CREATE TABLE IF NOT EXISTS `product_tags` (
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
    UNIQUE INDEX `idx_tag_name` (`name`)
);

-- Product Tag Relations
CREATE TABLE IF NOT EXISTS `product_tag_relations` (
    `product_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`product_id`, `tag_id`),
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
    FOREIGN KEY (`tag_id`) REFERENCES `product_tags` (`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
);

-- Remove duplicate order tables and keep the enhanced versions
DROP TABLE IF EXISTS `order_status`;
DROP TABLE IF EXISTS `order_history`;
DROP TABLE IF EXISTS `orders`;

-- Order Management
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `shop_id` INTEGER NOT NULL,
    `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `notes` TEXT,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
    INDEX `idx_order_shop` (`shop_id`),
    INDEX `idx_order_status` (`status`)
);

CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` DECIMAL(10,2) NOT NULL,
    `total_price` DECIMAL(10,2) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
    INDEX `idx_order_items_order` (`order_id`),
    INDEX `idx_order_items_product` (`product_id`)
);

-- Order Status History
CREATE TABLE IF NOT EXISTS `order_status_history` (
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `notes` TEXT,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
    INDEX `idx_status_history_order` (`order_id`)
);

-- Create table for Macro Economic Sector
CREATE TABLE MacroEconomicSector (
    MES_Code VARCHAR(10) PRIMARY KEY,
    MacroEconomicSectorName VARCHAR(100) NOT NULL,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create table for Sector
CREATE TABLE Sector (
    Sect_Code VARCHAR(10) PRIMARY KEY,
    SectorName VARCHAR(100) NOT NULL,
    MES_Code VARCHAR(10) NOT NULL,
    FOREIGN KEY (MES_Code) REFERENCES MacroEconomicSector(MES_Code),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create table for Industry
CREATE TABLE Industry (
    Ind_Code VARCHAR(10) PRIMARY KEY,
    IndustryName VARCHAR(100) NOT NULL,
    Sect_Code VARCHAR(10) NOT NULL,
    FOREIGN KEY (Sect_Code) REFERENCES Sector(Sect_Code),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create table for Basic Industry
CREATE TABLE BasicIndustry (
    Basic_Ind_Code VARCHAR(12) PRIMARY KEY,
    BasicIndustryName VARCHAR(100) NOT NULL,
    Ind_Code VARCHAR(10) NOT NULL,
    Definition TEXT,
    FOREIGN KEY (Ind_Code) REFERENCES Industry(Ind_Code),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);