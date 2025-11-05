const { Client } = require('pg');

// Your corrected DATABASE_URL
const DATABASE_URL = "postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?schema=public&sslmode=require";

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase connection with your DATABASE_URL...');
  console.log('📍 Using SSL with rejectUnauthorized: false (required for Supabase)');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false  // Required for Supabase SSL certificates
    }
  });

  try {
    console.log('⏳ Attempting connection...');
    await client.connect();
    console.log('✅ Successfully connected to Supabase database!');
    
    // Test basic query
    const result = await client.query(`
      SELECT 
        NOW() as current_time, 
        current_database() as database_name,
        current_user as current_user,
        version() as postgres_version
    `);
    
    console.log('📊 Connection Details:');
    console.log('   Database:', result.rows[0].database_name);
    console.log('   User:', result.rows[0].current_user);
    console.log('   Time:', result.rows[0].current_time);
    console.log('   PostgreSQL:', result.rows[0].postgres_version.split(' ')[0]);
    
    // Test if we can query existing tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 10
    `);
    
    console.log('📋 Available tables:', tablesResult.rows.length);
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log('   - ' + row.table_name);
      });
    } else {
      console.log('   No tables found in public schema');
    }
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    
    // Provide specific troubleshooting based on error
    if (error.message.includes('SSL')) {
      console.log('\n🔧 SSL Issue - This might help:');
      console.log('1. SSL is required for Supabase connections');
      console.log('2. Make sure your Supabase project is not paused');
    } else if (error.message.includes('password')) {
      console.log('\n🔧 Authentication Issue:');
      console.log('1. Check if your database password is correct');
      console.log('2. Verify your Supabase project credentials');
    } else if (error.message.includes('timeout') || error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 Network Issue:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the Supabase server is accessible');
      console.log('3. Check if your firewall is blocking the connection');
    }
    
    return false;
  } finally {
    try {
      await client.end();
      console.log('🔌 Connection closed');
    } catch (e) {
      // Ignore cleanup errors
    }
  }
  
  return true;
}

// Also test with Prisma's expected format
async function testPrismaCompatibility() {
  console.log('\n🔄 Testing Prisma compatibility...');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('⏳ Testing Prisma connection...');
    await prisma.$connect();
    console.log('✅ Prisma connected successfully!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('📊 Prisma query successful:', result[0].current_time);
    
    await prisma.$disconnect();
    console.log('🔌 Prisma disconnected');
    
    return true;
  } catch (error) {
    console.error('❌ Prisma connection failed:', error.message);
    return false;
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting database connection tests...\n');
  
  const pgResult = await testSupabaseConnection();
  const prismaResult = await testPrismaCompatibility();
  
  console.log('\n📝 Test Results:');
  console.log('   PostgreSQL Client:', pgResult ? '✅ PASSED' : '❌ FAILED');
  console.log('   Prisma Client:', prismaResult ? '✅ PASSED' : '❌ FAILED');
  
  if (pgResult && prismaResult) {
    console.log('\n🎉 All tests passed! Your database connection is working correctly.');
    console.log('💡 You can now start your NestJS server.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

runAllTests();