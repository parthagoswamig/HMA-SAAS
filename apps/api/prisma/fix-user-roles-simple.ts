import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserRoles() {
  try {
    console.log('🔧 Fixing user roles...\n');

    // Get all users without roles
    const usersWithoutRoles = await prisma.user.findMany({
      where: {
        roleId: null,
      },
      include: {
        tenant: true,
      },
    });

    console.log(`Found ${usersWithoutRoles.length} users without roles\n`);

    if (usersWithoutRoles.length === 0) {
      console.log('✅ All users already have roles assigned!');
      return;
    }

    for (const user of usersWithoutRoles) {
      if (!user.tenant || !user.tenantId) {
        console.log(`⚠️  User ${user.email} has no tenant, skipping...`);
        continue;
      }

      console.log(`Processing user: ${user.email} (Tenant: ${user.tenant.name})`);

      // Find any existing role for this tenant (prefer ADMIN)
      let tenantRole = await prisma.tenantRole.findFirst({
        where: {
          tenantId: user.tenantId,
          name: 'ADMIN',
          isActive: true,
        },
      });

      // If no ADMIN role, find any active role
      if (!tenantRole) {
        console.log(`  No ADMIN role found, looking for any role...`);
        tenantRole = await prisma.tenantRole.findFirst({
          where: {
            tenantId: user.tenantId,
            isActive: true,
          },
        });
      }

      if (!tenantRole) {
        console.log(`  ⚠️  No roles exist for tenant ${user.tenant.name}, skipping...`);
        console.log(`  💡 You need to create roles for this tenant first!\n`);
        continue;
      }

      // Assign role to user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          roleId: tenantRole.id,
        },
      });

      console.log(`  ✅ Assigned role "${tenantRole.name}" to user: ${user.email}\n`);
    }

    console.log('✅ Done! Checking results...\n');

    // Show final status
    const stillWithoutRoles = await prisma.user.count({
      where: {
        roleId: null,
      },
    });

    const withRoles = await prisma.user.count({
      where: {
        roleId: {
          not: null,
        },
      },
    });

    console.log(`📊 Final Status:`);
    console.log(`   Users with roles: ${withRoles}`);
    console.log(`   Users without roles: ${stillWithoutRoles}`);

    if (stillWithoutRoles > 0) {
      console.log(`\n⚠️  ${stillWithoutRoles} users still don't have roles.`);
      console.log(`   This is likely because their tenants don't have any roles created yet.`);
      console.log(`   Please create roles for those tenants first.`);
    }

  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixUserRoles()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
