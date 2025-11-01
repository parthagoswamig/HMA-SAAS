/**
 * Check EXACT 30 modules as specified by user
 * One by one verification
 */

const axios = require('axios');
const fs = require('fs');

const CONFIG = {
  frontendUrl: 'https://hma-saas-web.vercel.app',
  backendUrl: 'https://hma-saas-1.onrender.com',
  credentials: { email: 'admin@test.com', password: 'Admin@123' }
};

// EXACT 30 modules as user specified
const EXACT_30_MODULES = [
  { id: 1, name: 'Authentication', routes: ['/login', '/signup', '/reset-password'] },
  { id: 2, name: 'Dashboard Overview', routes: ['/dashboard'] },
  { id: 3, name: 'Patients', routes: ['/dashboard/patients'] },
  { id: 4, name: 'IPD (Inpatient Department)', routes: ['/dashboard/ipd'] },
  { id: 5, name: 'OPD (Outpatient Department)', routes: ['/dashboard/opd'] },
  { id: 6, name: 'Admissions', routes: ['/dashboard/admissions'] },
  { id: 7, name: 'Discharge Summary', routes: ['/dashboard/discharge-summary'] },
  { id: 8, name: 'Appointments', routes: ['/dashboard/appointments'] },
  { id: 9, name: 'Radiology', routes: ['/dashboard/radiology'] },
  { id: 10, name: 'Laboratory', routes: ['/dashboard/laboratory'] },
  { id: 11, name: 'Pharmacy', routes: ['/dashboard/pharmacy'] },
  { id: 12, name: 'Billing', routes: ['/dashboard/billing'] },
  { id: 13, name: 'Insurance', routes: ['/dashboard/insurance'] },
  { id: 14, name: 'Inventory', routes: ['/dashboard/inventory'] },
  { id: 15, name: 'Assets', routes: ['/dashboard/assets'] },
  { id: 16, name: 'Staff', routes: ['/dashboard/staff'] },
  { id: 17, name: 'Departments', routes: ['/dashboard/departments'] },
  { id: 18, name: 'Roles & Permissions', routes: ['/dashboard/roles'] },
  { id: 19, name: 'Attendance', routes: ['/dashboard/attendance'] },
  { id: 20, name: 'Payroll', routes: ['/dashboard/payroll'] },
  { id: 21, name: 'Communications', routes: ['/dashboard/communications'] },
  { id: 22, name: 'Notifications', routes: ['/dashboard/notifications'] },
  { id: 23, name: 'Support', routes: ['/dashboard/support'] },
  { id: 24, name: 'Reports', routes: ['/dashboard/reports'] },
  { id: 25, name: 'Statistics', routes: ['/dashboard/statistics'] },
  { id: 26, name: 'Logs', routes: ['/dashboard/logs'] },
  { id: 27, name: 'Audit Trail', routes: ['/dashboard/audit'] },
  { id: 28, name: 'Settings', routes: ['/dashboard/settings'] },
  { id: 29, name: 'System Config', routes: ['/dashboard/system-config'] },
  { id: 30, name: 'Profile & Hospital Info', routes: ['/dashboard/profile'] },
];

let authToken = null;
const results = [];

async function authenticate() {
  console.log('🔐 Authenticating...\n');
  try {
    const response = await axios.post(`${CONFIG.backendUrl}/auth/login`, CONFIG.credentials, { timeout: 30000 });
    authToken = response.data.accessToken || response.data.access_token;
    console.log('✅ Authenticated\n');
    return true;
  } catch (error) {
    console.log('❌ Authentication failed:', error.message);
    return false;
  }
}

async function checkRoute(route) {
  try {
    const response = await axios.get(`${CONFIG.frontendUrl}${route}`, {
      timeout: 10000,
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      return { status: 'PASS', code: 200, size: response.data.length };
    } else {
      return { status: 'FAIL', code: response.status, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { status: 'ERROR', code: 0, error: error.message };
  }
}

async function checkModule(module) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Module ${module.id}: ${module.name}`);
  console.log('='.repeat(80));
  
  const moduleResult = {
    id: module.id,
    name: module.name,
    routes: [],
    overallStatus: 'PENDING'
  };
  
  let allPass = true;
  
  for (const route of module.routes) {
    const result = await checkRoute(route);
    
    console.log(`  Route: ${route}`);
    if (result.status === 'PASS') {
      console.log(`    ✅ PASS (${result.code}) - ${result.size} bytes`);
    } else {
      console.log(`    ❌ FAIL (${result.code}) - ${result.error}`);
      allPass = false;
    }
    
    moduleResult.routes.push({
      route,
      ...result
    });
  }
  
  moduleResult.overallStatus = allPass ? 'PASS' : 'FAIL';
  
  if (allPass) {
    console.log(`\n  ✅ Module ${module.id} Status: PASS`);
  } else {
    console.log(`\n  ❌ Module ${module.id} Status: FAIL`);
  }
  
  results.push(moduleResult);
}

async function runCheck() {
  console.log('🚀 Checking EXACT 30 Modules One by One');
  console.log('='.repeat(80));
  console.log('Frontend URL:', CONFIG.frontendUrl);
  console.log('='.repeat(80));
  
  await authenticate();
  
  // Check each module one by one
  for (const module of EXACT_30_MODULES) {
    await checkModule(module);
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.overallStatus === 'PASS').length;
  const failed = results.filter(r => r.overallStatus === 'FAIL').length;
  
  console.log(`\nTotal Modules: ${EXACT_30_MODULES.length}`);
  console.log(`✅ Passed: ${passed} (${((passed/EXACT_30_MODULES.length)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failed} (${((failed/EXACT_30_MODULES.length)*100).toFixed(1)}%)`);
  
  console.log('\n📋 Failed Modules:');
  results.filter(r => r.overallStatus === 'FAIL').forEach(m => {
    console.log(`  ${m.id}. ${m.name}`);
    m.routes.filter(r => r.status !== 'PASS').forEach(route => {
      console.log(`     - ${route.route}: ${route.error}`);
    });
  });
  
  const readiness = (passed / EXACT_30_MODULES.length * 100).toFixed(1);
  console.log(`\n🎯 SYSTEM READINESS: ${readiness}%`);
  
  if (readiness >= 95) {
    console.log('✅ System is PRODUCTION READY!');
  } else if (readiness >= 80) {
    console.log('⚠️  System is mostly ready, some issues remain');
  } else {
    console.log('❌ System needs more work');
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    totalModules: EXACT_30_MODULES.length,
    passed,
    failed,
    readiness: parseFloat(readiness),
    results
  };
  
  fs.writeFileSync('testsprite_tests/exact_30_modules_report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to: testsprite_tests/exact_30_modules_report.json');
  console.log('='.repeat(80));
}

runCheck().catch(console.error);
