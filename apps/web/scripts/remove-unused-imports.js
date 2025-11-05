#!/usr/bin/env node

/**
 * Intelligent unused import remover
 * This script uses ESLint to identify and remove unused imports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting intelligent unused import removal...\n');

// Files to process (high-impact files first)
const filesToProcess = [
  'src/app/dashboard/ai-assistant/page.tsx',
  'src/app/dashboard/communications/page.tsx',
  'src/app/dashboard/telemedicine/page.tsx',
  'src/app/dashboard/patient-portal/page.tsx',
  'src/app/dashboard/radiology/page.tsx',
  'src/app/dashboard/pathology/page.tsx',
  'src/app/dashboard/pharmacy/page.tsx',
  'src/app/dashboard/quality/page.tsx',
  'src/app/dashboard/surgery/page.tsx',
  'src/app/dashboard/finance/page.tsx',
  'src/app/dashboard/appointments/page.tsx',
  'src/app/dashboard/billing/page.tsx',
  'src/app/dashboard/emergency/page.tsx',
  'src/app/dashboard/emr/page.tsx',
  'src/app/dashboard/hr/page.tsx',
  'src/app/dashboard/insurance/page.tsx',
  'src/app/dashboard/inventory/page.tsx',
  'src/app/dashboard/ipd/page.tsx',
  'src/app/dashboard/laboratory/page.tsx',
  'src/app/dashboard/opd/page.tsx',
  'src/app/dashboard/patients/page.tsx',
  'src/app/dashboard/pharmacy-management/page.tsx',
  'src/app/dashboard/reports/page.tsx',
  'src/app/dashboard/staff/page.tsx',
  'src/app/appointments-new/page.tsx',
  'src/app/billing-new/page.tsx',
  'src/app/emergency-new/page.tsx',
  'src/app/appointments/page.tsx',
  'src/app/billing/page.tsx',
  'src/app/communications/page.tsx',
  'src/app/emergency/page.tsx',
  'src/app/emr/page.tsx',
  'src/app/finance/page.tsx',
  'src/app/hr/page.tsx',
  'src/app/insurance/page.tsx',
  'src/app/inventory/page.tsx',
  'src/app/ipd/page.tsx',
  'src/app/patients/page.tsx',
  'src/app/radiology/page.tsx',
  'src/app/telemedicine/page.tsx',
];

let totalFixed = 0;
let totalErrors = 0;

console.log(`📁 Processing ${filesToProcess.length} files...\n`);

filesToProcess.forEach((file, index) => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  [${index + 1}/${filesToProcess.length}] Skipping ${file} (not found)`);
    return;
  }

  try {
    console.log(`🔄 [${index + 1}/${filesToProcess.length}] Processing ${file}...`);

    // Run ESLint fix on the file
    execSync(`npx eslint "${file}" --fix`, {
      stdio: 'pipe',
      cwd: process.cwd(),
    });

    totalFixed++;
    console.log(`✅ [${index + 1}/${filesToProcess.length}] Fixed ${file}`);
  } catch (error) {
    totalErrors++;
    console.log(`⚠️  [${index + 1}/${filesToProcess.length}] Issues in ${file} (check manually)`);
  }
});

console.log('\n' + '='.repeat(50));
console.log('📊 SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Files processed: ${totalFixed}`);
console.log(`⚠️  Files with issues: ${totalErrors}`);
console.log(`📁 Total files: ${filesToProcess.length}`);
console.log('='.repeat(50));

console.log('\n🎯 Next steps:');
console.log('1. Run: npm run build');
console.log('2. Run: npm run lint');
console.log('3. Commit changes: git add . && git commit -m "fix: remove unused imports"');
console.log('\n✨ Done!\n');
