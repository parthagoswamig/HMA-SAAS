// Automated Module Testing Script
// Run with: node test-modules.js

const fs = require('fs');
const path = require('path');

console.log('🔍 HMS Module Verification Script\n');
console.log('=' .repeat(60));

// List of all modules to check
const modules = [
  // Pre-existing modules
  { name: 'Auth', path: 'auth', status: 'pre-existing' },
  { name: 'Patients', path: 'patients', status: 'pre-existing' },
  { name: 'Appointments', path: 'appointments', status: 'pre-existing' },
  { name: 'Staff', path: 'staff', status: 'pre-existing' },
  { name: 'Laboratory', path: 'laboratory', status: 'pre-existing' },
  { name: 'Pharmacy', path: 'pharmacy', status: 'pre-existing' },
  { name: 'Billing', path: 'billing', status: 'pre-existing' },
  
  // Newly created modules
  { name: 'OPD', path: 'opd', status: 'new' },
  { name: 'EMR', path: 'emr', status: 'new' },
  { name: 'Radiology', path: 'radiology', status: 'new' },
  { name: 'Pathology', path: 'pathology', status: 'new' },
  { name: 'Finance', path: 'finance', status: 'new' },
  { name: 'HR', path: 'hr', status: 'new' },
  { name: 'Reports', path: 'reports', status: 'new' },
  { name: 'Patient Portal', path: 'patient-portal', status: 'new' },
  { name: 'Telemedicine', path: 'telemedicine', status: 'new' },
  { name: 'Pharmacy Management', path: 'pharmacy-management', status: 'new' },
  { name: 'IPD', path: 'ipd', status: 'new' },
  { name: 'Emergency', path: 'emergency', status: 'new' },
  { name: 'Surgery', path: 'surgery', status: 'new' },
  { name: 'Inventory', path: 'inventory', status: 'new' },
  { name: 'Insurance', path: 'insurance', status: 'new' },
  { name: 'Communications', path: 'communications', status: 'new' },
  { name: 'Quality', path: 'quality', status: 'new', inmemory: true },
  { name: 'Research', path: 'research', status: 'new', inmemory: true },
  { name: 'Integration', path: 'integration', status: 'new', inmemory: true },
];

