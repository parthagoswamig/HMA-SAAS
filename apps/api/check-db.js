const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connection test successful:', result);
    
    // Check if database exists
    const dbCheck = await prisma.$queryRaw`SELECT datname FROM pg_database WHERE datname = 'hms_saas'`;
    
    if (dbCheck.length > 0) {
      console.log('✅ hms_saas database exists');
      
      // List tables in the database
      try {
        const tables = await prisma.$queryRaw`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `;
        console.log('\nTables in hms_saas database:');
        console.table(tables);
      } catch (e) {
        console.log('\nCould not list tables (might be empty):', e.message);
      }
    } else {
      console.log('❌ hms_saas database does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    
    if (error.code) console.error('Code:', error.code);
    if (error.meta) console.error('Meta:', error.meta);
    
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
