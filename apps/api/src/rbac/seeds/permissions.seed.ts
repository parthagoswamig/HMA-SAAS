import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const permissions = [
  // Tenant Management
  { name: 'tenant.manage', category: 'tenant', description: 'Manage tenant settings' },
  
  // User Management
  { name: 'user.read', category: 'user', description: 'View users' },
  { name: 'user.create', category: 'user', description: 'Create users' },
  { name: 'user.update', category: 'user', description: 'Update users' },
  { name: 'user.delete', category: 'user', description: 'Delete users' },
  
  // Patient Management
  { name: 'patient.read', category: 'patient', description: 'View patients' },
  { name: 'patient.create', category: 'patient', description: 'Create patients' },
  { name: 'patient.update', category: 'patient', description: 'Update patients' },
  { name: 'patient.delete', category: 'patient', description: 'Delete patients' },
  
  // Appointment Management
  { name: 'appointment.read', category: 'appointment', description: 'View appointments' },
  { name: 'appointment.create', category: 'appointment', description: 'Create appointments' },
  { name: 'appointment.update', category: 'appointment', description: 'Update appointments' },
  { name: 'appointment.delete', category: 'appointment', description: 'Delete appointments' },
  
  // Invoice/Billing Management
  { name: 'invoice.read', category: 'billing', description: 'View invoices' },
  { name: 'invoice.create', category: 'billing', description: 'Create invoices' },
  { name: 'invoice.update', category: 'billing', description: 'Update invoices' },
  { name: 'invoice.delete', category: 'billing', description: 'Delete invoices' },
  
  // Doctor Management
  { name: 'doctor.read', category: 'doctor', description: 'View doctors' },
  { name: 'doctor.create', category: 'doctor', description: 'Create doctors' },
  { name: 'doctor.update', category: 'doctor', description: 'Update doctors' },
  { name: 'doctor.delete', category: 'doctor', description: 'Delete doctors' },
  
  // Pharmacy Management
  { name: 'pharmacy.read', category: 'pharmacy', description: 'View pharmacy items' },
  { name: 'pharmacy.create', category: 'pharmacy', description: 'Create pharmacy items' },
  { name: 'pharmacy.update', category: 'pharmacy', description: 'Update pharmacy items' },
  { name: 'pharmacy.delete', category: 'pharmacy', description: 'Delete pharmacy items' },
  
  // Inventory Management
  { name: 'inventory.read', category: 'inventory', description: 'View inventory' },
  { name: 'inventory.create', category: 'inventory', description: 'Create inventory items' },
  { name: 'inventory.update', category: 'inventory', description: 'Update inventory items' },
  { name: 'inventory.delete', category: 'inventory', description: 'Delete inventory items' },
  
  // Lab Test Management
  { name: 'labtest.read', category: 'laboratory', description: 'View lab tests' },
  { name: 'labtest.create', category: 'laboratory', description: 'Create lab tests' },
  { name: 'labtest.update', category: 'laboratory', description: 'Update lab tests' },
  { name: 'labtest.delete', category: 'laboratory', description: 'Delete lab tests' },
  
  // Prescription Management
  { name: 'prescription.read', category: 'prescription', description: 'View prescriptions' },
  { name: 'prescription.create', category: 'prescription', description: 'Create prescriptions' },
  { name: 'prescription.update', category: 'prescription', description: 'Update prescriptions' },
  { name: 'prescription.delete', category: 'prescription', description: 'Delete prescriptions' },
  
  // Medical Records
  { name: 'medicalrecord.read', category: 'medical', description: 'View medical records' },
  { name: 'medicalrecord.create', category: 'medical', description: 'Create medical records' },
  { name: 'medicalrecord.update', category: 'medical', description: 'Update medical records' },
  { name: 'medicalrecord.delete', category: 'medical', description: 'Delete medical records' },
  
  // Audit Logs
  { name: 'audit.read', category: 'audit', description: 'View audit logs' },
  
  // Reports
  { name: 'report.read', category: 'report', description: 'View reports' },
  { name: 'report.generate', category: 'report', description: 'Generate reports' },
];

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || 'default';

async function seedPermissions() {
  console.log('🌱 Seeding permissions...');
  
  // Create all permissions
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description, category: perm.category },
      create: perm,
    });
  }
  console.log(`✅ Created ${permissions.length} permissions`);

  // Create super_admin role
  const superAdminRole = await prisma.tenantRole.upsert({
    where: { 
      tenantId_name: { 
        tenantId: DEFAULT_TENANT_ID, 
        name: 'super_admin' 
      } 
    },
    update: {},
    create: {
      name: 'super_admin',
      description: 'Super Administrator with all permissions',
      tenantId: DEFAULT_TENANT_ID,
      isSystem: true,
    },
  });
  console.log('✅ Created super_admin role');

  // Assign all permissions to super_admin
  const allPermissions = await prisma.permission.findMany();
  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { 
        roleId_permissionId: { 
          roleId: superAdminRole.id, 
          permissionId: p.id 
        } 
      },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: p.id },
    });
  }
  console.log(`✅ Assigned ${allPermissions.length} permissions to super_admin`);

  // Create admin role with most permissions (excluding tenant.manage)
  const adminRole = await prisma.tenantRole.upsert({
    where: { 
      tenantId_name: { 
        tenantId: DEFAULT_TENANT_ID, 
        name: 'admin' 
      } 
    },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with most permissions',
      tenantId: DEFAULT_TENANT_ID,
      isSystem: true,
    },
  });
  
  const adminPermissions = allPermissions.filter(p => p.name !== 'tenant.manage');
  for (const p of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: { 
        roleId_permissionId: { 
          roleId: adminRole.id, 
          permissionId: p.id 
        } 
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: p.id },
    });
  }
  console.log(`✅ Created admin role with ${adminPermissions.length} permissions`);

  // Create staff role with read/create/update permissions
  const staffRole = await prisma.tenantRole.upsert({
    where: { 
      tenantId_name: { 
        tenantId: DEFAULT_TENANT_ID, 
        name: 'staff' 
      } 
    },
    update: {},
    create: {
      name: 'staff',
      description: 'Staff with limited permissions',
      tenantId: DEFAULT_TENANT_ID,
      isSystem: true,
    },
  });
  
  const staffPermissions = allPermissions.filter(p => 
    p.name.endsWith('.read') || 
    p.name.endsWith('.create') || 
    p.name.endsWith('.update')
  );
  for (const p of staffPermissions) {
    await prisma.rolePermission.upsert({
      where: { 
        roleId_permissionId: { 
          roleId: staffRole.id, 
          permissionId: p.id 
        } 
      },
      update: {},
      create: { roleId: staffRole.id, permissionId: p.id },
    });
  }
  console.log(`✅ Created staff role with ${staffPermissions.length} permissions`);

  console.log('\n🎉 Permissions seeded successfully!');
}

seedPermissions()
  .catch((e) => {
    console.error('❌ Error seeding permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
