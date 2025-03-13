-- Database initialization script
-- Run this first to set up the database environment and extensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create schema if needed
-- CREATE SCHEMA IF NOT EXISTS app;

-- Create custom types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer', 'investment');

-- Create audit function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';
