// PostgreSQL removed. Ready for MySQL migration.
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'AgriNova',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD
});

async function addMissingColumns() {
  try {
    // Check and add image_url column to disease_detections table
    const checkImageUrlColumn = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'disease_detections' AND column_name = 'image_url'
    `;
    
    const result = await pool.query(checkImageUrlColumn);
    
    if (result.rows.length === 0) {
      console.log('Adding image_url column to disease_detections table...');
      
      const addImageUrlQuery = `
        ALTER TABLE disease_detections 
        ADD COLUMN image_url TEXT;
      `;
      
      await pool.query(addImageUrlQuery);
      console.log('✅ image_url column added successfully!');
    } else {
      console.log('ℹ️ image_url column already exists');
    }
    
    // Check and add other missing columns that might be needed
    const missingColumns = [
      { name: 'disease_description', type: 'TEXT' },
      { name: 'treatment_recommendations', type: 'TEXT[]' },
      { name: 'supplements_recommended', type: 'TEXT[]' },
      { name: 'severity', type: 'VARCHAR(20) DEFAULT \'medium\'' },
      { name: 'location_lat', type: 'DECIMAL(10,6)' },
      { name: 'location_lng', type: 'DECIMAL(10,6)' },
      { name: 'weather_conditions', type: 'JSONB' }
    ];
    
    for (const col of missingColumns) {
      const checkQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'disease_detections' AND column_name = '${col.name}'
      `;
      
      const colResult = await pool.query(checkQuery);
      
      if (colResult.rows.length === 0) {
        console.log(`Adding ${col.name} column to disease_detections table...`);
        
        const addQuery = `ALTER TABLE disease_detections ADD COLUMN ${col.name} ${col.type}`;
        await pool.query(addQuery);
        console.log(`✅ ${col.name} column added successfully!`);
      } else {
        console.log(`ℹ️ ${col.name} column already exists`);
      }
    }
    
    // Show current table structure
    const describeQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'disease_detections'
      ORDER BY ordinal_position
    `;
    
    const tableStructure = await pool.query(describeQuery);
    console.log('\n📋 Current disease_detections table structure:');
    tableStructure.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type}) - ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating disease_detections table:', error);
  } finally {
    await pool.end();
  }
}

addMissingColumns();