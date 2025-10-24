const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hms_saas',
  password: 'Subha@123',
  port: 5432,
});

async function testConnection() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database!');
    const result = await client.query('SELECT 1 as test');
    console.log('Query result:', result.rows[0]);
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

testConnection();
