const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  let connection, dbConnection;
  
  connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    // First create the database if it doesn't exist
    console.log('Creating database if not exists...');
    await connection.promise().query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    // Close and reconnect to the specific database
    connection.end();
    
    dbConnection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });
    
    console.log(`Connected to database: ${process.env.DB_NAME}`);

    // Read and execute the schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing database schema...');
    await dbConnection.promise().query(schemaSQL);
    console.log('Database schema initialized successfully!');

    // Check if tables were created
    const [tables] = await dbConnection.promise().query('SHOW TABLES');
    console.log('Created tables:', tables.map(t => Object.values(t)[0]));

    // Insert some sample data if tables are empty
    console.log('Checking for existing data...');
    
    // Check marketplace_products table
    const [productCount] = await dbConnection.promise().query('SELECT COUNT(*) as count FROM marketplace_products');
    if (productCount[0].count === 0) {
      console.log('Inserting sample marketplace products...');
      await insertSampleProducts(dbConnection);
    }

    // Check users table
    const [userCount] = await dbConnection.promise().query('SELECT COUNT(*) as count FROM users');
    if (userCount[0].count === 0) {
      console.log('Inserting sample users...');
      await insertSampleUsers(dbConnection);
    }

    // Check analytics data
    const [analyticsCount] = await dbConnection.promise().query('SELECT COUNT(*) as count FROM farm_analytics');
    if (analyticsCount[0].count === 0) {
      console.log('Inserting sample analytics data...');
      await insertSampleAnalytics(dbConnection);
    }

    console.log('Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    if (connection && connection.end) connection.end();
    if (dbConnection && dbConnection.end) dbConnection.end();
  }
}

async function insertSampleProducts(connection) {
  const categories = ['seeds', 'fertilizer', 'equipment', 'pesticide'];
  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad'];
  
  const productNames = {
    seeds: ['Wheat Seeds', 'Rice Seeds', 'Corn Seeds', 'Tomato Seeds', 'Potato Seeds'],
    fertilizer: ['NPK Fertilizer', 'Organic Compost', 'Urea', 'Phosphate', 'Potash'],
    equipment: ['Tractor', 'Harvester', 'Plow', 'Irrigation System', 'Sprayer'],
    pesticide: ['Insecticide', 'Herbicide', 'Fungicide', 'Organic Pesticide', 'Bio-Pesticide']
  };

  const insertPromises = [];
  
  for (let i = 0; i < 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const names = productNames[category];
    const name = names[Math.floor(Math.random() * names.length)];
    
    const product = {
      name: `${name} Premium`,
      category,
      price: Math.floor(Math.random() * 5000) + 100,
      unit: category === 'equipment' ? 'piece' : 'kg',
      seller_name: `Seller ${i + 1}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      reviews_count: Math.floor(Math.random() * 100) + 1,
      in_stock: Math.random() > 0.1,
      image_url: `https://picsum.photos/300/200?random=${i}`,
      description: `High quality ${name.toLowerCase()} for your farming needs`,
      price_change: Math.round((Math.random() * 20 - 10) * 10) / 10,
      seller_id: `seller_${i + 1}`
    };

    const insertQuery = `
      INSERT INTO marketplace_products 
      (name, category, price, unit, seller_name, location, rating, reviews_count, in_stock, image_url, description, price_change, seller_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    insertPromises.push(
      connection.promise().execute(insertQuery, [
        product.name, product.category, product.price, product.unit, product.seller_name,
        product.location, product.rating, product.reviews_count, product.in_stock,
        product.image_url, product.description, product.price_change, product.seller_id
      ])
    );
  }

  await Promise.all(insertPromises);
  console.log('Sample products inserted successfully!');
}

async function insertSampleUsers(connection) {
  const sampleUsers = [
    {
      name: 'John Farmer',
      email: 'john@example.com',
      password_hash: '$2a$10$example.hash.here',
      phone: '+91-9876543210',
      location: 'Punjab, India'
    },
    {
      name: 'Sarah Agriculture',
      email: 'sarah@example.com', 
      password_hash: '$2a$10$example.hash.here',
      phone: '+91-9876543211',
      location: 'Maharashtra, India'
    },
    {
      name: 'Mike Crops',
      email: 'mike@example.com',
      password_hash: '$2a$10$example.hash.here', 
      phone: '+91-9876543212',
      location: 'Karnataka, India'
    }
  ];

  for (const user of sampleUsers) {
    await connection.promise().execute(
      'INSERT INTO users (name, email, password_hash, phone, location) VALUES (?, ?, ?, ?, ?)',
      [user.name, user.email, user.password_hash, user.phone, user.location]
    );
  }
  
  console.log('Sample users inserted successfully!');
}

async function insertSampleAnalytics(connection) {
  const sampleAnalytics = [
    {
      user_id: null,
      total_revenue: 1250670,
      total_crops: 2340,
      healthy_crops_percentage: 87.5,
      disease_alerts: 12,
      analytics_type: 'dashboard_stats',
      time_period: 'current'
    },
    {
      user_id: null,
      total_revenue: 1150000,
      total_crops: 2200,
      healthy_crops_percentage: 85.2,
      disease_alerts: 15,
      analytics_type: 'dashboard_stats',
      time_period: 'previous'
    }
  ];

  for (const analytics of sampleAnalytics) {
    await connection.promise().execute(`
      INSERT INTO farm_analytics 
      (user_id, total_revenue, total_crops, healthy_crops_percentage, disease_alerts, analytics_type, time_period)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      analytics.user_id, analytics.total_revenue, analytics.total_crops,
      analytics.healthy_crops_percentage, analytics.disease_alerts, 
      analytics.analytics_type, analytics.time_period
    ]);
  }

  console.log('Sample analytics inserted successfully!');
}

// Run the initialization
if (require.main === module) {
  initializeDatabase().catch(console.error);
}

module.exports = { initializeDatabase };