import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Define all system permissions
const SYSTEM_PERMISSIONS = [
  // Patient Management
  { name: 'patient.view', description: 'View patient records', category: 'patient' },
  { name: 'patient.create', description: 'Create new patients', category: 'patient' },
  { name: 'patient.update', description: 'Update patient information', category: 'patient' },
  { name: 'patient.delete', description: 'Delete patient records', category: 'patient' },
  { name: 'patient.export', description: 'Export patient data', category: 'patient' },
  
  // Appointment Management
  { name: 'appointment.view', description: 'View appointments', category: 'appointment' },
  { name: 'appointment.create', description: 'Create appointments', category: 'appointment' },
  { name: 'appointment.update', description: 'Update appointments', category: 'appointment' },
  { name: 'appointment.delete', description: 'Cancel appointments', category: 'appointment' },
  { name: 'appointment.approve', description: 'Approve appointment requests', category: 'appointment' },
  
  // Billing & Finance
  { name: 'billing.view', description: 'View billing information', category: 'billing' },
  { name: 'billing.create', description: 'Create invoices', category: 'billing' },
  { name: 'billing.update', description: 'Update billing records', category: 'billing' },
  { name: 'billing.delete', description: 'Delete billing records', category: 'billing' },
  { name: 'billing.approve', description: 'Approve billing adjustments', category: 'billing' },
  { name: 'payment.process', description: 'Process payments', category: 'billing' },
  { name: 'payment.refund', description: 'Process refunds', category: 'billing' },
  
  // Pharmacy Management
  { name: 'pharmacy.view', description: 'View pharmacy orders', category: 'pharmacy' },
  { name: 'pharmacy.create', description: 'Create pharmacy orders', category: 'pharmacy' },
  { name: 'pharmacy.update', description: 'Update pharmacy orders', category: 'pharmacy' },
  { name: 'pharmacy.delete', description: 'Delete pharmacy orders', category: 'pharmacy' },
  { name: 'pharmacy.dispense', description: 'Dispense medications', category: 'pharmacy' },
  { name: 'prescription.write', description: 'Write prescriptions', category: 'pharmacy' },
  
  // Laboratory Management
  { name: 'lab.view', description: 'View lab orders and results', category: 'laboratory' },
  { name: 'lab.create', description: 'Create lab orders', category: 'laboratory' },
  { name: 'lab.update', description: 'Update lab results', category: 'laboratory' },
  { name: 'lab.delete', description: 'Delete lab records', category: 'laboratory' },
  { name: 'lab.approve', description: 'Approve lab results', category: 'laboratory' },
  
  // Inventory Management
  { name: 'inventory.view', description: 'View inventory', category: 'inventory' },
  { name: 'inventory.create', description: 'Add inventory items', category: 'inventory' },
  { name: 'inventory.update', description: 'Update inventory', category: 'inventory' },
  { name: 'inventory.delete', description: 'Remove inventory items', category: 'inventory' },
  { name: 'inventory.approve', description: 'Approve inventory orders', category: 'inventory' },
  
  // Staff Management
  { name: 'staff.view', description: 'View staff information', category: 'staff' },
  { name: 'staff.create', description: 'Add new staff', category: 'staff' },
  { name: 'staff.update', description: 'Update staff information', category: 'staff' },
  { name: 'staff.delete', description: 'Remove staff', category: 'staff' },
  { name: 'staff.schedule', description: 'Manage staff schedules', category: 'staff' },
  
  // Role & Permission Management
  { name: 'role.view', description: 'View roles', category: 'rbac' },
  { name: 'role.create', description: 'Create roles', category: 'rbac' },
  { name: 'role.update', description: 'Update roles', category: 'rbac' },
  { name: 'role.delete', description: 'Delete roles', category: 'rbac' },
  { name: 'permission.manage', description: 'Manage permissions', category: 'rbac' },
  
  // System Settings
  { name: 'settings.view', description: 'View system settings', category: 'system' },
  { name: 'settings.update', description: 'Update system settings', category: 'system' },
  { name: 'tenant.manage', description: 'Manage tenant settings', category: 'system' },
  { name: 'subscription.manage', description: 'Manage subscriptions', category: 'system' },
  
  // Reports & Analytics
  { name: 'reports.view', description: 'View reports', category: 'reports' },
  { name: 'reports.create', description: 'Generate reports', category: 'reports' },
  { name: 'reports.export', description: 'Export reports', category: 'reports' },
  { name: 'analytics.view', description: 'View analytics dashboard', category: 'reports' },
  
  // Medical Records
  { name: 'medical_record.view', description: 'View medical records', category: 'medical' },
  { name: 'medical_record.create', description: 'Create medical records', category: 'medical' },
  { name: 'medical_record.update', description: 'Update medical records', category: 'medical' },
  { name: 'medical_record.delete', description: 'Delete medical records', category: 'medical' },
];

