import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Creates default Admin role for existing tenants
 * This ensures backward compatibility with existing data
 */
export async function seedDefaultRolesForTenants() {
  console.log('🌱 Creating default roles for existing tenants...');
  
  try {
    // Get all active tenants using raw SQL to get actual database IDs
    const tenants = await prisma.$queryRaw<Array<{id: string, name: string, status: string}>>`
      SELECT id, name, status FROM tenants WHERE status = 'active'
    `;

    console.log(`Found ${tenants.length} active tenants`);

    // Get all permissions for full admin access
    const allPermissions = await prisma.permission.findMany({
      where: { isActive: true },
    });

    if (allPermissions.length === 0) {
      console.warn('⚠️  No permissions found. Please run permission seed first.');
      return;
    }

    for (const tenant of tenants) {
      console.log(`Processing tenant: ${tenant.name} (${tenant.id})`);
      console.log(`Tenant ID type: ${typeof tenant.id}, length: ${tenant.id.length}`);
      
      // Verify tenant exists with raw SQL
      const tenantCheck = await prisma.$queryRaw`SELECT id, name FROM tenants WHERE id = ${tenant.id}`;
      console.log(`Tenant check result:`, tenantCheck);
      
      if (!tenantCheck || (tenantCheck as any[]).length === 0) {
        console.error(`❌ Tenant ${tenant.id} not found in database! Skipping...`);
        continue;
      }

      // Create default Admin role for this tenant using raw SQL
      const roleId = `role_${tenant.id}_admin`;
      await prisma.$executeRaw`
        INSERT INTO tenant_roles (id, tenant_id, name, description, is_active, is_system, created_at, updated_at)
        VALUES (${roleId}, ${tenant.id}, 'Admin', 'Full administrative access to all features', true, true, NOW(), NOW())
        ON CONFLICT (tenant_id, name) DO UPDATE 
        SET description = EXCLUDED.description, is_active = EXCLUDED.is_active, updated_at = NOW()
      `;
      
      const adminRole = await prisma.tenantRole.findUnique({
        where: {
          tenantId_name: {
            tenantId: tenant.id,
            name: 'Admin',
          },
        },
      });
      
      if (!adminRole) {
        console.error(`❌ Failed to create Admin role for tenant ${tenant.name}`);
        continue;
      }

      // Assign all permissions to Admin role
      for (const permission of allPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: adminRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        });
      }

      console.log(`✅ Created Admin role with ${allPermissions.length} permissions for ${tenant.name}`);

      // Assign Admin role to existing ADMIN and HOSPITAL_ADMIN users
      const adminUsers = await prisma.user.findMany({
        where: {
          tenantId: tenant.id,
          role: {
            in: ['ADMIN', 'HOSPITAL_ADMIN'],
          },
          isActive: true,
        },
      });

      for (const user of adminUsers) {
        await prisma.$executeRaw`UPDATE users SET role_id = ${adminRole.id} WHERE id = ${user.id}::uuid`;
      }

      console.log(`✅ Assigned Admin role to ${adminUsers.length} admin users in ${tenant.name}`);
    }

    console.log('✅ Default role seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding default roles:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDefaultRolesForTenants()
    .then(() => {
      console.log('✅ Default role seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Default role seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
