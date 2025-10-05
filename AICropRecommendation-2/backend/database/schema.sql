-- SIH2025 CropAI Database Schema
-- MySQL Database Schema for Agricultural AI Platform
-- Created for AgriNova CropAI Application

-- Create database (run this separately if database doesn't exist)
-- CREATE DATABASE IF NOT EXISTS AgriNova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE AgriNova;

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
    crop_type VARCHAR(100) NOT NULL,
    recommended_crop VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    soil_type VARCHAR(50),
    ph_level DECIMAL(3,1),
    nitrogen DECIMAL(10,2),
    phosphorus DECIMAL(10,2),
    potassium DECIMAL(10,2),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    rainfall DECIMAL(8,2),
    season VARCHAR(20),
    location VARCHAR(255),
    prediction_factors JSON,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_crop_type (crop_type),
    INDEX idx_created_at (created_at),
    INDEX idx_confidence (confidence_score)
);

-- Disease detections table
CREATE TABLE IF NOT EXISTS disease_detections (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    image_path VARCHAR(500),
    image_url VARCHAR(500),
    predicted_disease VARCHAR(100),
    disease_name VARCHAR(100),
    confidence DECIMAL(5,2) DEFAULT 0.00,
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    severity VARCHAR(20) DEFAULT 'unknown',
    status VARCHAR(20) DEFAULT 'detected',
    symptoms JSON,
    treatment_recommendations TEXT,
    prevention_tips TEXT,
    crop_affected VARCHAR(100),
    detection_method VARCHAR(50) DEFAULT 'AI',
    model_version VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_disease (predicted_disease),
    INDEX idx_severity (severity),
    INDEX idx_created_at (created_at),
    INDEX idx_confidence (confidence_score)
);

-- Marketplace products table
CREATE TABLE IF NOT EXISTS marketplace_products (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    seller_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    category ENUM('seeds', 'fertilizer', 'equipment', 'pesticide') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    seller_name VARCHAR(255),
    location VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00,
    reviews_count INT DEFAULT 0,
    in_stock BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    description TEXT,
    price_change DECIMAL(5,2) DEFAULT 0.00,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_seller (seller_id),
    INDEX idx_price (price),
    INDEX idx_rating (rating),
    INDEX idx_in_stock (in_stock)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    delivery_address JSON,
    contact_info JSON,
    payment_method VARCHAR(50) DEFAULT 'cod',
    special_instructions TEXT,
    tracking_number VARCHAR(100),
    estimated_delivery DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES marketplace_products(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Market prices table
CREATE TABLE IF NOT EXISTS market_prices (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    crop VARCHAR(100) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    price_change DECIMAL(10,2) DEFAULT 0.00,
    change_percent DECIMAL(5,2) DEFAULT 0.00,
    market VARCHAR(255) NOT NULL,
    volume INT DEFAULT 0,
    demand_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_crop (crop),
    INDEX idx_market (market),
    INDEX idx_last_updated (last_updated)
);

-- User sessions table (for authentication)
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

-- Analytics table for farm metrics
CREATE TABLE IF NOT EXISTS farm_analytics (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20),
    date_recorded DATE NOT NULL,
    additional_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_metric_type (metric_type),
    INDEX idx_date_recorded (date_recorded)
);

-- Insert sample data for testing
INSERT IGNORE INTO users (id, name, email, password_hash, phone, location) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Test Farmer', 'test@example.com', '$2a$10$example.hash', '+91-9876543210', 'Punjab, India'),
('d942bbbf-82a7-4ecb-80d5-5ca4d4f91dee', 'Demo User', 'demo@example.com', '$2a$10$example.hash', '+91-9876543211', 'Gujarat, India');

-- Insert sample crop recommendations
INSERT IGNORE INTO crop_recommendations (user_id, crop_type, recommended_crop, confidence_score, soil_type, season) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'cereal', 'Rice', 85.5, 'loamy', 'kharif'),
('d942bbbf-82a7-4ecb-80d5-5ca4d4f91dee', 'vegetable', 'Tomato', 78.2, 'sandy', 'summer');

-- Insert sample disease detections
INSERT IGNORE INTO disease_detections (user_id, predicted_disease, confidence_score, severity, status) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Early Blight', 82.1, 'medium', 'detected'),
('d942bbbf-82a7-4ecb-80d5-5ca4d4f91dee', 'Healthy', 95.5, 'low', 'healthy');

