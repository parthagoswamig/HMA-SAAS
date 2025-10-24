const { Pool } = require('pg');
require('dotenv').config();

// First try with the hms_saas database
async function testConnection(database = 'hms_saas') {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: database,
    password: 'Subha@123',
    port: 5432,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log(`Testing connection to database: ${database}`);
    const client = await pool.connect();
    const result = await client.query('SELECT current_database(), current_user');
    console.log('✅ Connection successful!');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    return true;
  } catch (error) {
    console.error(`❌ Failed to connect to ${database}:`);
    console.error(error.message);
    return false;
  } finally {
    await pool.end();
  }
}

async function main() {
  // First try connecting to hms_saas
  const hmsSaasConnected = await testConnection('hms_saas');
  
  if (!hmsSaasConnected) {
    console.log('\nTrying to connect to default postgres database...');
    const postgresConnected = await testConnection('postgres');
    
    if (!postgresConnected) {
      console.log('\n❌ Could not connect to any database. Please check:');
      console.log('1. Is PostgreSQL service running?');
      console.log('2. Are the username and password correct?');
      console.log('3. Is the port number correct? (default is 5432)');
      console.log('4. Is the database name correct?');
    } else {
      console.log('\n✅ Connected to postgres database. The hms_saas database might not exist.');
      console.log('You may need to create it with: CREATE DATABASE hms_saas;');
    }
  }
}

main();
