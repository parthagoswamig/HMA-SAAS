import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
    process.exit(1);
  }

  console.log('🔌 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('📄 Reading migration file...');
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found at: ${migrationPath}`);
      process.exit(1);
    }
    
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    
    if (!migrationSql) {
      console.error('❌ Migration file is empty');
      process.exit(1);
    }

    console.log('🚀 Running migration...');
    
    // Split SQL into individual statements
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement one by one
    for (const [index, statement] of statements.entries()) {
      try {
        console.log(`  🔄 Executing statement ${index + 1}/${statements.length}...`);
        const { data, error } = await supabase.rpc('pgmigrate', {
          sql: statement + ';'
        });

        if (error) {
          console.error(`❌ Error in statement ${index + 1}:`, error);
          console.error('Failed statement:', statement);
          process.exit(1);
        }
        
        console.log(`  ✅ Statement ${index + 1} executed successfully`);
      } catch (error) {
        console.error(`❌ Failed to execute statement ${index + 1}:`, error);
        process.exit(1);
      }
    }

    console.log('✨ Migration completed successfully!');
    console.log('✅ Database schema has been updated');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(console.error);
