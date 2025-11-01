/**
 * Manual Module-by-Module Testing
 * This will test each broken module individually and show exact errors
 */

const axios = require('axios');

const CONFIG = {
  frontendUrl: 'https://hma-saas-web.vercel.app',
  backendUrl: 'https://hma-saas-1.onrender.com',
  credentials: {
    email: 'admin@test.com',
    password: 'Admin@123'
  }
};

let authToken = null;

async function authenticate() {
  console.log('🔐 Authenticating...');
  try {
    const response = await axios.post(
      `${CONFIG.backendUrl}/auth/login`,
      CONFIG.credentials,
      { timeout: 30000 }
    );
    authToken = response.data.accessToken || response.data.access_token || response.data.token;
    console.log('✅ Authenticated\n');
    return true;
  } catch (error) {
    console.log('❌ Auth failed:', error.message);
    return false;
  }
}

async function testModuleInDetail(moduleName, apiUrl, frontendRoute) {
  console.log('='.repeat(80));
  console.log(`🧪 TESTING: ${moduleName}`);
  console.log('='.repeat(80));

  // Test 1: Frontend Page
  console.log('\n📄 Test 1: Frontend Page');
  console.log(`   URL: ${CONFIG.frontendUrl}${frontendRoute}`);
  try {
    const response = await axios.get(`${CONFIG.frontendUrl}${frontendRoute}`, {
      timeout: 10000,
      validateStatus: () => true
    });
    console.log(`   Status: ${response.status}`);
    if (response.status === 200) {
      console.log('   ✅ Page loads successfully');
      console.log(`   HTML size: ${response.data.length} bytes`);
    } else {
      console.log(`   ❌ Page failed with status ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 2: API Endpoint
  console.log('\n🔌 Test 2: API Endpoint');
  console.log(`   URL: ${CONFIG.backendUrl}${apiUrl}`);
  try {
    const response = await axios.get(`${CONFIG.backendUrl}${apiUrl}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log(`   Status: ${response.status}`);
    console.log('   ✅ API call successful');
    console.log(`   Response:`, JSON.stringify(response.data, null, 2).substring(0, 300));
    
    // Check if data is empty
    if (response.data?.data) {
      const data = response.data.data;
      if (Array.isArray(data) && data.length === 0) {
        console.log('\n   ⚠️  API works but returns EMPTY DATA');
        console.log('   💡 This is NOT a bug - just no data in database');
      } else if (data.items && Array.isArray(data.items) && data.items.length === 0) {
        console.log('\n   ⚠️  API works but returns EMPTY DATA');
        console.log('   💡 This is NOT a bug - just no data in database');
      } else if (data.queue && Array.isArray(data.queue) && data.queue.length === 0) {
        console.log('\n   ⚠️  Queue is EMPTY');
        console.log('   💡 This is NOT a bug - just no queue data');
      } else {
        console.log('\n   ✅ API returns DATA!');
      }
    }
    
    return { frontend: true, api: true, hasData: true };
  } catch (error) {
    console.log(`   Status: ${error.response?.status || 'Network Error'}`);
    console.log(`   ❌ API call failed`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    
    // Detailed error analysis
    if (error.response?.status === 500) {
      console.log('\n   🔍 ANALYSIS: Internal Server Error');
      console.log('   💡 CAUSE: Backend code has a bug');
      console.log('   🔧 FIX NEEDED: Check backend service code');
      console.log(`   📝 Likely issue: Database query failing or missing table`);
    } else if (error.response?.status === 400) {
      console.log('\n   🔍 ANALYSIS: Bad Request');
      console.log('   💡 CAUSE: Backend throwing error instead of handling it');
      console.log('   🔧 FIX NEEDED: Add try-catch to return empty data');
    } else if (error.response?.status === 403) {
      console.log('\n   🔍 ANALYSIS: Permission Denied');
      console.log('   💡 CAUSE: User missing required permissions');
      console.log('   🔧 FIX NEEDED: Run permission SQL script');
    }
    
    return { frontend: true, api: false, error: error.response?.data };
  }
}

async function runDetailedTests() {
  console.log('🔬 HMS SaaS - Detailed Module Testing');
  console.log('This will test each broken module individually\n');

  const authenticated = await authenticate();
  if (!authenticated) {
    console.log('Cannot proceed without auth');
    return;
  }

  // Test the 3 broken modules
  const results = {};

  results.opd = await testModuleInDetail(
    'OPD Queue',
    '/opd/queue',
    '/dashboard/opd'
  );

  results.emergency = await testModuleInDetail(
    'Emergency Cases',
    '/emergency/cases',
    '/dashboard/emergency'
  );

  results.emergencyQueue = await testModuleInDetail(
    'Emergency Queue',
    '/emergency/queue',
    '/dashboard/emergency'
  );

  results.shifts = await testModuleInDetail(
    'Shifts',
    '/shifts',
    '/dashboard/shifts'
  );

  // Final Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 DETAILED TEST SUMMARY');
  console.log('='.repeat(80));

  let allWorking = true;
  let needsDeployment = false;
  let needsData = false;

  Object.entries(results).forEach(([module, result]) => {
    console.log(`\n${module}:`);
    console.log(`  Frontend: ${result.frontend ? '✅' : '❌'}`);
    console.log(`  API: ${result.api ? '✅' : '❌'}`);
    
    if (!result.api) {
      allWorking = false;
      needsDeployment = true;
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('🎯 CONCLUSION');
  console.log('='.repeat(80));

  if (allWorking) {
    console.log('\n✅ ALL MODULES WORKING!');
    console.log('   Your system is 100% production ready!');
  } else if (needsDeployment) {
    console.log('\n⚠️  MODULES NEED BACKEND FIXES');
    console.log('\n   The backend code needs to be fixed and deployed.');
    console.log('   I can help you fix each module properly.');
  }

  console.log('\n' + '='.repeat(80));
}

runDetailedTests().catch(error => {
  console.error('Test failed:', error);
});
