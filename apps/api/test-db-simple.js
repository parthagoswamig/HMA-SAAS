const { Client } = require('pg');

// Parse the DATABASE_URL from your .env file
const DATABASE_URL = "postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?schema=public";

async function testConnection() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('🔄 Attempting to connect to Supabase database...');
    
    await client.connect();
    console.log('✅ Connected successfully to Supabase!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('📊 Database info:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('📋 Error details:', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      hostname: error.hostname,
      port: error.port
    });
    
    // Try alternative connection (Session mode - port 6543)
    console.log('\n🔄 Trying alternative connection (Session mode on port 6543)...');
    const sessionUrl = DATABASE_URL.replace(':5432/', ':6543/');
    
    const sessionClient = new Client({
      connectionString: sessionUrl,
    });
    
    try {
      await sessionClient.connect();
      console.log('✅ Session mode connection successful!');
      console.log('💡 Recommendation: Update your .env file to use port 6543 instead of 5432');
      await sessionClient.end();
    } catch (sessionError) {
      console.error('❌ Session mode also failed:', sessionError.message);
    }
    
  } finally {
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

testConnection();