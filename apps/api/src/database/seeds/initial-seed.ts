import { AppDataSource } from '../../data-source';
import { User } from '../../core/auth/entities/user.entity';
import { Tenant, TenantType, TenantStatus, SubscriptionPlan } from '../../core/tenant/entities/tenant.entity';
import { UserRole } from '../../core/rbac/enums/roles.enum';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // Initialize data source
  await AppDataSource.initialize();
  console.log('✅ Data source initialized\n');

  const tenantRepository = AppDataSource.getRepository(Tenant);
  const userRepository = AppDataSource.getRepository(User);

  try {
    // 1. Create Super Admin Tenant (Platform-level)
    console.log('Creating super admin tenant...');
    let superAdminTenant = await tenantRepository.findOne({
      where: { slug: 'platform-admin' },
    });

    if (!superAdminTenant) {
      superAdminTenant = tenantRepository.create({
        name: 'Platform Administration',
        slug: 'platform-admin',
        type: TenantType.HOSPITAL,
        status: TenantStatus.ACTIVE,
        subscriptionPlan: SubscriptionPlan.ENTERPRISE,
        email: 'admin@hms-platform.com',
        settings: {
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h',
          currency: 'USD',
          language: 'en',
          features: {
            appointments: true,
            laboratory: true,
            pharmacy: true,
            billing: true,
            inventory: true,
            reporting: true,
          },
        },
      });
      await tenantRepository.save(superAdminTenant);
      console.log('✅ Super admin tenant created');
    } else {
      console.log('ℹ️  Super admin tenant already exists');
    }

    // 2. Create Super Admin User
    console.log('\nCreating super admin user...');
    const superAdminEmail = 'admin@hms.com';
    let superAdmin = await userRepository.findOne({
      where: { email: superAdminEmail, tenantId: superAdminTenant.id },
    });

    if (!superAdmin) {
      const passwordHash = await bcrypt.hash('Admin@123!', 12);
      superAdmin = userRepository.create({
        email: superAdminEmail,
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
        tenantId: superAdminTenant.id,
        isActive: true,
        isEmailVerified: true,
      });
      await userRepository.save(superAdmin);
      console.log('✅ Super admin user created');
      console.log(`   Email: ${superAdminEmail}`);
      console.log(`   Password: Admin@123!`);
    } else {
      console.log('ℹ️  Super admin user already exists');
    }

    // 3. Create Demo Hospital Tenant
    console.log('\nCreating demo hospital tenant...');
    let demoTenant = await tenantRepository.findOne({
      where: { slug: 'demo-hospital' },
    });

    if (!demoTenant) {
      demoTenant = tenantRepository.create({
        name: 'Demo Hospital',
        slug: 'demo-hospital',
        type: TenantType.HOSPITAL,
        status: TenantStatus.TRIAL,
        subscriptionPlan: SubscriptionPlan.PROFESSIONAL,
        email: 'contact@demo-hospital.com',
        phone: '+1234567890',
        addressLine1: '123 Healthcare Ave',
        city: 'Medical City',
        state: 'HC',
        postalCode: '12345',
        country: 'USA',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        settings: {
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          currency: 'USD',
          language: 'en',
          features: {
            appointments: true,
            laboratory: true,
            pharmacy: true,
            billing: true,
            inventory: true,
            reporting: true,
          },
          limits: {
            maxUsers: 100,
            maxPatients: 10000,
            maxAppointments: 5000,
            storageGB: 100,
          },
        },
      });
      await tenantRepository.save(demoTenant);
      console.log('✅ Demo hospital tenant created');
    } else {
      console.log('ℹ️  Demo hospital tenant already exists');
    }

    // 4. Create Demo Tenant Admin
    console.log('\nCreating demo tenant admin...');
    const demoAdminEmail = 'admin@demo-hospital.com';
    let demoAdmin = await userRepository.findOne({
      where: { email: demoAdminEmail, tenantId: demoTenant.id },
    });

    if (!demoAdmin) {
      const passwordHash = await bcrypt.hash('Demo@123!', 12);
      demoAdmin = userRepository.create({
        email: demoAdminEmail,
        passwordHash,
        firstName: 'Hospital',
        lastName: 'Admin',
        role: UserRole.TENANT_ADMIN,
        tenantId: demoTenant.id,
        isActive: true,
        isEmailVerified: true,
      });
      await userRepository.save(demoAdmin);
      console.log('✅ Demo tenant admin created');
      console.log(`   Email: ${demoAdminEmail}`);
      console.log(`   Password: Demo@123!`);
    } else {
      console.log('ℹ️  Demo tenant admin already exists');
    }

    // 5. Create Demo Doctor
    console.log('\nCreating demo doctor...');
    const doctorEmail = 'doctor@demo-hospital.com';
    let doctor = await userRepository.findOne({
      where: { email: doctorEmail, tenantId: demoTenant.id },
    });

    if (!doctor) {
      const passwordHash = await bcrypt.hash('Doctor@123!', 12);
      doctor = userRepository.create({
        email: doctorEmail,
        passwordHash,
        firstName: 'John',
        lastName: 'Smith',
        middleName: 'A.',
        role: UserRole.DOCTOR,
        tenantId: demoTenant.id,
        isActive: true,
        isEmailVerified: true,
      });
      await userRepository.save(doctor);
      console.log('✅ Demo doctor created');
      console.log(`   Email: ${doctorEmail}`);
      console.log(`   Password: Doctor@123!`);
    } else {
      console.log('ℹ️  Demo doctor already exists');
    }

    // 6. Create Demo Nurse
    console.log('\nCreating demo nurse...');
    const nurseEmail = 'nurse@demo-hospital.com';
    let nurse = await userRepository.findOne({
      where: { email: nurseEmail, tenantId: demoTenant.id },
    });

    if (!nurse) {
      const passwordHash = await bcrypt.hash('Nurse@123!', 12);
      nurse = userRepository.create({
        email: nurseEmail,
        passwordHash,
        firstName: 'Jane',
        lastName: 'Doe',
        role: UserRole.NURSE,
        tenantId: demoTenant.id,
        isActive: true,
        isEmailVerified: true,
      });
      await userRepository.save(nurse);
      console.log('✅ Demo nurse created');
      console.log(`   Email: ${nurseEmail}`);
      console.log(`   Password: Nurse@123!`);
    } else {
      console.log('ℹ️  Demo nurse already exists');
    }

    // 7. Create Demo Patient
    console.log('\nCreating demo patient...');
    const patientEmail = 'patient@demo-hospital.com';
    let patient = await userRepository.findOne({
      where: { email: patientEmail, tenantId: demoTenant.id },
    });

    if (!patient) {
      const passwordHash = await bcrypt.hash('Patient@123!', 12);
      patient = userRepository.create({
        email: patientEmail,
        passwordHash,
        firstName: 'Michael',
        lastName: 'Johnson',
        role: UserRole.PATIENT,
        tenantId: demoTenant.id,
        isActive: true,
        isEmailVerified: true,
      });
      await userRepository.save(patient);
      console.log('✅ Demo patient created');
      console.log(`   Email: ${patientEmail}`);
      console.log(`   Password: Patient@123!`);
    } else {
      console.log('ℹ️  Demo patient already exists');
    }

    console.log('\n✅ Seed completed successfully!\n');
    console.log('='.repeat(60));
    console.log('DEMO ACCOUNTS CREATED:');
    console.log('='.repeat(60));
    console.log('\n🔐 Super Admin (Platform):');
    console.log(`   Email: admin@hms.com`);
    console.log(`   Password: Admin@123!`);
    console.log(`   Role: SUPER_ADMIN\n`);
    
    console.log('🏥 Demo Hospital Admin:');
    console.log(`   Email: admin@demo-hospital.com`);
    console.log(`   Password: Demo@123!`);
    console.log(`   Role: TENANT_ADMIN\n`);
    
    console.log('👨‍⚕️ Demo Doctor:');
    console.log(`   Email: doctor@demo-hospital.com`);
    console.log(`   Password: Doctor@123!`);
    console.log(`   Role: DOCTOR\n`);
    
    console.log('👩‍⚕️ Demo Nurse:');
    console.log(`   Email: nurse@demo-hospital.com`);
    console.log(`   Password: Nurse@123!`);
    console.log(`   Role: NURSE\n`);
    
    console.log('🤒 Demo Patient:');
    console.log(`   Email: patient@demo-hospital.com`);
    console.log(`   Password: Patient@123!`);
    console.log(`   Role: PATIENT\n`);
    
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('\n✅ Data source closed');
  }
}

// Run seed
seed()
  .then(() => {
    console.log('✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
