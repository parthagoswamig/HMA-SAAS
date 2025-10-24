const { PrismaClient } = require('@prisma/client');

async function listTables() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // List all tables in the public schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('\n📋 Available tables:');
    console.table(tables);
    
    // Check if patients table exists
    const patientsTable = tables.some(t => t.table_name === 'patients');
    console.log('\n🔍 Patients table exists:', patientsTable);
    
    if (patientsTable) {
      console.log('\n🔍 Checking patients table structure...');
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'patients'
      `;
      console.table(columns);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nDisconnected from database');
  }
}

listTables()
  .catch(console.error)
  .finally(() => process.exit(0));
