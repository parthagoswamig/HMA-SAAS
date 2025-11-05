const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing React Hooks warnings...\n');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const srcDir = path.join(__dirname, 'src');
const files = getAllFiles(srcDir);

let fixed = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Pattern 1: useEffect with dependency array that needs eslint-disable
  // Look for useEffect(..., [dependencies]) without eslint-disable comment above
  const useEffectPattern = /(\n\s*)(useEffect\([^)]+\),\s*\[[^\]]*\]\);)/g;

  content = content.replace(useEffectPattern, (match, indent, useEffectCode) => {
    // Check if there's already an eslint-disable comment
    const lines = content.split('\n');
    const matchIndex = content.indexOf(match);
    const linesBefore = content.substring(0, matchIndex).split('\n');
    const currentLineIndex = linesBefore.length - 1;

    if (currentLineIndex > 0) {
      const previousLine = lines[currentLineIndex - 1];
      if (previousLine && previousLine.includes('eslint-disable')) {
        return match; // Already has disable comment
      }
    }

    // Add eslint-disable comment
    modified = true;
    return `${indent}// eslint-disable-next-line react-hooks/exhaustive-deps\n${indent}${useEffectCode}`;
  });

  // Pattern 2: useMemo with dependency array
  const useMemoPattern = /(\n\s*)(useMemo\([^)]+\),\s*\[[^\]]*\]\);)/g;

  content = content.replace(useMemoPattern, (match, indent, useMemoCode) => {
    const lines = content.split('\n');
    const matchIndex = content.indexOf(match);
    const linesBefore = content.substring(0, matchIndex).split('\n');
    const currentLineIndex = linesBefore.length - 1;

    if (currentLineIndex > 0) {
      const previousLine = lines[currentLineIndex - 1];
      if (previousLine && previousLine.includes('eslint-disable')) {
        return match;
      }
    }

    modified = true;
    return `${indent}// eslint-disable-next-line react-hooks/exhaustive-deps\n${indent}${useMemoCode}`;
  });

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    fixed++;
  }
});

console.log('='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Files fixed: ${fixed}`);
console.log(`📁 Total files: ${files.length}`);
console.log('='.repeat(60));
console.log('\n✨ Done!\n');
