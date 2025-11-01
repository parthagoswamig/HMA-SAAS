/**
 * Check what data exists in the database
 */

const axios = require('axios');

const CONFIG = {
  backendUrl: 'https://hma-saas-1.onrender.com',
  credentials: {
    email: 'admin@test.com',
    password: 'Admin@123'
  }
};

async function checkData() {
  console.log('🔍 Checking Database Data\n');
  console.log('='.repeat(80));

  // Login
  const loginResponse = await axios.post(
    `${CONFIG.backendUrl}/auth/login`,
    CONFIG.credentials
  );
  const token = loginResponse.data.accessToken || loginResponse.data.access_token;

  const axiosInstance = axios.create({
    baseURL: CONFIG.backendUrl,
    headers: { Authorization: `Bearer ${token}` }
  });

  // Check each table
  const checks = [
    { name: 'Patients', url: '/patients?limit=5' },
    { name: 'Staff (Doctors)', url: '/staff?role=DOCTOR&limit=5' },
    { name: 'Staff (All)', url: '/staff?limit=5' },
    { name: 'Departments', url: '/hr/departments?limit=5' },
    { name: 'Appointments', url: '/appointments?limit=5' },
    { name: 'OPD Visits', url: '/opd/visits?limit=5' },
    { name: 'Emergency Cases', url: '/emergency/cases?limit=5' },
    { name: 'Shifts', url: '/shifts?limit=5' },
  ];

  for (const check of checks) {
    try {
      const response = await axiosInstance.get(check.url);
      const data = response.data.data;
      
      let count = 0;
      if (Array.isArray(data)) {
        count = data.length;
      } else if (data?.items) {
        count = data.items.length;
      } else if (data?.total !== undefined) {
        count = data.total;
      }

      if (count > 0) {
        console.log(`✅ ${check.name}: ${count} records found`);
      } else {
        console.log(`❌ ${check.name}: NO DATA (empty table)`);
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ERROR - ${error.response?.data?.message || error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('💡 DIAGNOSIS:\n');
  console.log('If tables show "NO DATA", you need to:');
  console.log('1. Run database seed: cd apps/api && npx prisma db seed');
  console.log('2. Or manually create test data through the UI');
  console.log('3. Or run SQL insert scripts');
}

checkData().catch(console.error);
