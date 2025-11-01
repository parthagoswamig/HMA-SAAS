/**
 * Test OPD Visit Creation to see exact error
 */

const axios = require('axios');

const CONFIG = {
  backendUrl: 'https://hma-saas-1.onrender.com',
  credentials: {
    email: 'admin@test.com',
    password: 'Admin@123'
  }
};

async function testOpdCreate() {
  console.log('🧪 Testing OPD Visit Creation\n');

  // Step 1: Login
  console.log('1️⃣ Logging in...');
  const loginResponse = await axios.post(
    `${CONFIG.backendUrl}/auth/login`,
    CONFIG.credentials
  );
  const token = loginResponse.data.accessToken || loginResponse.data.access_token;
  console.log('✅ Logged in\n');

  // Step 2: Get patients list
  console.log('2️⃣ Getting patients...');
  const patientsResponse = await axios.get(
    `${CONFIG.backendUrl}/patients?limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const patient = patientsResponse.data.data?.items?.[0];
  console.log(`✅ Found patient: ${patient?.id}\n`);

  // Step 3: Get doctors list
  console.log('3️⃣ Getting doctors...');
  const doctorsResponse = await axios.get(
    `${CONFIG.backendUrl}/staff?role=DOCTOR&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const doctor = doctorsResponse.data.data?.items?.[0];
  console.log(`✅ Found doctor: ${doctor?.id}\n`);

  // Step 4: Try to create OPD visit
  console.log('4️⃣ Creating OPD visit...');
  
  const opdVisitData = {
    patientId: patient.id,
    doctorId: doctor.id,
    chiefComplaint: 'Test complaint',
    symptoms: 'Test symptoms',
    status: 'WAITING'
  };

  console.log('📤 Sending data:', JSON.stringify(opdVisitData, null, 2));

  try {
    const response = await axios.post(
      `${CONFIG.backendUrl}/opd/visits`,
      opdVisitData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('\n✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('\n❌ FAILED!');
    console.log('Status:', error.response?.status);
    console.log('Error:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.message) {
      console.log('\n🔍 DETAILED ERROR:');
      const messages = Array.isArray(error.response.data.message) 
        ? error.response.data.message 
        : [error.response.data.message];
      
      messages.forEach(msg => {
        console.log(`   - ${msg}`);
      });
    }
  }
}

testOpdCreate().catch(console.error);
