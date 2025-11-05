const { Client } = require('pg');

// Your database details
const baseConfig = {
  user: 'postgres.uoxyyqbwuzjraxhaypko',
  password: '9800975588pG',
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres'
};

// Test different SSL configurations
const sslConfigs = [
  {
    name: 'SSL with rejectUnauthorized: false',
    config: {
      ...baseConfig,
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'SSL require mode',
    config: {
      ...baseConfig,
      ssl: 'require'
    }
  },
  {
    name: 'SSL prefer mode',
    config: {
      ...baseConfig,
      ssl: 'prefer'
    }
  },
  {
    name: 'Connection string with sslmode=require',
    connectionString: 'postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require'
  },
  {
    name: 'Session mode (port 6543) with SSL',
    connectionString: 'postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require'
  }
];

async function testConnection(testConfig) {
  const { name, config, connectionString } = testConfig;
  console.log(`\\n🔄 Testing: ${name}`);
  
  const client = new Client(connectionString ? { connectionString } : config);
  
  try {
    await client.connect();
    console.log(`✅ ${name}: SUCCESS`);
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`   Connected at: ${result.rows[0].current_time}`);
    
    return true;
  } catch (error) {
    console.log(`❌ ${name}: FAILED`);
    console.log(`   Error: ${error.message}`);
    if (error.code) console.log(`   Code: ${error.code}`);
    return false;
  } finally {
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

async function testAllConfigurations() {
  console.log('🚀 Testing different SSL configurations for Supabase...\\n');
  
  let successCount = 0;
  
  for (const testConfig of sslConfigs) {
    const success = await testConnection(testConfig);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log(`\\n📊 Results: ${successCount}/${sslConfigs.length} configurations worked`);
  
  if (successCount === 0) {
    console.log('\\n❌ All SSL configurations failed. This might indicate:');
    console.log('1. Your Supabase project is paused or inactive');
    console.log('2. Network connectivity issues');
    console.log('3. Incorrect credentials');
    console.log('4. Firewall blocking the connection');
    console.log('\\n💡 Please check your Supabase dashboard at https://app.supabase.com');
  } else {
    console.log('\\n✅ At least one configuration worked! Use the successful one in your .env file.');
  }
}

testAllConfigurations();