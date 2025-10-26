import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Define all permissions for the HMS system
const permissions = [
  // Patient Management
  { name: 'patient.view', description: 'View patient records', category: 'patient' },
  { name: 'patient.create', description: 'Create new patient records', category: 'patient' },
  { name: 'patient.update', description: 'Update patient records', category: 'patient' },
  { name: 'patient.delete', description: 'Delete patient records', category: 'patient' },
  { name: 'patient.export', description: 'Export patient data', category: 'patient' },
  
  // Appointment Management
  { name: 'appointment.view', description: 'View appointments', category: 'appointment' },
  { name: 'appointment.create', description: 'Create appointments', category: 'appointment' },
  { name: 'appointment.update', description: 'Update appointments', category: 'appointment' },
  { name: 'appointment.delete', description: 'Delete appointments', category: 'appointment' },
  { name: 'appointment.approve', description: 'Approve appointments', category: 'appointment' },
  
  // Billing Management
  { name: 'billing.view', description: 'View billing records', category: 'billing' },
  { name: 'billing.create', description: 'Create invoices', category: 'billing' },
  { name: 'billing.update', description: 'Update billing records', category: 'billing' },
  { name: 'billing.delete', description: 'Delete billing records', category: 'billing' },
  { name: 'billing.payment', description: 'Process payments', category: 'billing' },
  
  // Pharmacy Management
  { name: 'pharmacy.view', description: 'View pharmacy records', category: 'pharmacy' },
  { name: 'pharmacy.create', description: 'Create pharmacy orders', category: 'pharmacy' },
  { name: 'pharmacy.update', description: 'Update pharmacy orders', category: 'pharmacy' },
  { name: 'pharmacy.delete', description: 'Delete pharmacy orders', category: 'pharmacy' },
  { name: 'pharmacy.dispense', description: 'Dispense medications', category: 'pharmacy' },
  
  // Laboratory Management
  { name: 'lab.view', description: 'View lab records', category: 'lab' },
  { name: 'lab.create', description: 'Create lab orders', category: 'lab' },
  { name: 'lab.update', description: 'Update lab results', category: 'lab' },
  { name: 'lab.delete', description: 'Delete lab records', category: 'lab' },
  { name: 'lab.approve', description: 'Approve lab results', category: 'lab' },
  
  // Inventory Management
  { name: 'inventory.view', description: 'View inventory', category: 'inventory' },
  { name: 'inventory.create', description: 'Add inventory items', category: 'inventory' },
  { name: 'inventory.update', description: 'Update inventory', category: 'inventory' },
  { name: 'inventory.delete', description: 'Delete inventory items', category: 'inventory' },
  
  // Role Management
  { name: 'role.view', description: 'View roles', category: 'role' },
  { name: 'role.create', description: 'Create roles', category: 'role' },
  { name: 'role.update', description: 'Update roles', category: 'role' },
  { name: 'role.delete', description: 'Delete roles', category: 'role' },
  { name: 'role.assign', description: 'Assign roles to users', category: 'role' },
  
  // User Management
  { name: 'user.view', description: 'View users', category: 'user' },
  { name: 'user.create', description: 'Create users', category: 'user' },
  { name: 'user.update', description: 'Update users', category: 'user' },
  { name: 'user.delete', description: 'Delete users', category: 'user' },
  
  // Settings Management
  { name: 'settings.view', description: 'View settings', category: 'settings' },
  { name: 'settings.update', description: 'Update settings', category: 'settings' },
  
  // Reports
  { name: 'reports.view', description: 'View reports', category: 'reports' },
  { name: 'reports.create', description: 'Generate reports', category: 'reports' },
  { name: 'reports.export', description: 'Export reports', category: 'reports' },
  
  // Dashboard
  { name: 'dashboard.view', description: 'View dashboard', category: 'dashboard' },
  { name: 'dashboard.analytics', description: 'View analytics', category: 'dashboard' },
  
  // Tenant Management
  { name: 'tenant.view', description: 'View tenants', category: 'tenant' },
  { name: 'tenant.create', description: 'Create tenants', category: 'tenant' },
  { name: 'tenant.update', description: 'Update tenants', category: 'tenant' },
  { name: 'tenant.delete', description: 'Delete tenants', category: 'tenant' },
  
  // Additional Role Permissions
  { name: 'roles.view', description: 'View roles', category: 'roles' },
  { name: 'roles.create', description: 'Create roles', category: 'roles' },
  { name: 'roles.update', description: 'Update roles', category: 'roles' },
  { name: 'roles.delete', description: 'Delete roles', category: 'roles' },
  { name: 'roles.manage', description: 'Manage role assignments', category: 'roles' },
];

// Define role templates with their permissions
const roleTemplates = [
  {
    name: 'Owner',
    description: 'Full system access',
    permissions: permissions.map(p => p.name), // All permissions
  },
  {
    name: 'Hospital Admin',
    description: 'Hospital administration access',
    permissions: permissions.map(p => p.name), // All permissions
  },
  {
    name: 'Doctor',
    description: 'Doctor access',
    permissions: [
      'patient.view', 'patient.create', 'patient.update',
      'appointment.view', 'appointment.create', 'appointment.update',
      'lab.view', 'lab.create', 'lab.update',
      'pharmacy.view', 'pharmacy.create',
      'dashboard.view',
    ],
  },
  {
    name: 'Nurse',
    description: 'Nurse access',
    permissions: [
      'patient.view', 'patient.update',
      'appointment.view',
      'lab.view',
      'pharmacy.view',
      'dashboard.view',
    ],
  },
  {
    name: 'Pharmacist',
    description: 'Pharmacist access',
    permissions: [
      'pharmacy.view', 'pharmacy.create', 'pharmacy.update', 'pharmacy.dispense',
      'inventory.view', 'inventory.update',
      'patient.view',
      'dashboard.view',
    ],
  },
  {
    name: 'Lab Technician',
    description: 'Lab technician access',
    permissions: [
      'lab.view', 'lab.create', 'lab.update',
      'patient.view',
      'dashboard.view',
    ],
  },
  {
    name: 'Receptionist',
    description: 'Receptionist access',
    permissions: [
      'patient.view', 'patient.create', 'patient.update',
      'appointment.view', 'appointment.create', 'appointment.update',
      'billing.view', 'billing.create',
      'dashboard.view',
    ],
  },
];

