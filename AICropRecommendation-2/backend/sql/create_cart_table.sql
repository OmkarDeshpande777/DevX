-- Cart table schema for AgriNova database
CREATE TABLE IF NOT EXISTS cart (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL,
  productId VARCHAR(50) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (userId),
  INDEX idx_product_id (productId),
  UNIQUE KEY unique_user_product (userId, productId),
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);