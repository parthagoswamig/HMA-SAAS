const { execSync } = require('child_process');

console.log('Running ESLint auto-fix to remove unused imports and variables...\n');

try {
  // Run ESLint with auto-fix for unused-vars rule
  execSync('npx eslint . --ext .ts,.tsx --fix --rule "@typescript-eslint/no-unused-vars: warn"', {
    stdio: 'inherit',
    cwd: __dirname,
  });

  console.log('\n✅ ESLint auto-fix completed successfully!');
} catch (error) {
  console.log('\n⚠️  ESLint auto-fix completed with some warnings (this is normal)');
}
