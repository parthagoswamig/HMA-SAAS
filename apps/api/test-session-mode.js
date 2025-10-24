const { Client } = require('pg');

// Test Session Mode (port 6543) which should work better with Prisma
const sessionModeUrl = "postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public&sslmode=require&connect_timeout=60&application_name=HMS_API";

async function testSessionMode() {
  console.log('🔄 Testing Supabase Session Mode (Port 6543)...');
  console.log('💡 Session mode provides better compatibility with ORMs like Prisma');
  
  const client = new Client({
    connectionString: sessionModeUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000, // 30 second timeout
  });
  
  try {
    console.log('⏳ Connecting to Session Mode...');
    await client.connect();
    console.log('✅ Session Mode connection successful!');
    
    // Test basic queries
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('📊 Current time:', timeResult.rows[0].current_time);
    
    const versionResult = await client.query('SELECT version() as version');
    console.log('📊 PostgreSQL version:', versionResult.rows[0].version.split(' ')[0]);
    
    // Test schema access
    const schemaResult = await client.query('SELECT current_schema() as schema');
    console.log('📊 Current schema:', schemaResult.rows[0].schema);
    
    console.log('\\n🎉 Session Mode is working perfectly!');
    console.log('💡 This should resolve the Prisma connection issues');
    
    return true;
    
  } catch (error) {
    console.error('❌ Session Mode failed:', error.message);
    
    if (error.message.includes('timeout')) {
      console.log('\\n🔧 Timeout Issue:');
      console.log('1. This might be a temporary network issue');
      console.log('2. Try again in a few minutes');
      console.log('3. Check if your internet connection is stable');
    } else if (error.message.includes('SSL')) {
      console.log('\\n🔧 SSL Issue:');
      console.log('1. SSL configuration might need adjustment');
      console.log('2. Supabase requires SSL connections');
    } else {
      console.log('\\n🔧 Other Issue:');
      console.log('1. Check Supabase project status');
      console.log('2. Verify credentials are correct');
      console.log('3. Ensure project is not paused');
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
}

// Also test with the PrismaClient to make sure it works
async function testPrismaWithSessionMode() {
  console.log('\\n🔄 Testing Prisma with Session Mode...');
  
  try {
    // Set the environment variable for this test
    process.env.DATABASE_URL = sessionModeUrl;
    
    const { PrismaClient } = require('@prisma/client');
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: sessionModeUrl
        }
      },
      log: ['error', 'warn']
    });
    
    console.log('⏳ Testing Prisma connection...');
    await prisma.$connect();
    console.log('✅ Prisma connected successfully with Session Mode!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('📊 Prisma query result:', result[0].current_time);
    
    await prisma.$disconnect();
    console.log('🔌 Prisma disconnected');
    
    return true;
    
  } catch (error) {
    console.error('❌ Prisma with Session Mode failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Testing Supabase Session Mode Configuration...\\n');
  
  const sessionResult = await testSessionMode();
  const prismaResult = await testPrismaWithSessionMode();
  
  console.log('\\n📝 Final Results:');
  console.log('   Session Mode (pg):', sessionResult ? '✅ PASSED' : '❌ FAILED');
  console.log('   Prisma Client:', prismaResult ? '✅ PASSED' : '❌ FAILED');
  
  if (sessionResult && prismaResult) {
    console.log('\\n🎉 Perfect! Your database is ready!');
    console.log('💡 Your NestJS API should now connect successfully');
    console.log('🚀 You can restart your backend server');
  } else if (sessionResult && !prismaResult) {
    console.log('\\n⚠️  Session mode works but Prisma needs adjustment');
    console.log('💡 The connection itself is fine, just Prisma configuration needs tweaking');
  } else {
    console.log('\\n❌ Connection issues persist');
    console.log('💡 Please check your Supabase project status');
  }
}

runAllTests();