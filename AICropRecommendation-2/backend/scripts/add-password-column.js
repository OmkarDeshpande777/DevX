// PostgreSQL removed. Ready for MySQL migration.
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'AgriNova',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || 'post123'
});

async function addPasswordColumn() {
  try {
    // Check if password_hash column exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password_hash'
    `;
    
    const result = await pool.query(checkColumnQuery);
    
    if (result.rows.length === 0) {
      console.log('Adding password_hash column to users table...');
      
      const addColumnQuery = `
        ALTER TABLE users 
        ADD COLUMN password_hash VARCHAR(255);
      `;
      
      await pool.query(addColumnQuery);
      console.log('✅ password_hash column added successfully!');
    } else {
      console.log('ℹ️ password_hash column already exists');
    }
    
    // Check current table structure
    const describeQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    const tableStructure = await pool.query(describeQuery);
    console.log('\n📋 Current users table structure:');
    tableStructure.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type}) - ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating users table:', error);
  } finally {
    await pool.end();
  }
}

addPasswordColumn();