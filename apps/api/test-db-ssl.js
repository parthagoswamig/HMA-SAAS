const { Client } = require('pg');

// Updated DATABASE_URL with SSL and session mode
const DATABASE_URL = "postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require";

async function testConnection() {
  console.log('🔄 Testing Supabase connection with SSL configuration...');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // This is needed for Supabase
    }
  });

  try {
    console.log('⏳ Connecting...');
    await client.connect();
    console.log('✅ Connected successfully to Supabase with SSL!');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, current_database() as database_name');
    console.log('📊 Connection successful!');
    console.log('   Current time:', result.rows[0].current_time);
    console.log('   Database:', result.rows[0].database_name);
    
    // Test if we can create a simple table (to verify write permissions)
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS test_connection (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log('✅ Write permissions confirmed - can create tables');
      
      // Clean up
      await client.query('DROP TABLE IF EXISTS test_connection');
      console.log('🧹 Cleanup completed');
      
    } catch (writeError) {
      console.log('⚠️  Write test failed (this might be expected):', writeError.message);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('📋 Full error details:', error);
    
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Check if your Supabase project is active and not paused');
    console.log('2. Verify the database password is correct');
    console.log('3. Check if your Supabase project has been migrated or updated');
    console.log('4. Try logging into Supabase dashboard to verify project status');
    
  } finally {
    try {
      await client.end();
      console.log('🔌 Connection closed');
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

testConnection();