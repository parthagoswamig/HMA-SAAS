import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Comprehensive Seed Script - DISABLED
 * 
 * This script has been cleared to ensure a factory-fresh, clean system.
 * All demo data including:
 * - Demo users (admin, doctors)
 * - Sample patients
 * - Test departments
 * - Sample medications
 * 
 * Have been removed to provide a clean production environment.
 * 
 * For initial setup, use the application's built-in:
 * - Admin registration
 * - Department creation UI
 * - User management
 */
async function main() {
  console.log('✅ Comprehensive seed script bypassed.');
  console.log('🧼 Database remains clean - no demo data inserted.');
  console.log('🏭 System is ready for first-time setup through the application.');
}

main()
  .catch((e) => {
    console.error('Error during comprehensive seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });