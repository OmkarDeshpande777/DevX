-- SIH2025 CropAI Database Schema
-- MySQL Database Schema for Agricultural AI Platform
-- Created for AgriNova CropAI Application

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location TEXT,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Crop recommendations table
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    recommended_crop VARCHAR(100) NOT NULL,
    confidence DECIMAL(5,2),
    expected_yield DECIMAL(10,2),
    expected_profit DECIMAL(12,2),
    gross_profit DECIMAL(12,2),
    investment_cost DECIMAL(12,2),
    roi DECIMAL(5,2),
    soil_data JSON,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    additional_details JSON,
    farm_details JSON,
    prediction_result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_recommended_crop (recommended_crop),
    INDEX idx_created_at (created_at),
    INDEX idx_confidence (confidence),
    INDEX idx_expected_profit (expected_profit)
);

-- Disease detections table
CREATE TABLE IF NOT EXISTS disease_detections (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    image_path VARCHAR(500),
    predicted_disease VARCHAR(200) NOT NULL,
    confidence_score DECIMAL(5,2),
    severity ENUM('low', 'medium', 'high'),
    status ENUM('detected', 'healthy', 'uncertain') DEFAULT 'detected',
    treatment_recommendations JSON,
    additional_info JSON,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    detection_metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_predicted_disease (predicted_disease),
    INDEX idx_created_at (created_at),
    INDEX idx_confidence_score (confidence_score),
    INDEX idx_status (status)
);

-- Marketplace products table
CREATE TABLE IF NOT EXISTS marketplace_products (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    seller_id VARCHAR(36) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category ENUM('seeds', 'fertilizers', 'tools', 'crops', 'other') NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'kg',
    stock_quantity INT DEFAULT 0,
    images JSON,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_seller_id (seller_id),
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_created_at (created_at),
    INDEX idx_is_active (is_active)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    buyer_id VARCHAR(36) NOT NULL,
    seller_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    order_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES marketplace_products(id) ON DELETE CASCADE,
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Market prices table
CREATE TABLE IF NOT EXISTS market_prices (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    crop_name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    price_per_unit DECIMAL(8,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    market_date DATE NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_crop_name (crop_name),
    INDEX idx_location (location),
    INDEX idx_market_date (market_date),
    INDEX idx_created_at (created_at)
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at)
);

-- Farm analytics table
CREATE TABLE IF NOT EXISTS farm_analytics (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    analytics_type ENUM('yield', 'profit', 'health_score', 'recommendation_accuracy') NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50),
    period_start DATE,
    period_end DATE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_analytics_type (analytics_type),
    INDEX idx_period_start (period_start),
    INDEX idx_created_at (created_at)
);

-- Sample data for testing
INSERT IGNORE INTO users (id, name, email, password_hash, phone, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'John Farmer', 'john.farmer@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj65wjL0MHjm', '+1234567890', NOW()),
('d942bbbf-82a7-4ecb-80d5-5ca4d4f91dee', 'Jane Grower', 'jane.grower@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj65wjL0MHjm', '+0987654321', NOW());

INSERT IGNORE INTO crop_recommendations (id, user_id, recommended_crop, confidence, expected_yield, expected_profit, roi, created_at) VALUES 
('cr001', '550e8400-e29b-41d4-a716-446655440000', 'Wheat', 87.5, 4500.00, 125000.00, 15.75, NOW()),
('cr002', 'd942bbbf-82a7-4ecb-80d5-5ca4d4f91dee', 'Rice', 92.3, 5200.00, 145000.00, 18.20, NOW());

INSERT IGNORE INTO disease_detections (id, user_id, predicted_disease, confidence_score, severity, status, created_at) VALUES 
('dd001', '550e8400-e29b-41d4-a716-446655440000', 'Early Blight', 82.1, 'medium', 'detected', NOW()),
('dd002', 'd942bbbf-82a7-4ecb-80d5-5ca4d4f91dee', 'Healthy', 95.5, 'low', 'healthy', NOW());

INSERT IGNORE INTO marketplace_products (id, seller_id, product_name, category, price, unit, stock_quantity, created_at) VALUES 
('mp001', '550e8400-e29b-41d4-a716-446655440000', 'Organic Wheat Seeds', 'seeds', 150.00, 'kg', 500, NOW()),
('mp002', 'd942bbbf-82a7-4ecb-80d5-5ca4d4f91dee', 'Bio Fertilizer', 'fertilizers', 800.00, 'bag', 100, NOW());