const { Pool } = require('pg');
require('dotenv').config();

// Parse the DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
console.log('Using database URL:', dbUrl);

const pool = new Pool({
  connectionString: dbUrl,
  connectionTimeoutMillis: 5000,
  query_timeout: 5000,
  statement_timeout: 5000,
});

async function testConnection() {
  const client = await pool.connect().catch(err => {
    console.error('❌ Connection error:', err.message);
    console.error('Error code:', err.code);
    process.exit(1);
  });

  try {
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // Check current database
    const dbResult = await client.query('SELECT current_database() as db, current_user as user');
    console.log('\nCurrent connection:');
    console.table(dbResult.rows);
    
    // List all databases
    const dbs = await client.query(`
      SELECT datname as "Database", 
             pg_size_pretty(pg_database_size(datname)) as "Size",
             datistemplate as "Is Template"
      FROM pg_database 
      ORDER BY datname
    `);
    
    console.log('\nAvailable databases:');
    console.table(dbs.rows);
    
    // Check if hms_saas exists
    const hmsDb = dbs.rows.find(db => db.Database === 'hms_saas');
    if (hmsDb) {
      console.log('\n✅ hms_saas database exists!');
      console.log('Size:', hmsDb.Size);
    } else {
      console.log('\n❌ hms_saas database does not exist');
    }
    
  } catch (err) {
    console.error('❌ Query error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testConnection();
