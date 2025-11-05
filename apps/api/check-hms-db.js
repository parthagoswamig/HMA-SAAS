const { Pool } = require('pg');
require('dotenv').config();

// Connect to the default 'postgres' database first
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Partha@123',
  port: 5432,
});

async function checkHmsDatabase() {
  const client = await pool.connect().catch(err => {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  });

  try {
    console.log('✅ Connected to PostgreSQL server');
    
    // Check if hms_saas database exists
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'hms_saas'"
    );
    
    if (dbCheck.rows.length > 0) {
      console.log('✅ hms_saas database exists');
      
      // Try to connect to hms_saas
      console.log('\nAttempting to connect to hms_saas...');
      await client.query('\connect hms_saas');
      
      // List tables if connection is successful
      const tables = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      
      if (tables.rows.length > 0) {
        console.log('\nTables in hms_saas:');
        console.table(tables.rows);
      } else {
        console.log('\nNo tables found in hms_saas (database is empty)');
      }
    } else {
      console.log('❌ hms_saas database does not exist');
      console.log('\nCreating hms_saas database...');
      await client.query('CREATE DATABASE hms_saas');
      console.log('✅ Created hms_saas database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkHmsDatabase();
