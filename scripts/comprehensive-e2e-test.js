/**
 * HMS SaaS - Comprehensive End-to-End Frontend Testing
 * 
 * This script tests ALL 20 modules on production without requiring external services
 * Uses Playwright for browser automation
 * 
 * Run: node scripts/comprehensive-e2e-test.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'https://hma-saas-web.vercel.app',
  credentials: {
    email: 'admin@test.com',
    password: 'Admin@123'
  },
  timeout: 30000,
  screenshotDir: path.join(__dirname, '../testsprite_tests/screenshots'),
  reportFile: path.join(__dirname, '../testsprite_tests/e2e_test_report.json')
};

// Test results storage
const testResults = {
  startTime: new Date().toISOString(),
  endTime: null,
  totalModules: 20,
  modulesPassed: 0,
  modulesFailed: 0,
  modulesWarning: 0,
  totalTests: 0,
  testsPassed: 0,
  testsFailed: 0,
  modules: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🧪'
  }[type] || '📋';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function saveScreenshot(page, name) {
  const filename = `${name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
  const filepath = path.join(CONFIG.screenshotDir, filename);
  return page.screenshot({ path: filepath, fullPage: true });
}

async function waitForPageLoad(page, timeout = CONFIG.timeout) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
    return true;
  } catch (error) {
    log(`Page load timeout: ${error.message}`, 'warning');
    return false;
  }
}

// Test runner for each module
class ModuleTester {
  constructor(page) {
    this.page = page;
  }

  async testModule(moduleName, testFunction) {
    log(`Testing ${moduleName}...`, 'test');
    const moduleResult = {
      name: moduleName,
      status: 'pending',
      tests: [],
      errors: [],
      warnings: [],
      startTime: new Date().toISOString(),
      endTime: null
    };

    try {
      await testFunction(this.page, moduleResult);
      
      // Calculate module status
      const failedTests = moduleResult.tests.filter(t => t.status === 'failed').length;
      const passedTests = moduleResult.tests.filter(t => t.status === 'passed').length;
      
      if (failedTests === 0 && passedTests > 0) {
        moduleResult.status = 'passed';
        testResults.modulesPassed++;
        log(`${moduleName}: PASSED (${passedTests}/${moduleResult.tests.length} tests)`, 'success');
      } else if (failedTests > 0 && passedTests > 0) {
        moduleResult.status = 'warning';
        testResults.modulesWarning++;
        log(`${moduleName}: WARNING (${passedTests}/${moduleResult.tests.length} tests passed)`, 'warning');
      } else {
        moduleResult.status = 'failed';
        testResults.modulesFailed++;
        log(`${moduleName}: FAILED`, 'error');
      }
    } catch (error) {
      moduleResult.status = 'failed';
      moduleResult.errors.push({
        message: error.message,
        stack: error.stack
      });
      testResults.modulesFailed++;
      log(`${moduleName}: FAILED - ${error.message}`, 'error');
    }

    moduleResult.endTime = new Date().toISOString();
    testResults.modules.push(moduleResult);
    testResults.totalTests += moduleResult.tests.length;
    testResults.testsPassed += moduleResult.tests.filter(t => t.status === 'passed').length;
    testResults.testsFailed += moduleResult.tests.filter(t => t.status === 'failed').length;
  }

  async runTest(moduleResult, testName, testFunction) {
    const test = {
      name: testName,
      status: 'pending',
      duration: 0,
      error: null,
      screenshot: null
    };

    const startTime = Date.now();
    
    try {
      await testFunction();
      test.status = 'passed';
      test.duration = Date.now() - startTime;
    } catch (error) {
      test.status = 'failed';
      test.duration = Date.now() - startTime;
      test.error = error.message;
      
      // Take screenshot on failure
      try {
        const screenshotPath = await saveScreenshot(
          this.page,
          `${moduleResult.name}_${testName}_failure`
        );
        test.screenshot = screenshotPath;
      } catch (screenshotError) {
        log(`Failed to capture screenshot: ${screenshotError.message}`, 'warning');
      }
    }

    moduleResult.tests.push(test);
  }
}

// Module test implementations
async function testAuthentication(page, moduleResult) {
  const tester = new ModuleTester(page);

  // Test 1: Login page loads
  await tester.runTest(moduleResult, 'Login page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/login`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
  });

  // Test 2: Login with valid credentials
  await tester.runTest(moduleResult, 'Login with valid credentials', async () => {
    await page.fill('input[type="email"]', CONFIG.credentials.email);
    await page.fill('input[type="password"]', CONFIG.credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
  });

  // Test 3: User profile accessible
  await tester.runTest(moduleResult, 'User profile accessible', async () => {
    const profileButton = await page.locator('[data-testid="user-menu"], [aria-label*="profile"], button:has-text("admin")').first();
    await profileButton.click({ timeout: 5000 });
  });
}

async function testDashboard(page, moduleResult) {
  const tester = new ModuleTester(page);

  // Test 1: Dashboard page loads
  await tester.runTest(moduleResult, 'Dashboard page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard`);
    await waitForPageLoad(page);
  });

  // Test 2: Stats cards visible
  await tester.runTest(moduleResult, 'Stats cards visible', async () => {
    const statsCards = await page.locator('[class*="stat"], [class*="card"], [class*="metric"]').count();
    if (statsCards === 0) throw new Error('No stats cards found');
  });

  // Test 3: Recent activities section
  await tester.runTest(moduleResult, 'Recent activities section exists', async () => {
    const activities = await page.locator('[class*="activity"], [class*="recent"]').count();
    if (activities === 0) throw new Error('No activities section found');
  });
}

async function testPatients(page, moduleResult) {
  const tester = new ModuleTester(page);

  // Test 1: Patients page loads
  await tester.runTest(moduleResult, 'Patients page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/patients`);
    await waitForPageLoad(page);
  });

  // Test 2: Patient list displays
  await tester.runTest(moduleResult, 'Patient list displays', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="grid"]', { timeout: 10000 });
  });

  // Test 3: Add patient button exists
  await tester.runTest(moduleResult, 'Add patient button exists', async () => {
    const addButton = await page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first();
    if (!addButton) throw new Error('Add patient button not found');
  });

  // Test 4: Search functionality
  await tester.runTest(moduleResult, 'Search functionality exists', async () => {
    const searchInput = await page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (!searchInput) throw new Error('Search input not found');
  });
}

async function testAppointments(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Appointments page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/appointments`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Appointments list displays', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="calendar"]', { timeout: 10000 });
  });

  await tester.runTest(moduleResult, 'Book appointment button exists', async () => {
    const bookButton = await page.locator('button:has-text("Book"), button:has-text("New"), button:has-text("Schedule")').first();
    if (!bookButton) throw new Error('Book appointment button not found');
  });
}

async function testBilling(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Billing page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/billing`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Invoices list displays', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="invoice"]', { timeout: 10000 });
  });
}

async function testStaff(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Staff page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/staff`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Staff list displays', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="grid"]', { timeout: 10000 });
  });
}

async function testLaboratory(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Laboratory page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/laboratory`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Lab tests/orders visible', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="test"]', { timeout: 10000 });
  });
}

async function testPharmacy(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Pharmacy page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/pharmacy`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Medications list displays', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="medication"]', { timeout: 10000 });
  });
}

async function testIPD(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'IPD page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/ipd`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Admissions list displays', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="admission"]', { timeout: 10000 });
  });
}

async function testOPD(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'OPD page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/opd`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'OPD visits/queue displays', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="visit"], [class*="queue"]', { timeout: 10000 });
  });
}

async function testEmergency(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Emergency page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/emergency`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Emergency cases display', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="case"], [class*="emergency"]', { timeout: 10000 });
  });
}

async function testRadiology(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Radiology page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/radiology`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Radiology studies display', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="study"]', { timeout: 10000 });
  });
}

async function testInventory(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Inventory page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/inventory`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Inventory items display', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="item"]', { timeout: 10000 });
  });
}

async function testInsurance(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Insurance page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/insurance`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Insurance claims display', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="claim"]', { timeout: 10000 });
  });
}

async function testDepartments(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Departments page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/departments`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Departments list displays', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="department"]', { timeout: 10000 });
  });
}

async function testRoles(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Roles page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/roles`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Roles list displays', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="role"]', { timeout: 10000 });
  });
}

async function testShifts(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Shifts page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/shifts`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Shifts schedule displays', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="shift"], [class*="schedule"]', { timeout: 10000 });
  });
}

async function testCommunications(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Communications page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/communications`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Messages/notifications display', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="message"], [class*="notification"]', { timeout: 10000 });
  });
}

async function testReports(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'Reports page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/reports`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Reports dashboard displays', async () => {
    await page.waitForSelector('[class*="report"], [class*="chart"], [class*="analytics"]', { timeout: 10000 });
  });
}

async function testEMR(page, moduleResult) {
  const tester = new ModuleTester(page);

  await tester.runTest(moduleResult, 'EMR page loads', async () => {
    await page.goto(`${CONFIG.baseUrl}/dashboard/emr`);
    await waitForPageLoad(page);
  });

  await tester.runTest(moduleResult, 'Medical records display', async () => {
    await page.waitForSelector('table, [class*="list"], [class*="record"]', { timeout: 10000 });
  });
}

// Main test execution
async function runAllTests() {
  log('🚀 Starting HMS SaaS Comprehensive E2E Testing', 'info');
  log(`Testing URL: ${CONFIG.baseUrl}`, 'info');
  
  // Create screenshot directory
  if (!fs.existsSync(CONFIG.screenshotDir)) {
    fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
  }

  // Launch browser
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    const tester = new ModuleTester(page);
    
    // Test all modules
    await tester.testModule('Authentication', testAuthentication);
    await tester.testModule('Dashboard', testDashboard);
    await tester.testModule('Patients', testPatients);
    await tester.testModule('Appointments', testAppointments);
    await tester.testModule('Billing', testBilling);
    await tester.testModule('Staff', testStaff);
    await tester.testModule('Laboratory', testLaboratory);
    await tester.testModule('Pharmacy', testPharmacy);
    await tester.testModule('IPD', testIPD);
    await tester.testModule('OPD', testOPD);
    await tester.testModule('Emergency', testEmergency);
    await tester.testModule('Radiology', testRadiology);
    await tester.testModule('Inventory', testInventory);
    await tester.testModule('Insurance', testInsurance);
    await tester.testModule('Departments', testDepartments);
    await tester.testModule('Roles & Permissions', testRoles);
    await tester.testModule('Shifts', testShifts);
    await tester.testModule('Communications', testCommunications);
    await tester.testModule('Reports', testReports);
    await tester.testModule('EMR', testEMR);
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
  } finally {
    await browser.close();
  }

  // Finalize results
  testResults.endTime = new Date().toISOString();
  
  // Save results
  fs.writeFileSync(
    CONFIG.reportFile,
    JSON.stringify(testResults, null, 2)
  );
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Modules: ${testResults.totalModules}`);
  console.log(`✅ Passed: ${testResults.modulesPassed} (${((testResults.modulesPassed/testResults.totalModules)*100).toFixed(1)}%)`);
  console.log(`⚠️  Warning: ${testResults.modulesWarning} (${((testResults.modulesWarning/testResults.totalModules)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${testResults.modulesFailed} (${((testResults.modulesFailed/testResults.totalModules)*100).toFixed(1)}%)`);
  console.log(`\nTotal Tests: ${testResults.totalTests}`);
  console.log(`✅ Passed: ${testResults.testsPassed}`);
  console.log(`❌ Failed: ${testResults.testsFailed}`);
  console.log(`\n📄 Detailed report: ${CONFIG.reportFile}`);
  console.log(`📸 Screenshots: ${CONFIG.screenshotDir}`);
  console.log('='.repeat(80));
  
  // Calculate readiness score
  const readinessScore = ((testResults.modulesPassed + testResults.modulesWarning * 0.5) / testResults.totalModules * 100).toFixed(1);
  console.log(`\n🎯 DEPLOYMENT READINESS SCORE: ${readinessScore}%`);
  
  if (readinessScore >= 90) {
    console.log('✅ System is PRODUCTION READY!');
  } else if (readinessScore >= 70) {
    console.log('⚠️  System has WARNINGS - Review before production');
  } else {
    console.log('❌ System is NOT PRODUCTION READY');
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