-- All tables created above - schema complete
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    farmer_type VARCHAR(50) DEFAULT 'individual', -- individual, cooperative, commercial
    farm_size DECIMAL(10,2), -- in hectares
    experience_years INTEGER,
    profile_image TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crops table
CREATE TABLE IF NOT EXISTS crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    planted_area DECIMAL(10,2), -- in hectares
    planting_date DATE,
    expected_harvest_date DATE,
    current_stage VARCHAR(50), -- seedling, vegetative, flowering, fruiting, harvesting
    location_lat DECIMAL(10,6),
    location_lng DECIMAL(10,6),
    soil_type VARCHAR(50),
    irrigation_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Disease detections table
CREATE TABLE IF NOT EXISTS disease_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    predicted_disease VARCHAR(255) NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    disease_description TEXT,
    treatment_recommendations TEXT[],
    supplements_recommended TEXT[],
    severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    detection_source VARCHAR(50) DEFAULT 'ai_model', -- ai_model, manual_diagnosis
    location_lat DECIMAL(10,6),
    location_lng DECIMAL(10,6),
    weather_conditions JSONB,
    is_verified BOOLEAN DEFAULT false,
    verified_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crop recommendations table
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    request_data JSONB NOT NULL, -- Store the input parameters (N, P, K, etc.)
    recommended_crop VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(5,4),
    fertilizer_recommendations JSONB,
    profit_predictions JSONB,
    season VARCHAR(20),
    region VARCHAR(100),
    soil_conditions JSONB,
    weather_data JSONB,
    model_version VARCHAR(20) DEFAULT 'v1',
    prediction_source VARCHAR(50) DEFAULT 'ai_model', -- ai_model, dynamic_recommendation
    location_lat DECIMAL(10,6),
    location_lng DECIMAL(10,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES crop_recommendations(id) ON DELETE CASCADE,
    detection_id UUID REFERENCES disease_detections(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) NOT NULL, -- crop_recommendation, disease_detection, general
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),
    comments TEXT,
    actual_outcome TEXT, -- What actually happened vs prediction
    would_recommend BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics data table
CREATE TABLE IF NOT EXISTS analytics_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- page_view, prediction_request, disease_detection, etc.
    event_data JSONB,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Soil data table
CREATE TABLE IF NOT EXISTS soil_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    nitrogen_level DECIMAL(8,2),
    phosphorus_level DECIMAL(8,2),
    potassium_level DECIMAL(8,2),
    ph_level DECIMAL(4,2),
    organic_matter DECIMAL(5,2),
    moisture_content DECIMAL(5,2),
    temperature DECIMAL(5,2),
    conductivity DECIMAL(8,2),
    test_date DATE,
    testing_method VARCHAR(50), -- manual, sensor, lab_analysis
    location_lat DECIMAL(10,6),
    location_lng DECIMAL(10,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Weather data table
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_lat DECIMAL(10,6) NOT NULL,
    location_lng DECIMAL(10,6) NOT NULL,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    rainfall DECIMAL(8,2),
    wind_speed DECIMAL(5,2),
    wind_direction INTEGER,
    pressure DECIMAL(8,2),
    uv_index DECIMAL(4,2),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    data_source VARCHAR(50) DEFAULT 'api', -- api, sensor, manual
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- seeds, tools, fertilizers, produce, equipment
    subcategory VARCHAR(100),
    price DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'INR',
    quantity DECIMAL(10,2),
    unit VARCHAR(20), -- kg, tons, pieces, liters, etc.
    images TEXT[],
    location VARCHAR(255),
    location_lat DECIMAL(10,6),
    location_lng DECIMAL(10,6),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    is_negotiable BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active', -- active, sold, expired, inactive
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON crops(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_crop_name ON crops(crop_name);
CREATE INDEX IF NOT EXISTS idx_disease_detections_user_id ON disease_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_disease_detections_crop_id ON disease_detections(crop_id);
CREATE INDEX IF NOT EXISTS idx_disease_detections_created_at ON disease_detections(created_at);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_user_id ON crop_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_created_at ON crop_recommendations(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_user_id ON analytics_data(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_event_type ON analytics_data(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_data_created_at ON analytics_data(created_at);
CREATE INDEX IF NOT EXISTS idx_soil_data_user_id ON soil_data(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_data_crop_id ON soil_data(crop_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_location ON weather_data(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_weather_data_recorded_at ON weather_data(recorded_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_user_id ON marketplace_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;


-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_disease_detections_updated_at BEFORE UPDATE ON disease_detections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_crop_recommendations_updated_at BEFORE UPDATE ON crop_recommendations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON marketplace_listings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();