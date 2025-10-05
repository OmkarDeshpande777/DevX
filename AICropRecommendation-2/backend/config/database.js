
const mysql = require('mysql2/promise');

// MySQL Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'AgriNova',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  connectionLimit: 20, // Maximum number of connections in the pool
  charset: 'utf8mb4',
  ssl: false
};

// Debug: Log the configuration (without password)
console.log('MySQL Database Configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password ? '[SET]' : '[NOT SET]'
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('SELECT NOW() as now');
    connection.release();
    console.log('MySQL connection test successful:', result[0]);
    return true;
  } catch (error) {
    console.error('MySQL connection test failed:', error.message);
    throw error;
  }
};

// Execute query with error handling
const query = async (text, params = []) => {
  try {
    const [rows] = await pool.execute(text, params);
    return { rows };
  } catch (error) {
    console.error('MySQL query error:', error.message);
    throw error;
  }
};

// Transaction wrapper
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('MySQL transaction error:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

// Graceful shutdown
const shutdown = async () => {
  try {
    await pool.end();
    console.log('MySQL pool closed');
  } catch (error) {
    console.error('Error closing MySQL pool:', error.message);
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  shutdown
};
