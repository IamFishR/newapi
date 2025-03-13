-- Shop Database Schema

-- Shop Categories Table
CREATE TABLE IF NOT EXISTS shop_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id INT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (parent_category_id) REFERENCES shop_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Shops Table
CREATE TABLE IF NOT EXISTS shop (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    business_hours JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    barcode VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    quantity INT NOT NULL DEFAULT 0,
    minimum_quantity INT DEFAULT 0,
    category_id INT,
    shop_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (category_id) REFERENCES shop_categories(id),
    FOREIGN KEY (shop_id) REFERENCES shop(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_product_sku(sku),
    INDEX idx_product_barcode(barcode)
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Product Tags Table
CREATE TABLE IF NOT EXISTS product_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE INDEX idx_tag_name(name)
);

-- Product Tag Relations Table
CREATE TABLE IF NOT EXISTS product_tag_relations (
    product_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (tag_id) REFERENCES product_tags(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (shop_id) REFERENCES shop(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Order Status History Table
CREATE TABLE IF NOT EXISTS order_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_status_history_order(order_id)
);

-- Inventory Movements Table
CREATE TABLE IF NOT EXISTS inventory_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    movement_type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
    quantity INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_inventory_product(product_id),
    INDEX idx_inventory_reference(reference_type, reference_id)
);

-- Product Price History Table
CREATE TABLE IF NOT EXISTS product_price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    old_price DECIMAL(10, 2) NOT NULL,
    new_price DECIMAL(10, 2) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_price_history_product(product_id)
);

-- Shop Audit Log Table
CREATE TABLE IF NOT EXISTS shop_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('shop', 'product', 'category', 'inventory') NOT NULL,
    entity_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSON,
    new_values JSON,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_audit_entity(entity_type, entity_id),
    INDEX idx_audit_created_at(created_at)
);