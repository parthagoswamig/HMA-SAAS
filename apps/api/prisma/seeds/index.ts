import { PrismaClient } from '@prisma/client';
import { seedPermissions } from './permissions.seed';
import { seedDefaultRolesForTenants } from './default-roles.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting RBAC database seeding...\n');

  try {
    // Step 1: Seed permissions (idempotent)
    console.log('Step 1: Seeding permissions...');
    await seedPermissions();
    console.log('');

    // Step 2: Create default roles for existing tenants
    console.log('Step 2: Creating default roles for tenants...');
    await seedDefaultRolesForTenants();
    console.log('');

    console.log('✅ All RBAC seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('\n🎉 Database seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Database seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
