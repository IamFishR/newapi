-- User information
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL
);

-- User sessions
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(500) NOT NULL UNIQUE,
    expiry DATETIME NOT NULL,
    device_info JSON,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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

-- User preferences
CREATE TABLE preferences (
    user_id INT PRIMARY KEY,
    theme VARCHAR(20),
    language VARCHAR(20),
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

-- User notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    is_read BOOLEAN,
    timestamp DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default roles and permissions
INSERT INTO roles (role_name) VALUES ('admin'), ('user');
INSERT INTO permissions (permission_name) VALUES ('read'), ('write');
INSERT INTO role_permissions (role_id, permission_id) SELECT 1, id FROM permissions;