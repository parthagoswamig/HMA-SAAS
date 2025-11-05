import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Clean Database Seed Script
 * 
 * This script is intentionally empty to ensure a fresh, clean system.
 * No demo data, test users, or sample records will be created.
 * 
 * For initial setup:
 * 1. Run migrations: npm run prisma:migrate
 * 2. Use the application's admin registration feature to create your first user
 * 3. Configure your tenant through the application UI
 */
async function main() {
  console.log('✅ Database is clean and ready for production use.');
  console.log('📝 No seed data has been inserted.');
  console.log('🚀 Create your first admin user through the application registration.');
}

main()
  .catch((e) => {
    console.error('Error during seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