async function main() {
  console.log('🌱 Starting database seed...');
  
  try {
    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.rolePermission.deleteMany();
    await prisma.tenantRole.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
    
    // Create permissions
    console.log('📝 Creating permissions...');
    for (const permission of permissions) {
      await prisma.permission.create({
        data: permission,
      });
    }
    console.log(`✅ Created ${permissions.length} permissions`);
    
    // Create demo tenant
    console.log('🏥 Creating demo tenant...');
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Demo Hospital',
        slug: 'demo-hospital',
        type: 'HOSPITAL',
        email: 'admin@demohospital.com',
        phone: '+1234567890',
        address: '123 Healthcare Ave, Medical City, HC 12345',
        isActive: true,
      },
    });
    console.log('✅ Created demo tenant');
    
    // Create roles for the tenant
    console.log('👥 Creating roles...');
    const createdRoles = [];
    for (const roleTemplate of roleTemplates) {
      const role = await prisma.tenantRole.create({
        data: {
          tenantId: tenant.id,
          name: roleTemplate.name,
          description: roleTemplate.description,
          isSystem: true,
          isActive: true,
        },
      });
      
      // Assign permissions to role
      const permissionRecords = await prisma.permission.findMany({
        where: {
          name: {
            in: roleTemplate.permissions,
          },
        },
      });
      
      for (const permission of permissionRecords) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
      
      createdRoles.push(role);
    }
    console.log(`✅ Created ${createdRoles.length} roles with permissions`);
    
    // Create demo users
    console.log('👤 Creating demo users...');
    const hashedPassword = await bcrypt.hash('Demo@123', 12);
    
    // Get role IDs
    const ownerRole = createdRoles.find(r => r.name === 'Owner');
    const doctorRole = createdRoles.find(r => r.name === 'Doctor');
    const nurseRole = createdRoles.find(r => r.name === 'Nurse');
    const receptionistRole = createdRoles.find(r => r.name === 'Receptionist');
    
    const users = [
      {
        email: 'owner@demohospital.com',
        passwordHash: hashedPassword,
        firstName: 'System',
        lastName: 'Owner',
        role: 'SUPER_ADMIN' as any,
        roleId: ownerRole?.id,
        tenantId: tenant.id,
        isActive: true,
      },
      {
        email: 'admin@demohospital.com',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'HOSPITAL_ADMIN' as any,
        roleId: ownerRole?.id,
        tenantId: tenant.id,
        isActive: true,
      },
      {
        email: 'doctor@demohospital.com',
        passwordHash: hashedPassword,
        firstName: 'Dr. John',
        lastName: 'Smith',
        role: 'DOCTOR' as any,
        roleId: doctorRole?.id,
        tenantId: tenant.id,
        isActive: true,
      },
      {
        email: 'nurse@demohospital.com',
        passwordHash: hashedPassword,
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'NURSE' as any,
        roleId: nurseRole?.id,
        tenantId: tenant.id,
        isActive: true,
      },
      {
        email: 'receptionist@demohospital.com',
        passwordHash: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'RECEPTIONIST' as any,
        roleId: receptionistRole?.id,
        tenantId: tenant.id,
        isActive: true,
      },
    ];
    
    for (const userData of users) {
      await prisma.user.create({
        data: userData,
      });
    }
    console.log(`✅ Created ${users.length} demo users`);
    
    // Create subscription plans
    console.log('💳 Creating subscription plans...');
    const plans = [
      {
        name: 'Free Trial',
        description: '14-day free trial with limited features',
        price: 0,
        interval: 'trial',
        features: {
          maxPatients: 100,
          maxUsers: 5,
          features: ['basic'],
        },
      },
      {
        name: 'Basic',
        description: 'Essential features for small clinics',
        price: 4999,
        interval: 'monthly',
        features: {
          maxPatients: 1000,
          maxUsers: 10,
          features: ['patients', 'appointments', 'billing'],
        },
      },
      {
        name: 'Professional',
        description: 'Advanced features for hospitals',
        price: 14999,
        interval: 'monthly',
        features: {
          maxPatients: 10000,
          maxUsers: 50,
          features: ['all'],
        },
      },
      {
        name: 'Enterprise',
        description: 'Unlimited features for large organizations',
        price: 29999,
        interval: 'monthly',
        features: {
          maxPatients: -1,
          maxUsers: -1,
          features: ['all', 'custom'],
        },
      },
    ];
    
    for (const plan of plans) {
      await prisma.subscriptionPlan.create({
        data: plan,
      });
    }
    console.log(`✅ Created ${plans.length} subscription plans`);
    
    console.log('\n✨ Database seed completed successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('-------------------');
    console.log('Owner: owner@demohospital.com / Demo@123');
    console.log('Admin: admin@demohospital.com / Demo@123');
    console.log('Doctor: doctor@demohospital.com / Demo@123');
    console.log('Nurse: nurse@demohospital.com / Demo@123');
    console.log('Receptionist: receptionist@demohospital.com / Demo@123');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error during seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
