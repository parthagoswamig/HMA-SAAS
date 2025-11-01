const axios = require('axios');

const API_URL = 'https://hma-saas-1.onrender.com';

async function debugPatientForm() {
  console.log('🔍 Debugging Patient Form Submission\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'Admin@123',
    });

    const { accessToken, user } = loginResponse.data;
    console.log('✅ Login successful');
    console.log('User:', user.email, '| Role:', user.role?.name);
    console.log('Token:', accessToken.substring(0, 20) + '...\n');

    // Step 2: Check user permissions
    console.log('2️⃣ Checking user permissions...');
    try {
      const permissionsResponse = await axios.get(`${API_URL}/permissions`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log('✅ User has', permissionsResponse.data.length, 'permissions');
      
      // Check for patient.create permission
      const hasPatientCreate = permissionsResponse.data.some(
        p => p.name === 'patient.create' || p.name === 'PATIENT_CREATE'
      );
      console.log('Has patient.create permission:', hasPatientCreate ? '✅ YES' : '❌ NO');
    } catch (err) {
      console.log('⚠️ Could not fetch permissions:', err.response?.status);
    }

    // Step 3: Try to create a patient
    console.log('\n3️⃣ Attempting to create patient...');
    const patientData = {
      firstName: 'Test',
      lastName: 'Patient',
      email: 'test@example.com',
      phone: '+919876543210',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
    };

    try {
      const createResponse = await axios.post(`${API_URL}/patients`, patientData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log('✅ SUCCESS! Patient created:', createResponse.status);
      console.log('Response:', createResponse.data);
    } catch (error) {
      console.log('❌ FAILED! Status:', error.response?.status);
      console.log('Error:', error.response?.data);
      
      if (error.response?.status === 401) {
        console.log('\n🔴 401 UNAUTHORIZED - Token is invalid or expired');
        console.log('This means the token is not being accepted by the backend');
      } else if (error.response?.status === 403) {
        console.log('\n🔴 403 FORBIDDEN - Permission denied');
        console.log('This means the user lacks patient.create permission');
      } else if (error.response?.status === 400) {
        console.log('\n🟡 400 BAD REQUEST - Validation error');
        console.log('This is expected - the data format might be wrong');
      }
    }

    // Step 4: Check if token is still valid
    console.log('\n4️⃣ Verifying token is still valid...');
    try {
      const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log('✅ Token is valid - Profile fetched successfully');
    } catch (err) {
      console.log('❌ Token is INVALID:', err.response?.status);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

debugPatientForm();
