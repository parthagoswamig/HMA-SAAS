// Comprehensive API Testing Script
// Run with: node test-all-endpoints.js

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
let authToken = null;
let testUser = null;

console.log('🧪 HMS API Comprehensive Testing Suite\n');
console.log('='.repeat(70));
console.log(`\nAPI Base URL: ${API_BASE_URL}\n`);

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, useAuth = false) {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (useAuth && authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
}

// Test function
async function test(name, testFn) {
  results.total++;
  process.stdout.write(`\n${results.total}. ${name}... `);
  
  try {
    const result = await testFn();
    if (result.skip) {
      results.skipped++;
      console.log('⏭️  SKIPPED');
      results.details.push({ name, status: 'SKIPPED', reason: result.reason });
    } else if (result.success) {
      results.passed++;
      console.log('✅ PASS');
      results.details.push({ name, status: 'PASS' });
    } else {
      results.failed++;
      console.log(`❌ FAIL - ${result.error}`);
      results.details.push({ name, status: 'FAIL', error: result.error });
    }
  } catch (error) {
    results.failed++;
    console.log(`❌ ERROR - ${error.message}`);
    results.details.push({ name, status: 'ERROR', error: error.message });
  }
}

// Run all tests
async function runTests() {
  console.log('\n📋 PHASE 1: BASIC CONNECTIVITY\n' + '-'.repeat(70));

  await test('Health Check Endpoint', async () => {
    const result = await apiCall('GET', '/health');
    return result;
  });

  await test('Root Endpoint', async () => {
    const result = await apiCall('GET', '/');
    return result;
  });

  console.log('\n\n🔐 PHASE 2: AUTHENTICATION\n' + '-'.repeat(70));

  await test('Register New User', async () => {
    const userData = {
      email: `test_${Date.now()}@hospital.com`,
      password: 'Test@123456',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN'
    };
    
    const result = await apiCall('POST', '/auth/register', userData);
    
    if (result.success) {
      authToken = result.data.accessToken;
      testUser = result.data.user;
    }
    
    return result;
  });

  await test('Login with Credentials', async () => {
    if (!testUser) {
      return { skip: true, reason: 'No test user created' };
    }
    
    const result = await apiCall('POST', '/auth/login', {
      email: testUser.email,
      password: 'Test@123456'
    });
    
    if (result.success) {
      authToken = result.data.accessToken;
    }
    
    return result;
  });

  await test('Get User Profile', async () => {
    if (!authToken) {
      return { skip: true, reason: 'Not authenticated' };
    }
    
    return await apiCall('GET', '/auth/profile', null, true);
  });

  console.log('\n\n👥 PHASE 3: PATIENT MANAGEMENT\n' + '-'.repeat(70));

  await test('Get All Patients', async () => {
    return await apiCall('GET', '/patients', null, true);
  });

  await test('Create Patient', async () => {
    const patientData = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-15',
      gender: 'MALE',
      email: `patient_${Date.now()}@email.com`,
      phone: '+1234567890',
      address: '123 Test Street'
    };
    
    return await apiCall('POST', '/patients', patientData, true);
  });

  await test('Search Patients', async () => {
    return await apiCall('GET', '/patients/search?query=John', null, true);
  });

  await test('Get Patient Stats', async () => {
    return await apiCall('GET', '/patients/stats', null, true);
  });

  console.log('\n\n📅 PHASE 4: APPOINTMENTS\n' + '-'.repeat(70));

  await test('Get All Appointments', async () => {
    return await apiCall('GET', '/appointments', null, true);
  });

  await test('Get Appointment Calendar', async () => {
    return await apiCall('GET', '/appointments/calendar', null, true);
  });

  await test('Get Appointment Stats', async () => {
    return await apiCall('GET', '/appointments/stats', null, true);
  });

  console.log('\n\n👨‍⚕️ PHASE 5: STAFF MANAGEMENT\n' + '-'.repeat(70));

  await test('Get All Staff', async () => {
    return await apiCall('GET', '/staff', null, true);
  });

  await test('Get Staff Stats', async () => {
    return await apiCall('GET', '/staff/stats', null, true);
  });

  console.log('\n\n🩺 PHASE 6: OPD MANAGEMENT\n' + '-'.repeat(70));

  await test('Get OPD Visits', async () => {
    return await apiCall('GET', '/opd/visits', null, true);
  });

  await test('Get OPD Queue', async () => {
    return await apiCall('GET', '/opd/queue', null, true);
  });

  await test('Get OPD Stats', async () => {
    return await apiCall('GET', '/opd/stats', null, true);
  });

  console.log('\n\n🧪 PHASE 7: LABORATORY\n' + '-'.repeat(70));

  await test('Get Lab Tests', async () => {
    return await apiCall('GET', '/laboratory/tests', null, true);
  });

  await test('Get Lab Orders', async () => {
    return await apiCall('GET', '/laboratory/orders', null, true);
  });

  await test('Get Lab Stats', async () => {
    return await apiCall('GET', '/laboratory/orders/stats', null, true);
  });

  console.log('\n\n💊 PHASE 8: PHARMACY\n' + '-'.repeat(70));

  await test('Get Medications', async () => {
    return await apiCall('GET', '/pharmacy/medications', null, true);
  });

  await test('Get Pharmacy Orders', async () => {
    return await apiCall('GET', '/pharmacy/orders', null, true);
  });

  await test('Get Pharmacy Stats', async () => {
    return await apiCall('GET', '/pharmacy/orders/stats', null, true);
  });

  console.log('\n\n💰 PHASE 9: BILLING & FINANCE\n' + '-'.repeat(70));

  await test('Get Invoices', async () => {
    return await apiCall('GET', '/billing/invoices', null, true);
  });

  await test('Get Payments', async () => {
    return await apiCall('GET', '/billing/payments', null, true);
  });

  await test('Get Billing Stats', async () => {
    return await apiCall('GET', '/billing/invoices/stats', null, true);
  });

  console.log('\n\n🏥 PHASE 10: IPD MANAGEMENT\n' + '-'.repeat(70));

  await test('Get Wards', async () => {
    return await apiCall('GET', '/ipd/wards', null, true);
  });

  await test('Get Beds', async () => {
    return await apiCall('GET', '/ipd/beds', null, true);
  });

  await test('Get Available Beds', async () => {
    return await apiCall('GET', '/ipd/beds/available', null, true);
  });

  await test('Get IPD Stats', async () => {
    return await apiCall('GET', '/ipd/stats', null, true);
  });

  console.log('\n\n🚑 PHASE 11: EMERGENCY\n' + '-'.repeat(70));

  await test('Get Emergency Cases', async () => {
    return await apiCall('GET', '/emergency/cases', null, true);
  });

  await test('Get Emergency Queue', async () => {
    return await apiCall('GET', '/emergency/queue', null, true);
  });

  await test('Get Emergency Stats', async () => {
    return await apiCall('GET', '/emergency/stats', null, true);
  });

  console.log('\n\n🔬 PHASE 12: RADIOLOGY\n' + '-'.repeat(70));

  await test('Get Radiology Studies', async () => {
    return await apiCall('GET', '/radiology/studies', null, true);
  });

  await test('Get Radiology Reports', async () => {
    return await apiCall('GET', '/radiology/reports', null, true);
  });

  await test('Get Radiology Stats', async () => {
    return await apiCall('GET', '/radiology/stats', null, true);
  });

  console.log('\n\n📊 PHASE 13: REPORTS & ANALYTICS\n' + '-'.repeat(70));

  await test('Get Dashboard Report', async () => {
    return await apiCall('GET', '/reports/dashboard', null, true);
  });

  await test('Get Patient Report', async () => {
    return await apiCall('GET', '/reports/patients', null, true);
  });

  await test('Get Revenue Report', async () => {
    return await apiCall('GET', '/reports/revenue', null, true);
  });

  // Print Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`\nSuccess Rate: ${((results.passed / (results.total - results.skipped)) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log('\n\n❌ FAILED TESTS:\n');
    results.details
      .filter(r => r.status === 'FAIL' || r.status === 'ERROR')
      .forEach((r, i) => {
        console.log(`${i + 1}. ${r.name}`);
        console.log(`   Error: ${r.error}`);
      });
  }

  console.log('\n' + '='.repeat(70));
  
  if (results.failed === 0 && results.passed > 0) {
    console.log('\n✅ ALL TESTS PASSED! API is fully functional.\n');
  } else if (results.failed > 0) {
    console.log('\n⚠️  SOME TESTS FAILED. Please review the errors above.\n');
  }

  console.log('='.repeat(70) + '\n');

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
console.log('Starting test suite...\n');
runTests().catch(error => {
  console.error('\n\n❌ CRITICAL ERROR:', error.message);
  process.exit(1);
});
