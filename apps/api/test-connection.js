const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    // Test the connection with a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!');
    console.log('Test query result:', result);
    
    // Check if the database exists
    const dbExists = await prisma.$queryRaw`SELECT 1 FROM pg_database WHERE datname = 'hms_saas'`;
    if (dbExists.length > 0) {
      console.log('✅ hms_saas database exists');
    } else {
      console.log('❌ hms_saas database does not exist');
    }
    
    // List all databases (if possible)
    try {
      const dbs = await prisma.$queryRaw`SELECT datname FROM pg_database`;
      console.log('\nAvailable databases:');
      console.table(dbs);
    } catch (e) {
      console.log('\nCould not list databases (permission issue)');
    }
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.meta) {
      console.error('Error meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
