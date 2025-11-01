/**
 * HMS SaaS - Production Validation Script
 * Tests all modules on production environment
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  frontend: 'https://hma-saas-web.vercel.app',
  backend: 'https://hma-saas-1.onrender.com',
  credentials: {
    email: 'admin@test.com',
    password: 'Admin@123',
  },
};

let authToken = null;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test results storage
const results = {
  modules: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  },
  issues: [],
  fixes: [],
};

// Module definitions
const MODULES = [
  {
    id: 1,
    name: 'Authentication',
    priority: 'critical',
    endpoints: [
      { method: 'POST', path: '/auth/login', requiresAuth: false, testData: CONFIG.credentials },
      { method: 'GET', path: '/auth/profile', requiresAuth: true },
      { method: 'GET', path: '/auth/health', requiresAuth: false },
    ],
    routes: ['/login', '/signup'],
  },
  {
    id: 2,
    name: 'Dashboard',
    priority: 'critical',
    endpoints: [
      { method: 'GET', path: '/dashboard/stats', requiresAuth: true },
      { method: 'GET', path: '/dashboard/recent-activities', requiresAuth: true },
    ],
    routes: ['/dashboard'],
  },
  {
    id: 3,
    name: 'Patients',
    priority: 'critical',
    endpoints: [
      { method: 'GET', path: '/patients', requiresAuth: true },
      { method: 'GET', path: '/patients/stats', requiresAuth: true },
    ],
    routes: ['/dashboard/patients'],
  },
  {
    id: 4,
    name: 'Appointments',
    priority: 'critical',
    endpoints: [
      { method: 'GET', path: '/appointments', requiresAuth: true },
      { method: 'GET', path: '/appointments/stats', requiresAuth: true },
    ],
    routes: ['/dashboard/appointments'],
  },
  {
    id: 5,
    name: 'Billing',
    priority: 'critical',
    endpoints: [
      { method: 'GET', path: '/billing/invoices', requiresAuth: true },
      { method: 'GET', path: '/billing/invoices/stats', requiresAuth: true },
    ],
    routes: ['/dashboard/billing'],
  },
  {
    id: 6,
    name: 'Staff',
    priority: 'high',
    endpoints: [
      { method: 'GET', path: '/staff', requiresAuth: true },
      { method: 'GET', path: '/staff/stats', requiresAuth: true },
    ],
    routes: ['/dashboard/staff'],
  },
  {
    id: 7,
    name: 'Laboratory',
    priority: 'high',
    endpoints: [
      { method: 'GET', path: '/laboratory/tests', requiresAuth: true },
      { method: 'GET', path: '/laboratory/orders', requiresAuth: true },
    ],
    routes: ['/dashboard/laboratory'],
  },
  {
    id: 8,
    name: 'Pharmacy',
    priority: 'high',
    endpoints: [
      { method: 'GET', path: '/pharmacy/medications', requiresAuth: true },
      { method: 'GET', path: '/pharmacy/orders', requiresAuth: true },
    ],
    routes: ['/dashboard/pharmacy'],
  },
  {
    id: 9,
    name: 'IPD',
    priority: 'high',
    endpoints: [
      { method: 'GET', path: '/ipd/admissions', requiresAuth: true },
      { method: 'GET', path: '/ipd/wards', requiresAuth: true },
    ],
    routes: ['/dashboard/ipd'],
  },
  {
    id: 10,
    name: 'OPD',
    priority: 'high',
    endpoints: [
      { method: 'GET', path: '/opd/visits', requiresAuth: true },
      { method: 'GET', path: '/opd/queue', requiresAuth: true },
    ],
    routes: ['/dashboard/opd'],
  },
  {
    id: 11,
    name: 'Emergency',
    priority: 'high',
    endpoints: [
      { method: 'GET', path: '/emergency/cases', requiresAuth: true },
      { method: 'GET', path: '/emergency/queue', requiresAuth: true },
    ],
    routes: ['/dashboard/emergency'],
  },
  {
    id: 12,
    name: 'Radiology',
    priority: 'medium',
    endpoints: [
      { method: 'GET', path: '/radiology/studies', requiresAuth: true },
      { method: 'GET', path: '/radiology/orders', requiresAuth: true },
    ],
    routes: ['/dashboard/radiology'],
  },
  {
    id: 13,
    name: 'Inventory',
    priority: 'high',
    endpoints: [
      { method: 'GET', path: '/inventory', requiresAuth: true },
      { method: 'GET', path: '/inventory/stats', requiresAuth: true },
    ],
    routes: ['/dashboard/inventory'],
  },
  {
    id: 14,
    name: 'Insurance',
    priority: 'medium',
    endpoints: [
      { method: 'GET', path: '/insurance/claims', requiresAuth: true },
      { method: 'GET', path: '/insurance/stats', requiresAuth: true },
    ],
    routes: ['/dashboard/insurance'],
  },
  {
    id: 15,
    name: 'Departments',
    priority: 'medium',
    endpoints: [{ method: 'GET', path: '/hr/departments', requiresAuth: true }],
    routes: ['/dashboard/departments'],
  },
  {
    id: 16,
    name: 'Roles & Permissions',
    priority: 'critical',
    endpoints: [
      { method: 'GET', path: '/roles', requiresAuth: true },
      { method: 'GET', path: '/permissions', requiresAuth: true },
    ],
    routes: ['/dashboard/roles'],
  },
  {
    id: 17,
    name: 'Shifts',
    priority: 'medium',
    endpoints: [{ method: 'GET', path: '/shifts', requiresAuth: true }],
    routes: ['/dashboard/shifts'],
  },
  {
    id: 18,
    name: 'Communications',
    priority: 'medium',
    endpoints: [
      { method: 'GET', path: '/communications/messages', requiresAuth: true },
      { method: 'GET', path: '/communications/notifications', requiresAuth: true },
    ],
    routes: ['/dashboard/communications'],
  },
  {
    id: 19,
    name: 'Reports',
    priority: 'medium',
    endpoints: [{ method: 'GET', path: '/reports/dashboard', requiresAuth: true }],
    routes: ['/dashboard/reports'],
  },
  {
    id: 20,
    name: 'EMR',
    priority: 'high',
    endpoints: [{ method: 'GET', path: '/emr/records', requiresAuth: true }],
    routes: ['/dashboard/emr'],
  },
];

async function authenticate() {
  log('\n🔐 Authenticating...', 'cyan');
  
  // First wake up the backend
  try {
    log('  ⏳ Waking up backend server...', 'yellow');
    await axios.get(`${CONFIG.backend}/health`, { timeout: 60000 });
    log('  ✅ Backend is awake', 'green');
  } catch (error) {
    log(`  ⚠️  Backend health check failed: ${error.message}`, 'yellow');
  }

  // Now try to authenticate with retries
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      log(`  🔑 Login attempt ${attempt}/3...`, 'cyan');
      const response = await axios.post(`${CONFIG.backend}/auth/login`, CONFIG.credentials, {
        timeout: 30000,
      });

      if (response.data.accessToken || response.data.access_token) {
        authToken = response.data.accessToken || response.data.access_token;
        log('✅ Authentication successful', 'green');
        return true;
      }
    } catch (error) {
      log(`  ❌ Attempt ${attempt} failed: ${error.message}`, 'red');
      if (attempt < 3) {
        log(`  ⏳ Waiting 5 seconds before retry...`, 'yellow');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  log('❌ Authentication failed after 3 attempts', 'red');
  results.issues.push({
    module: 'Authentication',
    severity: 'critical',
    type: 'AUTH_ERROR',
    description: 'Failed to authenticate after 3 attempts',
    location: '/auth/login',
  });
  return false;
}

async function testEndpoint(endpoint) {
  const url = `${CONFIG.backend}${endpoint.path}`;
  const headers = {};

  if (endpoint.requiresAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    let response;
    const startTime = Date.now();

    if (endpoint.method === 'GET') {
      response = await axios.get(url, { headers, timeout: 15000 });
    } else if (endpoint.method === 'POST') {
      response = await axios.post(url, endpoint.testData || {}, { headers, timeout: 15000 });
    }

    const duration = Date.now() - startTime;
    const success = response.status >= 200 && response.status < 300;

    return {
      success,
      status: response.status,
      duration,
      error: null,
    };
  } catch (error) {
    const duration = Date.now() - (error.config?.startTime || Date.now());
    return {
      success: false,
      status: error.response?.status || 0,
      duration,
      error: error.response?.data?.message || error.message,
    };
  }
}

async function testRoute(route) {
  const url = `${CONFIG.frontend}${route}`;

  try {
    const startTime = Date.now();
    const response = await axios.get(url, { timeout: 10000 });
    const duration = Date.now() - startTime;

    return {
      success: response.status === 200,
      status: response.status,
      duration,
      error: null,
    };
  } catch (error) {
    const duration = Date.now() - Date.now();
    return {
      success: false,
      status: error.response?.status || 0,
      duration,
      error: error.message,
    };
  }
}

async function validateModule(module) {
  log(`\n📦 Testing ${module.name} (Priority: ${module.priority})`, 'blue');

  const moduleResult = {
    id: module.id,
    name: module.name,
    priority: module.priority,
    status: 'PASS',
    tests: [],
    issues: [],
  };

  // Test API endpoints
  for (const endpoint of module.endpoints || []) {
    const result = await testEndpoint(endpoint);
    const testName = `${endpoint.method} ${endpoint.path}`;

    moduleResult.tests.push({
      name: testName,
      type: 'API',
      status: result.success ? 'PASS' : 'FAIL',
      duration: result.duration,
      error: result.error,
    });

    if (result.success) {
      log(`  ✅ ${testName} (${result.duration}ms)`, 'green');
    } else {
      log(`  ❌ ${testName} - ${result.error || 'Failed'}`, 'red');
      moduleResult.status = module.priority === 'critical' ? 'FAIL' : 'WARNING';
      moduleResult.issues.push({
        type: 'API_ERROR',
        severity: module.priority === 'critical' ? 'critical' : 'high',
        description: result.error || 'API endpoint failed',
        location: `${endpoint.method} ${endpoint.path}`,
      });
    }
  }

  // Test frontend routes
  for (const route of module.routes || []) {
    const result = await testRoute(route);
    const testName = `Route: ${route}`;

    moduleResult.tests.push({
      name: testName,
      type: 'ROUTE',
      status: result.success ? 'PASS' : 'FAIL',
      duration: result.duration,
      error: result.error,
    });

    if (result.success) {
      log(`  ✅ ${testName} (${result.duration}ms)`, 'green');
    } else {
      log(`  ⚠️  ${testName} - ${result.error || 'Failed'}`, 'yellow');
      if (moduleResult.status === 'PASS') {
        moduleResult.status = 'WARNING';
      }
    }
  }

  const passedTests = moduleResult.tests.filter((t) => t.status === 'PASS').length;
  const totalTests = moduleResult.tests.length;

  log(`  📊 Result: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');

  results.modules.push(moduleResult);
  results.summary.total++;

  if (moduleResult.status === 'PASS') {
    results.summary.passed++;
  } else if (moduleResult.status === 'WARNING') {
    results.summary.warnings++;
  } else {
    results.summary.failed++;
  }

  results.issues.push(...moduleResult.issues);
}

function generateReport() {
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 PRODUCTION VALIDATION REPORT', 'cyan');
  log('='.repeat(80), 'cyan');

  log('\n📈 SUMMARY:', 'blue');
  log(`   Total Modules: ${results.summary.total}`);
  log(`   ✅ Passed: ${results.summary.passed} (${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%)`, 'green');
  log(`   ⚠️  Warnings: ${results.summary.warnings} (${((results.summary.warnings / results.summary.total) * 100).toFixed(1)}%)`, 'yellow');
  log(`   ❌ Failed: ${results.summary.failed} (${((results.summary.failed / results.summary.total) * 100).toFixed(1)}%)`, 'red');

  log(`\n🔍 ISSUES FOUND: ${results.issues.length}`, 'blue');
  const criticalIssues = results.issues.filter((i) => i.severity === 'critical');
  const highIssues = results.issues.filter((i) => i.severity === 'high');
  const mediumIssues = results.issues.filter((i) => i.severity === 'medium');

  log(`   🔴 Critical: ${criticalIssues.length}`, 'red');
  log(`   🟠 High: ${highIssues.length}`, 'yellow');
  log(`   🟡 Medium: ${mediumIssues.length}`, 'yellow');

  log('\n📦 MODULE RESULTS:\n', 'blue');
  for (const module of results.modules) {
    const icon = module.status === 'PASS' ? '✅' : module.status === 'WARNING' ? '⚠️' : '❌';
    const passedTests = module.tests.filter((t) => t.status === 'PASS').length;
    const color = module.status === 'PASS' ? 'green' : module.status === 'WARNING' ? 'yellow' : 'red';

    log(`${icon} ${module.name}: ${passedTests}/${module.tests.length} tests passed`, color);

    if (module.issues.length > 0) {
      module.issues.forEach((issue) => {
        log(`   └─ ${issue.severity.toUpperCase()}: ${issue.description}`, 'red');
      });
    }
  }

  // Save detailed report
  const reportPath = path.join(__dirname, '../testsprite_tests/production_validation_report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        environment: {
          frontend: CONFIG.frontend,
          backend: CONFIG.backend,
        },
        summary: results.summary,
        modules: results.modules,
        issues: results.issues,
        fixes: results.fixes,
      },
      null,
      2
    )
  );

  log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');
  log('\n' + '='.repeat(80), 'cyan');

  // Deployment readiness score
  const score = ((results.summary.passed / results.summary.total) * 100).toFixed(1);
  log(`\n🎯 DEPLOYMENT READINESS SCORE: ${score}%`, score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red');

  if (score >= 80) {
    log('✅ System is PRODUCTION READY', 'green');
  } else if (score >= 60) {
    log('⚠️  System has WARNINGS - Review before production', 'yellow');
  } else {
    log('❌ System is NOT READY for production', 'red');
  }
}

async function main() {
  log('🚀 HMS SaaS - Production Validation Starting...', 'cyan');
  log(`Frontend: ${CONFIG.frontend}`, 'blue');
  log(`Backend: ${CONFIG.backend}`, 'blue');

  // Authenticate
  const authenticated = await authenticate();
  if (!authenticated) {
    log('\n❌ Cannot proceed without authentication', 'red');
    process.exit(1);
  }

  // Test all modules
  for (const module of MODULES) {
    await validateModule(module);
  }

  // Generate report
  generateReport();
}

main().catch((error) => {
  log(`\n❌ Validation failed: ${error.message}`, 'red');
  process.exit(1);
});
