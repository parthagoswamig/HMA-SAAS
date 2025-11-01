/**
 * Test if pages actually WORK (not just load)
 * Check for forms, buttons, API calls, etc.
 */

const axios = require('axios');

const CONFIG = {
  frontendUrl: 'https://hma-saas-web.vercel.app',
  backendUrl: 'https://hma-saas-1.onrender.com',
  credentials: { email: 'admin@test.com', password: 'Admin@123' }
};

const MODULES_TO_TEST = [
  { name: 'Patients', route: '/dashboard/patients', hasForm: true, apiEndpoint: '/patients' },
  { name: 'Appointments', route: '/dashboard/appointments', hasForm: true, apiEndpoint: '/appointments' },
  { name: 'OPD', route: '/dashboard/opd', hasForm: true, apiEndpoint: '/opd/visits' },
  { name: 'IPD', route: '/dashboard/ipd', hasForm: true, apiEndpoint: '/ipd/admissions' },
  { name: 'Billing', route: '/dashboard/billing', hasForm: true, apiEndpoint: '/billing/invoices' },
  { name: 'Staff', route: '/dashboard/staff', hasForm: true, apiEndpoint: '/staff' },
];

let authToken = null;

async function authenticate() {
  console.log('🔐 Authenticating...\n');
  const response = await axios.post(`${CONFIG.backendUrl}/auth/login`, CONFIG.credentials);
  authToken = response.data.accessToken || response.data.access_token;
  console.log('✅ Authenticated\n');
}

async function testPageFunctionality(module) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${module.name}`);
  console.log('='.repeat(80));
  
  // Test 1: Page loads
  console.log('\n1️⃣ Testing if page loads...');
  try {
    const pageResponse = await axios.get(`${CONFIG.frontendUrl}${module.route}`, { timeout: 10000 });
    if (pageResponse.status === 200) {
      console.log('   ✅ Page loads (200 OK)');
      console.log(`   📄 Page size: ${pageResponse.data.length} bytes`);
    } else {
      console.log(`   ❌ Page failed: ${pageResponse.status}`);
      return;
    }
  } catch (error) {
    console.log(`   ❌ Page load error: ${error.message}`);
    return;
  }
  
  // Test 2: API endpoint works
  console.log('\n2️⃣ Testing if API endpoint works...');
  try {
    const apiResponse = await axios.get(`${CONFIG.backendUrl}${module.apiEndpoint}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
      timeout: 15000
    });
    
    if (apiResponse.status === 200) {
      console.log('   ✅ API works (200 OK)');
      console.log(`   📊 Data received: ${JSON.stringify(apiResponse.data).substring(0, 100)}...`);
    } else {
      console.log(`   ❌ API failed: ${apiResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ API error: ${error.response?.data?.message || error.message}`);
  }
  
  // Test 3: Check if it's a real page or placeholder
  console.log('\n3️⃣ Checking if page has real content...');
  try {
    const pageResponse = await axios.get(`${CONFIG.frontendUrl}${module.route}`);
    const html = pageResponse.data;
    
    const hasTable = html.includes('table') || html.includes('Table');
    const hasButton = html.includes('button') || html.includes('Button') || html.includes('Add') || html.includes('Create');
    const hasForm = html.includes('form') || html.includes('Form');
    const isPlaceholder = html.includes('will be displayed here') || html.includes('Coming soon');
    
    if (isPlaceholder) {
      console.log('   ⚠️  This is a PLACEHOLDER page (not fully implemented)');
    } else if (hasTable || hasButton || hasForm) {
      console.log('   ✅ Page has real content (tables/buttons/forms)');
    } else {
      console.log('   ⚠️  Page might be empty or minimal');
    }
  } catch (error) {
    console.log(`   ❌ Could not check content: ${error.message}`);
  }
}

async function runTests() {
  console.log('🧪 Testing Page Functionality (Not Just Loading)\n');
  console.log('This will check if pages actually WORK, not just load\n');
  
  await authenticate();
  
  for (const module of MODULES_TO_TEST) {
    await testPageFunctionality(module);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ TESTING COMPLETE');
  console.log('='.repeat(80));
  console.log('\nIf you see "PLACEHOLDER" warnings, those pages need full implementation.');
  console.log('If you see API errors, the backend needs fixes.');
  console.log('If pages redirect to login, there might be auth issues.');
}

runTests().catch(console.error);
