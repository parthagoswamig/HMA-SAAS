import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as pg from 'pg';

async function runMigrations() {
  console.log('Starting database migrations...');
  
  // Parse DATABASE_URL
  const dbUrl = new URL(process.env.DATABASE_URL || '');
  const username = dbUrl.username;
  const password = dbUrl.password;
  const database = dbUrl.pathname.replace(/^\//, '');
  const host = dbUrl.hostname;
  const port = parseInt(dbUrl.port || '5432', 10);

  console.log('Database connection details:', {
    host,
    port,
    database,
    username,
    password: password ? '***' : 'not set'
  });

  // Create a new DataSource instance
  const dataSource = new DataSource({
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    entities: [path.join(__dirname, '../src/**/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, '../src/database/migrations/*{.ts,.js}')],
    migrationsRun: false,
    synchronize: false,
    logging: true,
  });

  try {
    // Initialize the data source
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    // Run migrations
    console.log('Running migrations...');
    await dataSource.runMigrations();
    console.log('Migrations have been run successfully!');
    
    // Show the migrations table
    const queryRunner = dataSource.createQueryRunner();
    const migrations = await queryRunner.query(
      'SELECT * FROM migrations ORDER BY timestamp DESC;'
    );
    
    console.log('\nApplied migrations:');
    if (migrations && migrations.length > 0) {
      console.table(migrations);
    } else {
      console.log('No migrations found in the migrations table.');
    }
    
  } catch (error) {
    console.error('Error during migration:', error);
    
    // Try to connect directly to the database to check if it's accessible
    try {
      console.log('\nAttempting to connect to the database directly...');
      const client = new pg.Client({
        host,
        port,
        user: username,
        password,
        database,
      });
      
      await client.connect();
      console.log('Successfully connected to the database!');
      
      // Check if the database exists
      const dbCheck = await client.query(
        'SELECT datname FROM pg_database WHERE datname = $1', 
        [database]
      );
      
      if (dbCheck.rows.length === 0) {
        console.error(`\nError: Database '${database}' does not exist.`);
        console.log('Available databases:');
        const allDbs = await client.query(
          'SELECT datname FROM pg_database WHERE datistemplate = false;'
        );
        console.table(allDbs.rows);
      } else {
        console.log(`\nDatabase '${database}' exists.`);
        
        // Check if the migrations table exists
        try {
          const migrationsTable = await client.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'migrations';"
          );
          
          if (migrationsTable.rows.length === 0) {
            console.log("Migrations table does not exist. It will be created when you run your first migration.");
          } else {
            console.log("Migrations table exists. Listing migrations:");
            const migrations = await client.query('SELECT * FROM migrations ORDER BY timestamp DESC;');
            console.table(migrations.rows);
          }
        } catch (tableError) {
          console.error('Error checking migrations table:', tableError);
        }
      }
      
      await client.end();
    } catch (dbError) {
      console.error('Failed to connect to database:', dbError);
    }
    
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\nDatabase connection closed.');
    }
  }
}

runMigrations().catch(error => {
  console.error('Fatal error during migration:', error);
  process.exit(1);
});
