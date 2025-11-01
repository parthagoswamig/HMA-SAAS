/**
 * Test ALL Forms - Find which ones don't submit
 */

const axios = require('axios');

const CONFIG = {
  backendUrl: 'https://hma-saas-1.onrender.com',
  credentials: { email: 'admin@test.com', password: 'Admin@123' }
};

let authToken = null;

// All forms to test with minimal valid data
const FORMS_TO_TEST = [
  {
    name: 'Create Patient',
    endpoint: '/patients',
    method: 'POST',
    data: {
      firstName: 'Test',
      lastName: 'Patient',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
      contactNumber: '1234567890',
      email: 'test@test.com'
    }
  },
  {
    name: 'Create Appointment',
    endpoint: '/appointments',
    method: 'POST',
    data: {
      patientId: 'test-id',
      doctorId: 'test-id',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      type: 'CONSULTATION',
      status: 'SCHEDULED'
    }
  },
  {
    name: 'Create OPD Visit',
    endpoint: '/opd/visits',
    method: 'POST',
    data: {
      patientId: 'test-id',
      doctorId: 'test-id',
      chiefComplaint: 'Test complaint',
      status: 'WAITING'
    }
  },
  {
    name: 'Create Staff',
    endpoint: '/staff',
    method: 'POST',
    data: {
      userId: 'test-id',
      role: 'DOCTOR',
      specialization: 'General',
      licenseNumber: 'TEST123'
    }
  },
  {
    name: 'Create Department',
    endpoint: '/hr/departments',
    method: 'POST',
    data: {
      name: 'Test Department',
      code: 'TEST',
      description: 'Test'
    }
  }
];

async function authenticate() {
  console.log('🔐 Authenticating...\n');
  const response = await axios.post(`${CONFIG.backendUrl}/auth/login`, CONFIG.credentials);
  authToken = response.data.accessToken || response.data.access_token;
  console.log('✅ Authenticated\n');
}

async function testForm(form) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${form.name}`);
  console.log(`Endpoint: ${form.method} ${form.endpoint}`);
  console.log('='.repeat(80));
  
  try {
    const response = await axios({
      method: form.method,
      url: `${CONFIG.backendUrl}${form.endpoint}`,
      data: form.data,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000,
      validateStatus: () => true // Don't throw on any status
    });
    
    console.log(`\nStatus: ${response.status}`);
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ FORM WORKS - Submission successful!');
      console.log(`Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
    } else if (response.status === 400) {
      console.log('❌ FORM BROKEN - Validation Error (400)');
      console.log('Error Details:', JSON.stringify(response.data, null, 2));
      console.log('\n💡 FIX NEEDED:');
      
      if (response.data.message) {
        const messages = Array.isArray(response.data.message) ? response.data.message : [response.data.message];
        messages.forEach(msg => {
          console.log(`   - ${msg}`);
        });
      }
      
      console.log('\n🔧 Likely Issues:');
      console.log('   1. Frontend sends wrong field names');
      console.log('   2. Backend DTO validation too strict');
      console.log('   3. Required fields missing');
      console.log('   4. Data type mismatch');
    } else if (response.status === 401) {
      console.log('❌ FORM BROKEN - Authentication Error (401)');
      console.log('💡 FIX: Token might be expired or invalid');
    } else if (response.status === 403) {
      console.log('❌ FORM BROKEN - Permission Error (403)');
      console.log('💡 FIX: User lacks required permissions');
      console.log('Error:', response.data.message);
    } else if (response.status === 500) {
      console.log('❌ FORM BROKEN - Server Error (500)');
      console.log('💡 FIX: Backend code has a bug');
      console.log('Error:', response.data.message);
    } else {
      console.log(`❌ FORM BROKEN - Unexpected Status (${response.status})`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ FORM BROKEN - Network/Request Error');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function runTests() {
  console.log('🧪 Testing ALL Forms - Find Which Ones Don\'t Submit\n');
  console.log('This will attempt to submit each form and show exact errors\n');
  
  await authenticate();
  
  // First, get real IDs for testing
  console.log('📋 Getting real IDs for testing...\n');
  let patientId = null;
  let doctorId = null;
  
  try {
    const patientsRes = await axios.get(`${CONFIG.backendUrl}/patients?limit=1`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    patientId = patientsRes.data.data?.patients?.[0]?.id || patientsRes.data.data?.items?.[0]?.id;
    console.log(`✅ Found patient ID: ${patientId}`);
  } catch (e) {
    console.log('⚠️  Could not get patient ID');
  }
  
  try {
    const staffRes = await axios.get(`${CONFIG.backendUrl}/staff?role=DOCTOR&limit=1`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    doctorId = staffRes.data.data?.staff?.[0]?.id || staffRes.data.data?.items?.[0]?.id;
    console.log(`✅ Found doctor ID: ${doctorId}\n`);
  } catch (e) {
    console.log('⚠️  Could not get doctor ID\n');
  }
  
  // Update test data with real IDs
  FORMS_TO_TEST.forEach(form => {
    if (form.data.patientId && patientId) form.data.patientId = patientId;
    if (form.data.doctorId && doctorId) form.data.doctorId = doctorId;
  });
  
  // Test each form
  for (const form of FORMS_TO_TEST) {
    await testForm(form);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log('\nCheck above for forms marked with ❌');
  console.log('Each broken form shows the exact error and fix needed.');
  console.log('\nCommon issues:');
  console.log('1. Frontend sends wrong field names → Fix frontend form');
  console.log('2. Backend validation too strict → Relax DTO validation');
  console.log('3. Missing permissions → Run permission SQL script');
  console.log('4. Wrong data types → Check DTO vs frontend data');
}

runTests().catch(console.error);
