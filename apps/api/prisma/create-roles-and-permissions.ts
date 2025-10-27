import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define all permissions
const permissions = [
  // Patient permissions
  { name: 'patient.view', description: 'View patients', category: 'patient' },
  { name: 'patient.create', description: 'Create patients', category: 'patient' },
  { name: 'patient.update', description: 'Update patients', category: 'patient' },
  { name: 'patient.delete', description: 'Delete patients', category: 'patient' },
  { name: 'PATIENT_READ', description: 'Read patient data', category: 'patient' },
  { name: 'PATIENT_CREATE', description: 'Create patient records', category: 'patient' },
  { name: 'PATIENT_UPDATE', description: 'Update patient records', category: 'patient' },
  { name: 'PATIENT_DELETE', description: 'Delete patient records', category: 'patient' },
  { name: 'VIEW_PATIENTS', description: 'View patient list', category: 'patient' },
  { name: 'UPDATE_PATIENTS', description: 'Update patient information', category: 'patient' },
  
  // Appointment permissions
  { name: 'appointment.view', description: 'View appointments', category: 'appointment' },
  { name: 'appointment.create', description: 'Create appointments', category: 'appointment' },
  { name: 'appointment.update', description: 'Update appointments', category: 'appointment' },
  { name: 'appointment.delete', description: 'Delete appointments', category: 'appointment' },
  
  // Staff permissions
  { name: 'staff.view', description: 'View staff', category: 'staff' },
  { name: 'staff.create', description: 'Create staff', category: 'staff' },
  { name: 'staff.update', description: 'Update staff', category: 'staff' },
  { name: 'staff.delete', description: 'Delete staff', category: 'staff' },
  
  // Billing permissions
  { name: 'billing.view', description: 'View billing', category: 'billing' },
  { name: 'billing.create', description: 'Create bills', category: 'billing' },
  { name: 'billing.update', description: 'Update bills', category: 'billing' },
  { name: 'billing.delete', description: 'Delete bills', category: 'billing' },
  
  // Laboratory permissions
  { name: 'lab.view', description: 'View lab orders', category: 'laboratory' },
  { name: 'lab.create', description: 'Create lab orders', category: 'laboratory' },
  { name: 'lab.update', description: 'Update lab orders', category: 'laboratory' },
  { name: 'lab.delete', description: 'Delete lab orders', category: 'laboratory' },
  
  // Pharmacy permissions
  { name: 'pharmacy.view', description: 'View pharmacy orders', category: 'pharmacy' },
  { name: 'pharmacy.create', description: 'Create pharmacy orders', category: 'pharmacy' },
  { name: 'pharmacy.update', description: 'Update pharmacy orders', category: 'pharmacy' },
  { name: 'pharmacy.delete', description: 'Delete pharmacy orders', category: 'pharmacy' },
];

