
const { Pool } = require('pg');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test table access
    const result = await client.query('SELECT COUNT(*) FROM scans');
    console.log('📊 Scans table accessible, current count:', result.rows[0].count);
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();
