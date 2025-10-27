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

    for (const user of usersWithoutRoles) {
      if (!user.tenant) {
        console.log(`⚠️  User ${user.email} has no tenant, skipping...`);
        continue;
      }

      // Find or create ADMIN role for this tenant
      let adminRole = await prisma.tenantRole.findFirst({
        where: {
          tenantId: user.tenantId,
          name: 'ADMIN',
        },
      });

      if (!adminRole) {
        console.log(`Creating ADMIN role for tenant: ${user.tenant.name}`);
        
        // Create ADMIN role
        adminRole = await prisma.tenantRole.create({
          data: {
            name: 'ADMIN',
            description: 'Administrator with full access',
            tenantId: user.tenantId,
            isActive: true,
          },
        });

        // Get all permissions
        const allPermissions = await prisma.permission.findMany({
          where: {
            isActive: true,
          },
        });

        // Assign all permissions to ADMIN role
        for (const permission of allPermissions) {
          await prisma.rolePermission.create({
            data: {
              roleId: adminRole.id,
              permissionId: permission.id,
            },
          });
        }

        console.log(`✅ Created ADMIN role with ${allPermissions.length} permissions`);
      }

      // Assign role to user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          roleId: adminRole.id,
        },
      });

      console.log(`✅ Assigned ADMIN role to user: ${user.email}\n`);
    }

    console.log('✅ All users have been assigned roles!');
  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixUserRoles()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
