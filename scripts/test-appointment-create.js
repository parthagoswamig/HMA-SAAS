const axios = require('axios');

const API_URL = 'https://hma-saas-1.onrender.com';

async function testAppointmentCreate() {
  console.log('🔍 Testing Appointment Creation\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'Admin@123',
    });

    const { accessToken } = loginResponse.data;
    console.log('✅ Login successful\n');

    // Step 2: Get patients
    console.log('2️⃣ Fetching patients...');
    const patientsResponse = await axios.get(`${API_URL}/patients`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('Patients response:', patientsResponse.data);
    const patients = patientsResponse.data?.data?.patients || patientsResponse.data?.patients || patientsResponse.data?.data || [];
    console.log(`✅ Found ${patients.length} patients`);
    
    if (patients.length === 0) {
      console.log('❌ No patients found. Create a patient first.');
      return;
    }
    
    const patient = patients[0];
    console.log(`Using patient: ${patient.firstName} ${patient.lastName} (ID: ${patient.id})\n`);

    // Step 3: Get doctors/staff
    console.log('3️⃣ Fetching doctors...');
    const staffResponse = await axios.get(`${API_URL}/staff`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('Staff response:', staffResponse.data);
    const staff = staffResponse.data?.data?.staff || staffResponse.data?.staff || staffResponse.data?.data || [];
    const doctors = staff.filter(s => s.role === 'DOCTOR' || s.designation?.includes('Doctor'));
    console.log(`✅ Found ${doctors.length} doctors`);
    
    if (doctors.length === 0) {
      console.log('⚠️ No doctors found. Using first staff member.');
      if (staff.length === 0) {
        console.log('❌ No staff found. Create staff first.');
        return;
      }
    }
    
    const doctor = doctors[0] || staff[0];
    console.log(`Using doctor: ${doctor.firstName} ${doctor.lastName} (ID: ${doctor.id})\n`);

    // Step 4: Create appointment
    console.log('4️⃣ Creating appointment...');
    const appointmentData = {
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      reason: 'Regular checkup',
      notes: 'Test appointment',
      status: 'SCHEDULED',
    };

    console.log('Appointment data:', JSON.stringify(appointmentData, null, 2));

    try {
      const createResponse = await axios.post(`${API_URL}/appointments`, appointmentData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log('\n✅ SUCCESS! Appointment created:', createResponse.status);
      console.log('Response:', JSON.stringify(createResponse.data, null, 2));
    } catch (error) {
      console.log('\n❌ FAILED! Status:', error.response?.status);
      console.log('Error details:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 400) {
        console.log('\n🔴 400 BAD REQUEST - Validation Error');
        console.log('The backend rejected the data format.');
        console.log('Check if patientId and doctorId are valid UUIDs.');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAppointmentCreate();
