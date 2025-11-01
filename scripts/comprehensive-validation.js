/**
 * HMS SaaS - Comprehensive Frontend & Backend Validation
 * Tests ALL 20 modules end-to-end without external dependencies
 * 
 * Run: node scripts/comprehensive-validation.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  frontendUrl: 'https://hma-saas-web.vercel.app',
  backendUrl: 'https://hma-saas-1.onrender.com',
  credentials: {
    email: 'admin@test.com',
    password: 'Admin@123'
  },
  timeout: 30000
};

// Test results
const results = {
  startTime: new Date().toISOString(),
  endTime: null,
  summary: {
    totalModules: 20,
    passed: 0,
    warning: 0,
    failed: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0
  },
  modules: []
};

let authToken = null;
let axiosInstance = null;

// Utility functions
function log(message, type = 'info') {
  const icons = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🧪'
  };
  console.log(`${icons[type] || '📋'} ${message}`);
}

// Initialize axios with auth
function createAxiosInstance(token) {
  return axios.create({
    baseURL: CONFIG.backendUrl,
    timeout: CONFIG.timeout,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

// Authentication with retry
async function authenticate() {
  log('🔐 Authenticating...', 'info');
  
  // Wake up backend first
  log('  ⏳ Waking up backend server...', 'info');
  try {
    await axios.get(`${CONFIG.backendUrl}/auth/health`, { timeout: 60000 });
    log('  ✅ Backend is awake', 'success');
  } catch (error) {
    log('  ⚠️  Backend health check failed, will retry login', 'warning');
  }
  
  // Try login with retries
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      log(`  🔑 Login attempt ${attempt}/3...`, 'info');
      
      const response = await axios.post(
        `${CONFIG.backendUrl}/auth/login`,
        CONFIG.credentials,
        { timeout: 30000 }
      );
      
      authToken = response.data.accessToken || response.data.access_token || response.data.token;
      axiosInstance = createAxiosInstance(authToken);
      
      log('✅ Authentication successful', 'success');
      return true;
    } catch (error) {
      log(`  ❌ Attempt ${attempt} failed: ${error.message}`, 'error');
      
      if (attempt < 3) {
        log('  ⏳ Waiting 5 seconds before retry...', 'info');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  log('❌ Authentication failed after 3 attempts', 'error');
  return false;
}

// Test a single endpoint
async function testEndpoint(method, url, description) {
  const test = {
    method,
    url,
    description,
    status: 'pending',
    responseTime: 0,
    statusCode: null,
    error: null
  };

  const startTime = Date.now();
  
  try {
    const response = await axiosInstance[method.toLowerCase()](url);
    test.responseTime = Date.now() - startTime;
    test.statusCode = response.status;
    test.status = 'passed';
    test.dataReceived = response.data ? true : false;
    
    return test;
  } catch (error) {
    test.responseTime = Date.now() - startTime;
    test.statusCode = error.response?.status || 0;
    test.error = error.response?.data?.message || error.message;
    test.status = 'failed';
    
    return test;
  }
}

// Test frontend route
async function testFrontendRoute(route, description) {
  const test = {
    route,
    description,
    status: 'pending',
    responseTime: 0,
    statusCode: null,
    error: null
  };

  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${CONFIG.frontendUrl}${route}`, {
      timeout: 15000,
      validateStatus: () => true // Accept any status
    });
    
    test.responseTime = Date.now() - startTime;
    test.statusCode = response.status;
    test.status = response.status === 200 ? 'passed' : 'warning';
    test.htmlReceived = response.data.length > 0;
    
    return test;
  } catch (error) {
    test.responseTime = Date.now() - startTime;
    test.error = error.message;
    test.status = 'failed';
    
    return test;
  }
}

// Test module
async function testModule(moduleName, tests) {
  log(`\n📦 Testing ${moduleName}...`, 'test');
  
  const module = {
    name: moduleName,
    status: 'pending',
    tests: [],
    passed: 0,
    failed: 0,
    warning: 0
  };

  for (const test of tests) {
    const result = test.type === 'api' 
      ? await testEndpoint(test.method, test.url, test.description)
      : await testFrontendRoute(test.route, test.description);
    
    module.tests.push(result);
    
    if (result.status === 'passed') {
      module.passed++;
      log(`  ✅ ${result.description} (${result.responseTime}ms)`, 'success');
    } else if (result.status === 'warning') {
      module.warning++;
      log(`  ⚠️  ${result.description} - ${result.error || 'Warning'}`, 'warning');
    } else {
      module.failed++;
      log(`  ❌ ${result.description} - ${result.error}`, 'error');
    }
  }

  // Determine module status
  if (module.failed === 0 && module.passed > 0) {
    module.status = 'passed';
    results.summary.passed++;
  } else if (module.failed > 0 && module.passed > 0) {
    module.status = 'warning';
    results.summary.warning++;
  } else {
    module.status = 'failed';
    results.summary.failed++;
  }

  results.summary.totalTests += module.tests.length;
  results.summary.passedTests += module.passed;
  results.summary.failedTests += module.failed;
  
  results.modules.push(module);
  
  log(`📊 Result: ${module.passed}/${module.tests.length} tests passed`, 
      module.status === 'passed' ? 'success' : module.status === 'warning' ? 'warning' : 'error');
}

// Main test execution
async function runAllTests() {
  console.log('🚀 HMS SaaS - Comprehensive Validation Starting...\n');
  console.log(`Frontend: ${CONFIG.frontendUrl}`);
  console.log(`Backend: ${CONFIG.backendUrl}\n`);

  // Authenticate
  const authenticated = await authenticate();
  if (!authenticated) {
    log('Cannot proceed without authentication', 'error');
    process.exit(1);
  }

  // Module 1: Authentication
  await testModule('Authentication', [
    { type: 'api', method: 'GET', url: '/auth/profile', description: 'Get profile' },
    { type: 'api', method: 'GET', url: '/auth/health', description: 'Health check' },
    { type: 'frontend', route: '/login', description: 'Login page' },
    { type: 'frontend', route: '/signup', description: 'Signup page' }
  ]);

  // Module 2: Dashboard
  await testModule('Dashboard', [
    { type: 'api', method: 'GET', url: '/dashboard/stats', description: 'Dashboard stats' },
    { type: 'api', method: 'GET', url: '/dashboard/recent-activities', description: 'Recent activities' },
    { type: 'frontend', route: '/dashboard', description: 'Dashboard page' }
  ]);

  // Module 3: Patients
  await testModule('Patients', [
    { type: 'api', method: 'GET', url: '/patients', description: 'List patients' },
    { type: 'api', method: 'GET', url: '/patients/stats', description: 'Patient stats' },
    { type: 'frontend', route: '/dashboard/patients', description: 'Patients page' },
    { type: 'frontend', route: '/dashboard/patients/add', description: 'Add patient page' }
  ]);

  // Module 4: Appointments
  await testModule('Appointments', [
    { type: 'api', method: 'GET', url: '/appointments', description: 'List appointments' },
    { type: 'api', method: 'GET', url: '/appointments/stats', description: 'Appointment stats' },
    { type: 'frontend', route: '/dashboard/appointments', description: 'Appointments page' }
  ]);

  // Module 5: Billing
  await testModule('Billing', [
    { type: 'api', method: 'GET', url: '/billing/invoices', description: 'List invoices' },
    { type: 'api', method: 'GET', url: '/billing/invoices/stats', description: 'Billing stats' },
    { type: 'frontend', route: '/dashboard/billing', description: 'Billing page' }
  ]);

  // Module 6: Staff
  await testModule('Staff', [
    { type: 'api', method: 'GET', url: '/staff', description: 'List staff' },
    { type: 'api', method: 'GET', url: '/staff/stats', description: 'Staff stats' },
    { type: 'frontend', route: '/dashboard/staff', description: 'Staff page' }
  ]);

  // Module 7: Laboratory
  await testModule('Laboratory', [
    { type: 'api', method: 'GET', url: '/laboratory/tests', description: 'List lab tests' },
    { type: 'api', method: 'GET', url: '/laboratory/orders', description: 'List lab orders' },
    { type: 'frontend', route: '/dashboard/laboratory', description: 'Laboratory page' }
  ]);

  // Module 8: Pharmacy
  await testModule('Pharmacy', [
    { type: 'api', method: 'GET', url: '/pharmacy/medications', description: 'List medications' },
    { type: 'api', method: 'GET', url: '/pharmacy/orders', description: 'List pharmacy orders' },
    { type: 'frontend', route: '/dashboard/pharmacy', description: 'Pharmacy page' }
  ]);

  // Module 9: IPD
  await testModule('IPD', [
    { type: 'api', method: 'GET', url: '/ipd/admissions', description: 'List admissions' },
    { type: 'api', method: 'GET', url: '/ipd/wards', description: 'List wards' },
    { type: 'frontend', route: '/dashboard/ipd', description: 'IPD page' }
  ]);

  // Module 10: OPD
  await testModule('OPD', [
    { type: 'api', method: 'GET', url: '/opd/visits', description: 'List OPD visits' },
    { type: 'api', method: 'GET', url: '/opd/queue', description: 'OPD queue' },
    { type: 'frontend', route: '/dashboard/opd', description: 'OPD page' }
  ]);

  // Module 11: Emergency
  await testModule('Emergency', [
    { type: 'api', method: 'GET', url: '/emergency/cases', description: 'List emergency cases' },
    { type: 'api', method: 'GET', url: '/emergency/queue', description: 'Emergency queue' },
    { type: 'frontend', route: '/dashboard/emergency', description: 'Emergency page' }
  ]);

  // Module 12: Radiology
  await testModule('Radiology', [
    { type: 'api', method: 'GET', url: '/radiology/studies', description: 'List studies' },
    { type: 'api', method: 'GET', url: '/radiology/orders', description: 'List orders' },
    { type: 'frontend', route: '/dashboard/radiology', description: 'Radiology page' }
  ]);

  // Module 13: Inventory
  await testModule('Inventory', [
    { type: 'api', method: 'GET', url: '/inventory', description: 'List inventory' },
    { type: 'api', method: 'GET', url: '/inventory/stats', description: 'Inventory stats' },
    { type: 'frontend', route: '/dashboard/inventory', description: 'Inventory page' }
  ]);

  // Module 14: Insurance
  await testModule('Insurance', [
    { type: 'api', method: 'GET', url: '/insurance/claims', description: 'List claims' },
    { type: 'api', method: 'GET', url: '/insurance/stats', description: 'Insurance stats' },
    { type: 'frontend', route: '/dashboard/insurance', description: 'Insurance page' }
  ]);

  // Module 15: Departments
  await testModule('Departments', [
    { type: 'api', method: 'GET', url: '/hr/departments', description: 'List departments' },
    { type: 'frontend', route: '/dashboard/departments', description: 'Departments page' }
  ]);

  // Module 16: Roles & Permissions
  await testModule('Roles & Permissions', [
    { type: 'api', method: 'GET', url: '/roles', description: 'List roles' },
    { type: 'api', method: 'GET', url: '/permissions', description: 'List permissions' },
    { type: 'frontend', route: '/dashboard/roles', description: 'Roles page' }
  ]);

  // Module 17: Shifts
  await testModule('Shifts', [
    { type: 'api', method: 'GET', url: '/shifts', description: 'List shifts' },
    { type: 'frontend', route: '/dashboard/shifts', description: 'Shifts page' }
  ]);

  // Module 18: Communications
  await testModule('Communications', [
    { type: 'api', method: 'GET', url: '/communications/messages', description: 'List messages' },
    { type: 'api', method: 'GET', url: '/communications/notifications', description: 'List notifications' },
    { type: 'frontend', route: '/dashboard/communications', description: 'Communications page' }
  ]);

  // Module 19: Reports
  await testModule('Reports', [
    { type: 'api', method: 'GET', url: '/reports/dashboard', description: 'Reports dashboard' },
    { type: 'frontend', route: '/dashboard/reports', description: 'Reports page' }
  ]);

  // Module 20: EMR
  await testModule('EMR', [
    { type: 'api', method: 'GET', url: '/emr/records', description: 'List medical records' },
    { type: 'frontend', route: '/dashboard/emr', description: 'EMR page' }
  ]);

  // Finalize results
  results.endTime = new Date().toISOString();
  
  // Save results
  const reportPath = path.join(__dirname, '../testsprite_tests/comprehensive_validation_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE VALIDATION REPORT');
  console.log('='.repeat(80));
  console.log(`\n📈 SUMMARY:`);
  console.log(`   Total Modules: ${results.summary.totalModules}`);
  console.log(`   ✅ Passed: ${results.summary.passed} (${((results.summary.passed/results.summary.totalModules)*100).toFixed(1)}%)`);
  console.log(`   ⚠️  Warnings: ${results.summary.warning} (${((results.summary.warning/results.summary.totalModules)*100).toFixed(1)}%)`);
  console.log(`   ❌ Failed: ${results.summary.failed} (${((results.summary.failed/results.summary.totalModules)*100).toFixed(1)}%)`);
  console.log(`\n   Total Tests: ${results.summary.totalTests}`);
  console.log(`   ✅ Passed: ${results.summary.passedTests}`);
  console.log(`   ❌ Failed: ${results.summary.failedTests}`);
  
  // Calculate readiness
  const readiness = ((results.summary.passed + results.summary.warning * 0.5) / results.summary.totalModules * 100).toFixed(1);
  console.log(`\n🎯 DEPLOYMENT READINESS SCORE: ${readiness}%`);
  
  if (readiness >= 90) {
    console.log('✅ System is PRODUCTION READY');
  } else if (readiness >= 70) {
    console.log('⚠️  System has WARNINGS - Review before production');
  } else {
    console.log('❌ System is NOT PRODUCTION READY');
  }
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  console.log('='.repeat(80));
}

// Run
runAllTests().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
