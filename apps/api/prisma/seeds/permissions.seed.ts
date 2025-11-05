import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const defaultPermissions = [
  // Patient Management
  { name: 'patient.view', description: 'View patient information', category: 'patient' },
  { name: 'patient.create', description: 'Create new patients', category: 'patient' },
  { name: 'patient.update', description: 'Update patient information', category: 'patient' },
  { name: 'patient.delete', description: 'Delete patients', category: 'patient' },
  
  // Appointment Management
  { name: 'appointment.view', description: 'View appointments', category: 'appointment' },
  { name: 'appointment.create', description: 'Create appointments', category: 'appointment' },
  { name: 'appointment.update', description: 'Update appointments', category: 'appointment' },
  { name: 'appointment.delete', description: 'Delete appointments', category: 'appointment' },
  { name: 'appointment.manage', description: 'Full appointment management', category: 'appointment' },
  
  // Billing & Finance
  { name: 'billing.view', description: 'View billing information', category: 'billing' },
  { name: 'billing.create', description: 'Create invoices and bills', category: 'billing' },
  { name: 'billing.update', description: 'Update billing information', category: 'billing' },
  { name: 'billing.delete', description: 'Delete billing records', category: 'billing' },
  { name: 'payment.process', description: 'Process payments', category: 'billing' },
  { name: 'finance.view', description: 'View financial reports', category: 'finance' },
  { name: 'finance.manage', description: 'Manage financial operations', category: 'finance' },
  
  // Pharmacy Management
  { name: 'pharmacy.view', description: 'View pharmacy inventory', category: 'pharmacy' },
  { name: 'pharmacy.manage', description: 'Manage pharmacy operations', category: 'pharmacy' },
  { name: 'pharmacy.dispense', description: 'Dispense medications', category: 'pharmacy' },
  { name: 'prescription.view', description: 'View prescriptions', category: 'pharmacy' },
  { name: 'prescription.create', description: 'Create prescriptions', category: 'pharmacy' },
  
  // Laboratory
  { name: 'lab.view', description: 'View lab orders', category: 'laboratory' },
  { name: 'lab.create', description: 'Create lab orders', category: 'laboratory' },
  { name: 'lab.results.view', description: 'View lab results', category: 'laboratory' },
  { name: 'lab.results.update', description: 'Update lab results', category: 'laboratory' },
  { name: 'lab.manage', description: 'Manage laboratory operations', category: 'laboratory' },
  
  // Radiology
  { name: 'radiology.view', description: 'View radiology orders', category: 'radiology' },
  { name: 'radiology.create', description: 'Create radiology orders', category: 'radiology' },
  { name: 'radiology.report', description: 'Create radiology reports', category: 'radiology' },
  { name: 'radiology.manage', description: 'Manage radiology operations', category: 'radiology' },
  
  // Inventory Management
  { name: 'inventory.view', description: 'View inventory', category: 'inventory' },
  { name: 'inventory.create', description: 'Add inventory items', category: 'inventory' },
  { name: 'inventory.update', description: 'Update inventory', category: 'inventory' },
  { name: 'inventory.delete', description: 'Delete inventory items', category: 'inventory' },
  { name: 'inventory.manage', description: 'Full inventory management', category: 'inventory' },
  
  // Staff Management
  { name: 'staff.view', description: 'View staff information', category: 'staff' },
  { name: 'staff.create', description: 'Create staff members', category: 'staff' },
  { name: 'staff.update', description: 'Update staff information', category: 'staff' },
  { name: 'staff.delete', description: 'Delete staff members', category: 'staff' },
  { name: 'staff.manage', description: 'Full staff management', category: 'staff' },
  
  // Role & Permission Management
  { name: 'roles.view', description: 'View roles', category: 'rbac' },
  { name: 'roles.create', description: 'Create roles', category: 'rbac' },
  { name: 'roles.update', description: 'Update roles', category: 'rbac' },
  { name: 'roles.delete', description: 'Delete roles', category: 'rbac' },
  { name: 'roles.manage', description: 'Full role management', category: 'rbac' },
  { name: 'permissions.assign', description: 'Assign permissions to roles', category: 'rbac' },
  
  // Medical Records (EMR)
  { name: 'emr.view', description: 'View medical records', category: 'emr' },
  { name: 'emr.create', description: 'Create medical records', category: 'emr' },
  { name: 'emr.update', description: 'Update medical records', category: 'emr' },
  { name: 'emr.delete', description: 'Delete medical records', category: 'emr' },
  
  // IPD (Inpatient Department)
  { name: 'ipd.view', description: 'View IPD information', category: 'ipd' },
  { name: 'ipd.manage', description: 'Manage IPD operations', category: 'ipd' },
  { name: 'ward.manage', description: 'Manage wards and beds', category: 'ipd' },
  
  // OPD (Outpatient Department)
  { name: 'opd.view', description: 'View OPD information', category: 'opd' },
  { name: 'opd.manage', description: 'Manage OPD operations', category: 'opd' },
  
  // Emergency
  { name: 'emergency.view', description: 'View emergency cases', category: 'emergency' },
  { name: 'emergency.manage', description: 'Manage emergency operations', category: 'emergency' },
  
  // Surgery
  { name: 'surgery.view', description: 'View surgery schedules', category: 'surgery' },
  { name: 'surgery.manage', description: 'Manage surgery operations', category: 'surgery' },
  
  // Telemedicine
  { name: 'telemedicine.view', description: 'View telemedicine consultations', category: 'telemedicine' },
  { name: 'telemedicine.conduct', description: 'Conduct telemedicine consultations', category: 'telemedicine' },
  
  // Insurance
  { name: 'insurance.view', description: 'View insurance claims', category: 'insurance' },
  { name: 'insurance.manage', description: 'Manage insurance operations', category: 'insurance' },
  
  // Reports
  { name: 'reports.view', description: 'View reports', category: 'reports' },
  { name: 'reports.generate', description: 'Generate reports', category: 'reports' },
  { name: 'reports.export', description: 'Export reports', category: 'reports' },
  
  // Quality Management
  { name: 'quality.view', description: 'View quality metrics', category: 'quality' },
  { name: 'quality.manage', description: 'Manage quality operations', category: 'quality' },
  
  // Research
  { name: 'research.view', description: 'View research data', category: 'research' },
  { name: 'research.manage', description: 'Manage research operations', category: 'research' },
  
  // Communications
  { name: 'communications.view', description: 'View messages and notifications', category: 'communications' },
  { name: 'communications.send', description: 'Send messages and notifications', category: 'communications' },
  
  // Settings & Configuration
  { name: 'settings.view', description: 'View system settings', category: 'settings' },
  { name: 'settings.manage', description: 'Manage system settings', category: 'settings' },
  { name: 'tenant.manage', description: 'Manage tenant configuration', category: 'settings' },
  
  // Audit Logs
  { name: 'audit.view', description: 'View audit logs', category: 'audit' },
];

export async function seedPermissions() {
  console.log('🌱 Seeding permissions...');
  
  try {
    // Use upsert to make this idempotent
    for (const permission of defaultPermissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {
          description: permission.description,
          category: permission.category,
          isActive: true,
        },
        create: permission,
      });
    }
    
    console.log(`✅ Successfully seeded ${defaultPermissions.length} permissions`);
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedPermissions()
    .then(() => {
      console.log('✅ Permission seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Permission seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
