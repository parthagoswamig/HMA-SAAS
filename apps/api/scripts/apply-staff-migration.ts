import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

async function applyStaffMigration() {
  console.log('Starting staff management migration...');
  
  // Load environment variables
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  try {
    // Create a Prisma client
    const prisma = new PrismaClient();
    
    // Test the database connection
    await prisma.$connect();
    console.log('✅ Connected to the database');
    
    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname, 
      '../prisma/migrations/20240910_add_staff_management_models.sql'
    );
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at ${migrationPath}`);
    }
    
    console.log('📄 Found migration file');
    
    // Execute the SQL migration
    console.log('🚀 Applying database migration...');
    
    // Use Prisma's executeRaw to run the SQL file
    const sql = fs.readFileSync(migrationPath, 'utf8');
    await prisma.$executeRawUnsafe(sql);
    
    console.log('✅ Database migration applied successfully');
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('✨ Staff management setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}

// Run the migration
applyStaffMigration().catch(console.error);