const results = {
  total: modules.length,
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

// Check each module
modules.forEach((module, index) => {
  console.log(`\n${index + 1}. Checking ${module.name} Module...`);
  
  const moduleDir = path.join(__dirname, 'src', module.path);
  const result = {
    name: module.name,
    path: module.path,
    files: {},
    issues: [],
    status: 'UNKNOWN'
  };
  
  // Check module directory exists
  if (!fs.existsSync(moduleDir)) {
    result.issues.push('Module directory not found');
    result.status = 'FAILED';
    results.failed++;
    console.log(`   ❌ Directory not found: ${moduleDir}`);
  } else {
    console.log(`   ✅ Directory exists`);
    
    // Check for required files
    const requiredFiles = [
      `${module.path}.module.ts`,
      `${module.path}.controller.ts`,
      `${module.path}.service.ts`
    ];
    
    let allFilesExist = true;
    requiredFiles.forEach(file => {
      const filePath = path.join(moduleDir, file);
      result.files[file] = fs.existsSync(filePath);
      
      if (result.files[file]) {
        console.log(`   ✅ ${file}`);
        
        // Check file content
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Basic validation
        if (content.includes('@Module') || content.includes('@Controller') || content.includes('@Injectable')) {
          console.log(`      ✓ Valid NestJS decorator found`);
        } else {
          result.issues.push(`${file} missing NestJS decorators`);
          console.log(`      ⚠️  Missing decorators`);
          results.warnings++;
        }
        
        // Check imports
        if (content.includes('PrismaService') && !module.inmemory) {
          console.log(`      ✓ Prisma service imported`);
        } else if (!module.inmemory) {
          console.log(`      ℹ️  No Prisma service (might be intentional)`);
        }
        
        // Check JWT guard
        if (file.includes('controller') && content.includes('JwtAuthGuard')) {
          console.log(`      ✓ JWT authentication configured`);
        } else if (file.includes('controller') && !content.includes('JwtAuthGuard') && module.path !== 'auth') {
          result.issues.push('No JWT guard in controller');
          console.log(`      ⚠️  No JWT guard found`);
          results.warnings++;
        }
        
      } else {
        allFilesExist = false;
        result.issues.push(`Missing ${file}`);
        console.log(`   ❌ ${file} not found`);
      }
    });
    
    // Determine status
    if (allFilesExist && result.issues.length === 0) {
      result.status = 'PASSED';
      results.passed++;
      console.log(`   ✅ Module structure: VALID`);
    } else if (allFilesExist && result.issues.length > 0 && result.issues.every(i => i.includes('⚠️'))) {
      result.status = 'PASSED WITH WARNINGS';
      results.passed++;
      console.log(`   ⚠️  Module structure: VALID (with warnings)`);
    } else {
      result.status = 'FAILED';
      results.failed++;
      console.log(`   ❌ Module structure: INVALID`);
    }
  }
  
  results.details.push(result);
});

// Print summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 VERIFICATION SUMMARY\n');
console.log(`Total Modules: ${results.total}`);
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`\nSuccess Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

// List failed modules
if (results.failed > 0) {
  console.log('\n⚠️  FAILED MODULES:');
  results.details.filter(r => r.status === 'FAILED').forEach(r => {
    console.log(`   - ${r.name}: ${r.issues.join(', ')}`);
  });
}

// List warnings
if (results.warnings > 0) {
  console.log('\n⚠️  WARNINGS:');
  results.details.forEach(r => {
    if (r.issues.length > 0 && r.status !== 'FAILED') {
      console.log(`   - ${r.name}: ${r.issues.join(', ')}`);
    }
  });
}

// Check app.module.ts registration
console.log('\n' + '='.repeat(60));
console.log('\n🔧 Checking app.module.ts Registration...\n');

const appModulePath = path.join(__dirname, 'src', 'app.module.ts');
if (fs.existsSync(appModulePath)) {
  const appModuleContent = fs.readFileSync(appModulePath, 'utf8');
  
  let registeredCount = 0;
  const notRegistered = [];
  
  modules.forEach(module => {
    // Check if module is imported
    const moduleClassName = module.path.split('-').map(p => 
      p.charAt(0).toUpperCase() + p.slice(1)
    ).join('') + 'Module';
    
    if (appModuleContent.includes(moduleClassName)) {
      registeredCount++;
      console.log(`✅ ${module.name} (${moduleClassName}) registered`);
    } else {
      notRegistered.push(module.name);
      console.log(`❌ ${module.name} (${moduleClassName}) NOT registered`);
    }
  });
  
  console.log(`\n📊 Registration: ${registeredCount}/${modules.length} modules registered`);
  
  if (notRegistered.length > 0) {
    console.log('\n⚠️  Modules NOT registered in app.module.ts:');
    notRegistered.forEach(name => console.log(`   - ${name}`));
  }
} else {
  console.log('❌ app.module.ts not found!');
}

// Final status
console.log('\n' + '='.repeat(60));
if (results.failed === 0 && results.warnings === 0) {
  console.log('\n✅ ALL MODULES VERIFIED SUCCESSFULLY!\n');
  console.log('All 26 modules are properly implemented and ready for testing.');
  console.log('\nNext Steps:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Test endpoints with Postman/Thunder Client');
  console.log('3. Verify database connections');
} else if (results.failed === 0) {
  console.log('\n✅ ALL MODULES PASSED (with some warnings)\n');
  console.log('Review warnings above and address if necessary.');
} else {
  console.log('\n❌ VERIFICATION FAILED\n');
  console.log('Some modules have critical issues. Please fix before testing.');
}

console.log('\n' + '='.repeat(60) + '\n');

// Save results to file
const reportPath = path.join(__dirname, '..', '..', 'MODULE_VERIFICATION_REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`📄 Full report saved to: MODULE_VERIFICATION_REPORT.json\n`);

process.exit(results.failed > 0 ? 1 : 0);
