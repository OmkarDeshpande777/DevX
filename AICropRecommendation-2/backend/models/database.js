// Database models for CropAI Backend
const { pool } = require('../config/database');

// User Model
class User {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(userData) {
    const { name, email, password_hash, phone, location } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, phone, location) VALUES (?, ?, ?, ?, ?)',
      [name, email, password_hash, phone, location]
    );
    return await User.findById(result.insertId);
  }
}

// Product Model
class Product {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.location) {
      query += ' AND location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.minPrice) {
      query += ' AND price >= ?';
      params.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      query += ' AND price <= ?';
      params.push(filters.maxPrice);
    }

    if (filters.inStock === 'true') {
      query += ' AND inStock = 1';
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR seller LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Add sorting
    const sortBy = filters.sortBy || 'dateAdded';
    const sortOrder = filters.sortOrder || 'desc';
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    // Add pagination
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const params = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.location) {
      query += ' AND location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.minPrice) {
      query += ' AND price >= ?';
      params.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      query += ' AND price <= ?';
      params.push(filters.maxPrice);
    }

    if (filters.inStock === 'true') {
      query += ' AND inStock = 1';
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR seller LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(productData) {
    const {
      id, name, category, price, unit, seller, sellerId, location,
      rating, reviews, inStock, image, description, priceChange
    } = productData;
    
    const [result] = await pool.execute(
      'INSERT INTO products (id, name, category, price, unit, seller, sellerId, location, rating, reviews, inStock, image, description, priceChange) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, category, price, unit, seller, sellerId, location, rating || 0, reviews || 0, inStock !== false, image, description, priceChange || 0]
    );
    
    return await Product.findById(id);
  }

  static async getCategories() {
    const [rows] = await pool.query(`
      SELECT 
        category,
        COUNT(*) as count,
        ROUND(AVG(price), 2) as averagePrice
      FROM products 
      GROUP BY category
      ORDER BY count DESC
    `);
    return rows;
  }

  static async getStats() {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as totalProducts,
        COUNT(DISTINCT sellerId) as totalSellers,
        ROUND(AVG(price), 2) as averagePrice,
        COUNT(DISTINCT category) as categoriesCount,
        SUM(CASE WHEN inStock = 1 THEN 1 ELSE 0 END) as inStockProducts,
        SUM(CASE WHEN inStock = 0 THEN 1 ELSE 0 END) as outOfStockProducts
      FROM products
    `);

    const [topRated] = await pool.query(`
      SELECT * FROM products 
      WHERE rating >= 4.5 
      ORDER BY rating DESC, reviews DESC 
      LIMIT 5
    `);

    const [recent] = await pool.query(`
      SELECT * FROM products 
      ORDER BY dateAdded DESC 
      LIMIT 10
    `);

    return {
      ...stats[0],
      topRatedProducts: topRated,
      recentProducts: recent
    };
  }
}

// Cart Model
class Cart {
  static async findByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT c.*, p.name, p.price, p.unit, p.seller, p.image, p.inStock, p.description
      FROM cart c
      JOIN products p ON c.productId = p.id
      WHERE c.userId = ?
      ORDER BY c.addedAt DESC
    `, [userId]);
    return rows;
  }

  static async addItem(userId, productId, quantity = 1) {
    const [existing] = await pool.query(
      'SELECT * FROM cart WHERE userId = ? AND productId = ?',
      [userId, productId]
    );

    if (existing.length > 0) {
      // Update existing item quantity
      const [result] = await pool.execute(
        'UPDATE cart SET quantity = quantity + ?, updatedAt = NOW() WHERE userId = ? AND productId = ?',
        [quantity, userId, productId]
      );
      return { updated: true, quantity: existing[0].quantity + quantity };
    } else {
      // Add new item
      const cartId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const [result] = await pool.execute(
        'INSERT INTO cart (id, userId, productId, quantity) VALUES (?, ?, ?, ?)',
        [cartId, userId, productId, quantity]
      );
      return { inserted: true, cartId, quantity };
    }
  }

  static async removeItem(userId, productId) {
    const [result] = await pool.execute(
      'DELETE FROM cart WHERE userId = ? AND productId = ?',
      [userId, productId]
    );
    return result.affectedRows > 0;
  }

  static async updateQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      return await Cart.removeItem(userId, productId);
    }

    const [result] = await pool.execute(
      'UPDATE cart SET quantity = ?, updatedAt = NOW() WHERE userId = ? AND productId = ?',
      [quantity, userId, productId]
    );
    return result.affectedRows > 0;
  }

  static async clearCart(userId) {
    const [result] = await pool.execute(
      'DELETE FROM cart WHERE userId = ?',
      [userId]
    );
    return result.affectedRows;
  }

  static async getCartStats(userId) {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as totalItems,
        SUM(c.quantity) as totalQuantity,
        SUM(c.quantity * p.price) as totalValue
      FROM cart c
      JOIN products p ON c.productId = p.id
      WHERE c.userId = ?
    `, [userId]);

    return stats[0] || { totalItems: 0, totalQuantity: 0, totalValue: 0 };
  }
}

// Crop Monitoring Model
class Crop {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM crops ORDER BY created_at DESC');
    return rows;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query('SELECT * FROM crops WHERE userId = ? ORDER BY created_at DESC', [userId]);
    return rows;
  }

  static async count(userId = null) {
    let query = 'SELECT COUNT(*) as count FROM crops';
    const params = [];
    
    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }
    
    const [result] = await pool.query(query, params);
    return result[0].count;
  }

  static async getHealthStats(userId = null) {
    let query = `
      SELECT 
        status,
        COUNT(*) as count,
        AVG(healthScore) as avgHealthScore
      FROM crops
    `;
    const params = [];
    
    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }
    
    query += ' GROUP BY status';
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async create(cropData) {
    const {
      id, userId, cropName, location, area, plantingDate, 
      status, healthScore, notes, soilType, weatherCondition
    } = cropData;
    
    const [result] = await pool.execute(
      'INSERT INTO crops (id, userId, cropName, location, area, plantingDate, status, healthScore, notes, soilType, weatherCondition) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, userId, cropName, location, area, plantingDate, status || 'planted', healthScore || 85, notes, soilType, weatherCondition]
    );
    
    return await Crop.findById(id);
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM crops WHERE id = ?', [id]);
    return rows[0];
  }
}

// Disease Detection Model
class DiseaseDetection {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM disease_detections ORDER BY detectedAt DESC');
    return rows;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query('SELECT * FROM disease_detections WHERE userId = ? ORDER BY detectedAt DESC', [userId]);
    return rows;
  }

  static async count(userId = null) {
    let query = 'SELECT COUNT(*) as count FROM disease_detections';
    const params = [];
    
    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }
    
    const [result] = await pool.query(query, params);
    return result[0].count;
  }

  static async getRecentDetections(userId = null, limit = 7) {
    let query = `
      SELECT * FROM disease_detections
    `;
    const params = [];
    
    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY detectedAt DESC LIMIT ?';
    params.push(limit);
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async create(detectionData) {
    const {
      id, userId, imagePath, diseaseName, confidence, 
      status, treatment, severity, notes
    } = detectionData;
    
    const [result] = await pool.execute(
      'INSERT INTO disease_detections (id, userId, imagePath, diseaseName, confidence, status, treatment, severity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, userId, imagePath, diseaseName, confidence, status || 'pending', treatment, severity || 'medium', notes]
    );
    
    return await DiseaseDetection.findById(id);
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM disease_detections WHERE id = ?', [id]);
    return rows[0];
  }
}

// Analytics Model
class Analytics {
  static async getDashboardStats(userId = 'user_1') {
    // Get revenue data
    const [revenueData] = await pool.query(`
      SELECT 
        DATE_FORMAT(period, '%b') as label,
        SUM(value) as value
      FROM analytics_data 
      WHERE userId = ? AND type = 'revenue' 
        AND period >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY period
      ORDER BY period ASC
    `, [userId]);

    // Get yield data
    const [yieldData] = await pool.query(`
      SELECT 
        DATE_FORMAT(period, '%b') as label,
        SUM(value) as value
      FROM analytics_data 
      WHERE userId = ? AND type = 'yield'
        AND period >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY period
      ORDER BY period ASC
    `, [userId]);

    // Get current month stats
    const [monthlyStats] = await pool.query(`
      SELECT 
        type,
        SUM(value) as total
      FROM analytics_data 
      WHERE userId = ? 
        AND period >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
      GROUP BY type
    `, [userId]);

    // Get crop health data
    const [cropHealth] = await pool.query(`
      SELECT 
        AVG(healthScore) as healthy,
        COUNT(CASE WHEN status = 'diseased' THEN 1 END) * 100.0 / COUNT(*) as diseased,
        COUNT(CASE WHEN status = 'planted' THEN 1 END) * 100.0 / COUNT(*) as pending
      FROM crops 
      WHERE userId = ?
    `, [userId]);

    return {
      cropYield: {
        labels: yieldData.map(row => row.label),
        data: yieldData.map(row => parseFloat(row.value))
      },
      revenue: {
        labels: revenueData.map(row => row.label),
        data: revenueData.map(row => parseFloat(row.value))
      },
      cropHealth: cropHealth[0] || { healthy: 87.5, diseased: 8.2, pending: 4.3 },
      monthlyStats: {
        totalRevenue: monthlyStats.find(s => s.type === 'revenue')?.total || 0,
        totalCrops: monthlyStats.find(s => s.type === 'yield')?.total || 0,
        healthyCrops: cropHealth[0]?.healthy || 87.5,
        diseaseAlerts: await Analytics.getDiseaseAlertCount(userId)
      }
    };
  }

  static async getDiseaseAlertCount(userId) {
    const [result] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM disease_detections 
      WHERE userId = ? AND status = 'pending' 
        AND detectedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `, [userId]);
    return result[0].count;
  }

  static async getDashboardStatsArray() {
    const stats = await Analytics.getDashboardStats();
    return [
      {
        title: 'Total Revenue',
        value: `₹${(stats.monthlyStats.totalRevenue || 125670).toLocaleString('en-IN')}`,
        change: '+18.2%',
        trend: 'up',
        icon: 'dollar-sign',
        color: 'green',
        period: 'This month'
      },
      {
        title: 'Active Crops',
        value: (stats.monthlyStats.totalCrops || 2340).toString(),
        change: '+12.5%',
        trend: 'up',
        icon: 'leaf',
        color: 'emerald',
        period: 'Current season'
      },
      {
        title: 'Healthy Crops',
        value: `${stats.cropHealth.healthy?.toFixed(1) || '87.5'}%`,
        change: '+5.1%',
        trend: 'up',
        icon: 'shield-check',
        color: 'blue',
        period: 'Real-time'
      },
      {
        title: 'Disease Alerts',
        value: (stats.monthlyStats.diseaseAlerts || 12).toString(),
        change: '-25%',
        trend: 'down',
        icon: 'alert-circle',
        color: 'orange',
        period: 'Last 7 days'
      }
    ];
  }
}

