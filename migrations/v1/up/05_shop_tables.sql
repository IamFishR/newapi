-- Shop system tables for managing products, inventory, and orders

-- Shops table
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    slug VARCHAR(100) UNIQUE,
    logo_url VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Product categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(shop_id, slug)
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    slug VARCHAR(200),
    sku VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    compare_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    is_taxable BOOLEAN DEFAULT TRUE,
    tax_rate DECIMAL(5, 2),
    status VARCHAR(50) DEFAULT 'active',
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(shop_id, slug)
);

-- Product-category relations
CREATE TABLE product_categories (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, category_id)
);

-- Product images
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    warehouse VARCHAR(100) DEFAULT 'default',
    location VARCHAR(100),
    last_counted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory transactions
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    shipping DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_name VARCHAR(100),
    billing_email VARCHAR(255),
    billing_phone VARCHAR(50),
    billing_address1 VARCHAR(255),
    billing_address2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_zip VARCHAR(20),
    billing_country VARCHAR(100),
    shipping_name VARCHAR(100),
    shipping_address1 VARCHAR(255),
    shipping_address2 VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_zip VARCHAR(20),
    shipping_country VARCHAR(100),
    notes TEXT,
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    sku VARCHAR(100),
    product_name VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order status history
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status order_status,
    new_status order_status NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_shops_timestamp BEFORE UPDATE ON shops
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_categories_timestamp BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_product_images_timestamp BEFORE UPDATE ON product_images
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_inventory_timestamp BEFORE UPDATE ON inventory
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_orders_timestamp BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
