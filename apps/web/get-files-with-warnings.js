const { execSync } = require('child_process');
const fs = require('fs');

// Run ESLint and get JSON output
const result = execSync('npx eslint src --ext .ts,.tsx --format json', {
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024, // 50MB buffer
});

const data = JSON.parse(result);

// Filter files with warnings/errors and sort by problem count
const filesWithIssues = data
  .filter((file) => file.warningCount > 0 || file.errorCount > 0)
  .map((file) => ({
    path: file.filePath.replace(/\\/g, '/').split('/src/')[1],
    warnings: file.warningCount,
    errors: file.errorCount,
    total: file.warningCount + file.errorCount,
  }))
  .sort((a, b) => b.total - a.total);

console.log(`\nFound ${filesWithIssues.length} files with issues\n`);
console.log('Top 50 files with most issues:\n');

filesWithIssues.slice(0, 50).forEach((file, index) => {
  console.log(`${index + 1}. ${file.path}`);
  console.log(`   Errors: ${file.errors}, Warnings: ${file.warnings}, Total: ${file.total}\n`);
});

// Save full list to file
fs.writeFileSync(
  'files-with-issues.txt',
  filesWithIssues.map((f) => `${f.path} (${f.total} issues)`).join('\n')
);

console.log(`\nFull list saved to files-with-issues.txt`);
console.log(`\nTotal files to fix: ${filesWithIssues.length}`);
console.log(`Total issues: ${filesWithIssues.reduce((sum, f) => sum + f.total, 0)}`);