// Initialize sample data if tables are empty
const initializeSampleData = async () => {
  try {
    // Create cart table if it doesn't exist
    await pool.execute(`
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
      )
    `);
    console.log('✅ Cart table ready');

    // Crop recommendations table removed - feature disabled
    
    // Drop and recreate disease_detections table to ensure correct structure
    await pool.execute('DROP TABLE IF EXISTS disease_detections');
    await pool.execute(`
      CREATE TABLE disease_detections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50),
        crop_type VARCHAR(100),
        detected_disease VARCHAR(100) NOT NULL,
        confidence DECIMAL(3,2) DEFAULT 0.80,
        image_path VARCHAR(255),
        treatment_recommended TEXT,
        severity VARCHAR(20) DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_detected_disease (detected_disease)
      )
    `);
    console.log('✅ Disease detections table ready');

    // Check if products table has data
    const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products');
    
    if (productCount[0].count === 0) {
      console.log('📦 Inserting sample products...');
      
      // Insert sample products that match the existing schema
      const sampleProducts = [
        {
          id: 'prod_001',
          name: 'Premium Wheat Seeds - HD 2967',
          category: 'seeds',
          price: 45.50,
          unit: 'kg',
          seller: 'Punjab Seed Corporation',
          sellerId: 'seller_001',
          location: 'Punjab',
          rating: 4.5,
          reviews: 234,
          inStock: true,
          image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop',
          description: 'High-yielding wheat variety with excellent disease resistance and grain quality',
          priceChange: 2.5
        },
        {
          id: 'prod_002',
          name: 'Organic NPK Fertilizer 19-19-19',
          category: 'fertilizer',
          price: 850.00,
          unit: '50kg',
          sellerId: 'seller_002',
          seller: 'Green Earth Fertilizers',
          location: 'Maharashtra',
          rating: 4.8,
          reviews: 156,
          inStock: true,
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
          description: 'Balanced organic fertilizer for optimal plant nutrition and soil health',
          priceChange: -3.2
        },
        {
          id: 'prod_003',
          name: 'Smart Drip Irrigation Kit',
          category: 'equipment',
          price: 15999.00,
          unit: 'set',
          seller: 'AgriTech Solutions',
          sellerId: 'seller_003',
          location: 'Gujarat',
          rating: 4.3,
          reviews: 89,
          inStock: true,
          image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=300&h=200&fit=crop',
          description: 'Complete automated drip irrigation system for 1-acre coverage',
          priceChange: 0.0
        },
        {
          id: 'prod_004',
          name: 'Bio-Pesticide Neem Based',
          category: 'pesticide',
          price: 280.00,
          unit: 'liter',
          seller: 'Organic Protection Co.',
          sellerId: 'seller_004',
          location: 'Karnataka',
          rating: 4.6,
          reviews: 78,
          inStock: true,
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
          description: 'Eco-friendly neem-based pesticide for natural pest control',
          priceChange: 1.8
        }
      ];

      for (const product of sampleProducts) {
        await Product.create(product);
      }
      
      console.log(`✅ Inserted ${sampleProducts.length} sample products`);
    }

    // Crop recommendations data insertion removed - feature disabled

    // Check if disease_detections table has data and insert sample data
    const [diseaseCount] = await pool.query('SELECT COUNT(*) as count FROM disease_detections');
    
    if (diseaseCount[0].count === 0) {
      console.log('🦠 Inserting sample disease detections...');
      
      const sampleDiseases = [
        { user_id: 'user_001', crop_type: 'rice', detected_disease: 'Brown Spot', severity: 'medium' },
        { user_id: 'user_002', crop_type: 'wheat', detected_disease: 'Rust', severity: 'high' },
        { user_id: 'user_003', crop_type: 'cotton', detected_disease: 'Bollworm', severity: 'high' },
        { user_id: 'user_004', crop_type: 'tomato', detected_disease: 'Late Blight', severity: 'medium' },
        { user_id: 'user_005', crop_type: 'potato', detected_disease: 'Early Blight', severity: 'low' },
        { user_id: 'user_006', crop_type: 'maize', detected_disease: 'Corn Smut', severity: 'medium' },
        { user_id: 'user_007', crop_type: 'rice', detected_disease: 'Leaf Blast', severity: 'high' },
        { user_id: 'user_008', crop_type: 'wheat', detected_disease: 'Powdery Mildew', severity: 'low' },
        { user_id: 'user_009', crop_type: 'cotton', detected_disease: 'Aphids', severity: 'medium' },
        { user_id: 'user_010', crop_type: 'sugarcane', detected_disease: 'Red Rot', severity: 'high' }
      ];

      for (const disease of sampleDiseases) {
        await pool.execute(
          'INSERT INTO disease_detections (user_id, crop_type, detected_disease, confidence, severity, treatment_recommended) VALUES (?, ?, ?, ?, ?, ?)',
          [disease.user_id, disease.crop_type, disease.detected_disease, 0.75 + Math.random() * 0.20, disease.severity, `Treatment recommended for ${disease.detected_disease}`]
        );
      }
      
      console.log(`✅ Inserted ${sampleDiseases.length} disease detections`);
    }

    // Check if analytics_data table has data
    const [analyticsCount] = await pool.query('SELECT COUNT(*) as count FROM analytics_data');
    
    if (analyticsCount[0].count === 0) {
      console.log('📊 Inserting sample analytics data...');
      
      const sampleAnalytics = [];
      const userId = 'user_sample';
      
      // Generate 6 months of sample data
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const period = date.toISOString().split('T')[0].substring(0, 7) + '-01';
        
        sampleAnalytics.push({
          id: `analytics_revenue_${i}`,
          userId,
          type: 'revenue',
          period,
          value: 100000 + Math.random() * 50000
        });
        
        sampleAnalytics.push({
          id: `analytics_yield_${i}`,
          userId,
          type: 'yield',
          period,
          value: 2000 + Math.random() * 1000
        });
      }

      for (const data of sampleAnalytics) {
        await pool.execute(
          'INSERT INTO analytics_data (id, userId, type, period, value) VALUES (?, ?, ?, ?, ?)',
          [data.id, data.userId, data.type, data.period, data.value]
        );
      }
      
      console.log(`✅ Inserted ${sampleAnalytics.length} analytics records`);
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize sample data:', error.message);
  }
};

module.exports = {
  User,
  Product,
  Cart,
  Crop,
  DiseaseDetection,
  Analytics,
  initializeSampleData
};