async function createRolesAndPermissions() {
  try {
    console.log('🔧 Creating roles and permissions for all tenants...\n');

    // Step 1: Create all permissions (global)
    console.log('📋 Creating permissions...');
    for (const perm of permissions) {
      const existing = await prisma.permission.findFirst({
        where: { name: perm.name },
      });

      if (!existing) {
        await prisma.permission.create({
          data: {
            name: perm.name,
            description: perm.description,
            category: perm.category,
            isActive: true,
          },
        });
        console.log(`  ✅ Created permission: ${perm.name}`);
      } else {
        console.log(`  ⏭️  Permission already exists: ${perm.name}`);
      }
    }

    // Step 2: Get all tenants
    const tenants = await prisma.tenant.findMany({
      where: {
        isActive: true,
      },
    });

    console.log(`\n🏥 Found ${tenants.length} active tenants\n`);

    // Step 3: Create roles for each tenant
    for (const tenant of tenants) {
      console.log(`Processing tenant: ${tenant.name}`);

      // Check if ADMIN role exists
      let adminRole = await prisma.tenantRole.findFirst({
        where: {
          tenantId: tenant.id,
          name: 'ADMIN',
        },
      });

      if (!adminRole) {
        // Create ADMIN role
        adminRole = await prisma.tenantRole.create({
          data: {
            name: 'ADMIN',
            description: 'Administrator with full access',
            tenantId: tenant.id,
            isActive: true,
          },
        });
        console.log(`  ✅ Created ADMIN role`);

        // Assign all permissions to ADMIN role
        const allPermissions = await prisma.permission.findMany({
          where: { isActive: true },
        });

        for (const permission of allPermissions) {
          await prisma.rolePermission.create({
            data: {
              roleId: adminRole.id,
              permissionId: permission.id,
            },
          });
        }
        console.log(`  ✅ Assigned ${allPermissions.length} permissions to ADMIN role`);
      } else {
        console.log(`  ⏭️  ADMIN role already exists`);
      }

      // Create DOCTOR role
      let doctorRole = await prisma.tenantRole.findFirst({
        where: {
          tenantId: tenant.id,
          name: 'DOCTOR',
        },
      });

      if (!doctorRole) {
        doctorRole = await prisma.tenantRole.create({
          data: {
            name: 'DOCTOR',
            description: 'Doctor with patient and clinical access',
            tenantId: tenant.id,
            isActive: true,
          },
        });
        console.log(`  ✅ Created DOCTOR role`);

        // Assign relevant permissions to DOCTOR
        const doctorPermissionNames = [
          'patient.view', 'patient.create', 'patient.update',
          'PATIENT_READ', 'PATIENT_CREATE', 'PATIENT_UPDATE', 'VIEW_PATIENTS', 'UPDATE_PATIENTS',
          'appointment.view', 'appointment.create', 'appointment.update',
          'lab.view', 'lab.create', 'lab.update',
          'pharmacy.view', 'pharmacy.create', 'pharmacy.update',
        ];

        const doctorPermissions = await prisma.permission.findMany({
          where: {
            name: { in: doctorPermissionNames },
            isActive: true,
          },
        });

        for (const permission of doctorPermissions) {
          await prisma.rolePermission.create({
            data: {
              roleId: doctorRole.id,
              permissionId: permission.id,
            },
          });
        }
        console.log(`  ✅ Assigned ${doctorPermissions.length} permissions to DOCTOR role`);
      } else {
        console.log(`  ⏭️  DOCTOR role already exists`);
      }

      // Create RECEPTIONIST role
      let receptionistRole = await prisma.tenantRole.findFirst({
        where: {
          tenantId: tenant.id,
          name: 'RECEPTIONIST',
        },
      });

      if (!receptionistRole) {
        receptionistRole = await prisma.tenantRole.create({
          data: {
            name: 'RECEPTIONIST',
            description: 'Receptionist with patient and appointment access',
            tenantId: tenant.id,
            isActive: true,
          },
        });
        console.log(`  ✅ Created RECEPTIONIST role`);

        // Assign relevant permissions
        const receptionistPermissionNames = [
          'patient.view', 'patient.create', 'patient.update',
          'PATIENT_READ', 'PATIENT_CREATE', 'PATIENT_UPDATE', 'VIEW_PATIENTS', 'UPDATE_PATIENTS',
          'appointment.view', 'appointment.create', 'appointment.update',
          'billing.view',
        ];

        const receptionistPermissions = await prisma.permission.findMany({
          where: {
            name: { in: receptionistPermissionNames },
            isActive: true,
          },
        });

        for (const permission of receptionistPermissions) {
          await prisma.rolePermission.create({
            data: {
              roleId: receptionistRole.id,
              permissionId: permission.id,
            },
          });
        }
        console.log(`  ✅ Assigned ${receptionistPermissions.length} permissions to RECEPTIONIST role\n`);
      } else {
        console.log(`  ⏭️  RECEPTIONIST role already exists\n`);
      }
    }

    console.log('✅ All roles and permissions created successfully!');

  } catch (error) {
    console.error('❌ Error creating roles and permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createRolesAndPermissions()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