// Role permission mappings
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: SYSTEM_PERMISSIONS.map(p => p.name), // All permissions
  HOSPITAL_ADMIN: SYSTEM_PERMISSIONS.map(p => p.name), // All permissions for their tenant
  DOCTOR: [
    'patient.view', 'patient.create', 'patient.update',
    'appointment.view', 'appointment.create', 'appointment.update',
    'prescription.write',
    'lab.view', 'lab.create',
    'medical_record.view', 'medical_record.create', 'medical_record.update',
    'reports.view',
  ],
  NURSE: [
    'patient.view', 'patient.update',
    'appointment.view', 'appointment.update',
    'lab.view',
    'medical_record.view', 'medical_record.update',
    'pharmacy.view',
  ],
  RECEPTIONIST: [
    'patient.view', 'patient.create', 'patient.update',
    'appointment.view', 'appointment.create', 'appointment.update',
    'billing.view', 'billing.create',
    'payment.process',
  ],
  PHARMACIST: [
    'pharmacy.view', 'pharmacy.create', 'pharmacy.update', 'pharmacy.dispense',
    'inventory.view', 'inventory.update',
    'patient.view',
  ],
  LAB_TECHNICIAN: [
    'lab.view', 'lab.create', 'lab.update',
    'patient.view',
    'reports.view', 'reports.create',
  ],
  ACCOUNTANT: [
    'billing.view', 'billing.create', 'billing.update', 'billing.approve',
    'payment.process', 'payment.refund',
    'reports.view', 'reports.create', 'reports.export',
  ],
  PATIENT: [
    'appointment.view', 'appointment.create',
    'billing.view',
    'medical_record.view',
    'lab.view',
    'pharmacy.view',
  ],
};

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  try {
    // 1. Create Permissions
    console.log('📝 Creating permissions...');
    for (const permission of SYSTEM_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission,
      });
    }
    console.log(`✅ Created ${SYSTEM_PERMISSIONS.length} permissions`);

    // 2. Create default tenant
    console.log('🏥 Creating default tenant...');
    const defaultTenant = await prisma.tenant.upsert({
      where: { slug: 'default-hospital' },
      update: {},
      create: {
        name: 'Default Hospital',
        slug: 'default-hospital',
        type: 'HOSPITAL',
        email: 'admin@hospital.com',
        phone: '+91-9999999999',
        address: '123 Healthcare Street',
        isActive: true,
      },
    });
    console.log('✅ Default tenant created');

    // 3. Create subscription plans
    console.log('💳 Creating subscription plans...');
    const plans = [
      {
        name: 'Free Trial',
        description: '14-day free trial with basic features',
        price: 0,
        interval: 'monthly',
        features: {
          maxPatients: 100,
          maxUsers: 5,
          features: ['basic_emr', 'appointments', 'billing'],
        },
      },
      {
        name: 'Basic',
        description: 'Essential features for small clinics',
        price: 4999,
        interval: 'monthly',
        features: {
          maxPatients: 500,
          maxUsers: 10,
          features: ['emr', 'appointments', 'billing', 'pharmacy', 'lab'],
        },
      },
      {
        name: 'Professional',
        description: 'Advanced features for hospitals',
        price: 14999,
        interval: 'monthly',
        features: {
          maxPatients: 5000,
          maxUsers: 50,
          features: ['all_modules', 'analytics', 'multi_branch'],
        },
      },
      {
        name: 'Enterprise',
        description: 'Complete solution for large hospitals',
        price: 49999,
        interval: 'monthly',
        features: {
          maxPatients: -1, // Unlimited
          maxUsers: -1, // Unlimited
          features: ['all_modules', 'custom_features', 'dedicated_support'],
        },
      },
    ];

    for (const plan of plans) {
      const existing = await prisma.subscriptionPlan.findFirst({
        where: { name: plan.name },
      });
      
      if (!existing) {
        await prisma.subscriptionPlan.create({
          data: plan,
        });
      }
    }
    console.log('✅ Subscription plans created');

    // 4. Create roles for the tenant
    console.log('👥 Creating roles...');
    const roleNames = Object.keys(ROLE_PERMISSIONS);
    
    for (const roleName of roleNames) {
      const role = await prisma.tenantRole.upsert({
        where: {
          tenantId_name: {
            tenantId: defaultTenant.id,
            name: roleName,
          },
        },
        update: {},
        create: {
          tenantId: defaultTenant.id,
          name: roleName,
          description: `${roleName.replace('_', ' ')} role`,
          isSystem: true,
          isActive: true,
        },
      });

      // Assign permissions to role
      const permissionNames = ROLE_PERMISSIONS[roleName];
      for (const permName of permissionNames) {
        const permission = await prisma.permission.findUnique({
          where: { name: permName },
        });

        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      }
    }
    console.log(`✅ Created ${roleNames.length} roles with permissions`);

    // 5. Create a super admin user
    console.log('👤 Creating super admin user...');
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    const adminRole = await prisma.tenantRole.findFirst({
      where: {
        tenantId: defaultTenant.id,
        name: 'HOSPITAL_ADMIN',
      },
    });

    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@hospital.com' },
      update: {},
      create: {
        email: 'admin@hospital.com',
        passwordHash: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+91-9999999999',
        role: 'HOSPITAL_ADMIN',
        roleId: adminRole?.id,
        tenantId: defaultTenant.id,
        isActive: true,
      },
    });
    console.log('✅ Super admin created (email: admin@hospital.com, password: Admin@123)');

    // 6. Create sample departments
    console.log('🏢 Creating departments...');
    const departments = [
      { name: 'Emergency', code: 'ER', description: 'Emergency Department' },
      { name: 'Cardiology', code: 'CARD', description: 'Heart and Cardiovascular' },
      { name: 'Orthopedics', code: 'ORTH', description: 'Bone and Joint Care' },
      { name: 'Pediatrics', code: 'PEDS', description: 'Child Healthcare' },
      { name: 'General Medicine', code: 'GM', description: 'General Medical Care' },
    ];

    for (const dept of departments) {
      await prisma.department.create({
        data: {
          ...dept,
          tenantId: defaultTenant.id,
        },
      });
    }
    console.log('✅ Departments created');

    // 7. Create sample lab tests
    console.log('🧪 Creating lab tests...');
    const labTests = [
      { name: 'Complete Blood Count', code: 'CBC', category: 'Hematology', price: 500 },
      { name: 'Blood Sugar Fasting', code: 'BSF', category: 'Biochemistry', price: 150 },
      { name: 'Lipid Profile', code: 'LIPID', category: 'Biochemistry', price: 800 },
      { name: 'Thyroid Profile', code: 'THYROID', category: 'Hormones', price: 1200 },
      { name: 'Urine Routine', code: 'URINE', category: 'Pathology', price: 200 },
    ];

    for (const test of labTests) {
      await prisma.labTest.create({
        data: {
          ...test,
          tenantId: defaultTenant.id,
        },
      });
    }
    console.log('✅ Lab tests created');

    console.log('🎉 Database seed completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`- Permissions: ${SYSTEM_PERMISSIONS.length}`);
    console.log(`- Roles: ${roleNames.length}`);
    console.log(`- Subscription Plans: ${plans.length}`);
    console.log(`- Departments: ${departments.length}`);
    console.log(`- Lab Tests: ${labTests.length}`);
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('Email: admin@hospital.com');
    console.log('Password: Admin@123');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
