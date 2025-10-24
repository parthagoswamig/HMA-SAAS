import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  console.log('🧪 Testing Prisma Client...');

  try {
    // Test tenant count
    const tenantCount = await prisma.tenant.count();
    console.log(`✅ Tenants: ${tenantCount}`);

    // Test user count
    const userCount = await prisma.user.count();
    console.log(`✅ Users: ${userCount}`);

    // Test patient count
    const patientCount = await prisma.patient.count();
    console.log(`✅ Patients: ${patientCount}`);

    // Test department count
    const departmentCount = await prisma.department.count();
    console.log(`✅ Departments: ${departmentCount}`);

    // Test medication count
    const medicationCount = await prisma.medication.count();
    console.log(`✅ Medications: ${medicationCount}`);

    console.log('🎉 All tests passed! Database is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
