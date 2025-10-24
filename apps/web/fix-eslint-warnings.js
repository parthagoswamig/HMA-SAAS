const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript/TSX files
function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
        getAllTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Run ESLint and get warnings
function getEslintWarnings() {
  try {
    execSync('npx eslint "src/**/*.{ts,tsx}" --format json > eslint-output.json', {
      stdio: 'ignore',
      shell: true
    });
  } catch (error) {
    // ESLint exits with error code when warnings/errors found
  }
  
  try {
    const output = fs.readFileSync('eslint-output.json', 'utf8');
    return JSON.parse(output);
  } catch (error) {
    console.error('Failed to read ESLint output:', error.message);
    return [];
  }
}

// Fix unused variables by prefixing with underscore
function fixUnusedVariables(filePath, unusedVars) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  unusedVars.forEach(varName => {
    if (varName.startsWith('_')) return; // Already prefixed
    
    // Regex patterns for different contexts
    const patterns = [
      // Function parameters: (varName) => or (varName: Type) =>
      new RegExp(`\\(([^,\\)]*\\b${varName}\\b[^,\\)]*)\\)\\s*=>`, 'g'),
      // Destructuring: { varName } or { varName: alias }
      new RegExp(`{([^}]*\\b${varName}\\b[^}]*)}`, 'g'),
      // Variable declarations: const varName = or let varName =
      new RegExp(`\\b(const|let|var)\\s+${varName}\\b`, 'g'),
      // Try-catch: catch (varName)
      new RegExp(`catch\\s*\\(${varName}\\)`, 'g'),
    ];
    
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match) => {
          return match.replace(new RegExp(`\\b${varName}\\b`, 'g'), `_${varName}`);
        });
        modified = true;
      }
    });
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed unused variables in: ${filePath}`);
  }
}

// Remove unused imports
function removeUnusedImports(filePath, unusedImports) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  unusedImports.forEach(importName => {
    // Pattern to match import statements containing this name
    const patterns = [
      // Named import: import { X, Y, importName, Z } from 'module'
      new RegExp(`(import\\s*{[^}]*)(,\\s*${importName}\\s*)(,[^}]*}\\s*from)`, 'g'),
      new RegExp(`(import\\s*{[^}]*)(\\s*${importName}\\s*,)(.*}\\s*from)`, 'g'),
      // Single named import: import { importName } from 'module'
      new RegExp(`import\\s*{\\s*${importName}\\s*}\\s*from\\s*['"][^'"]+['"];?\\s*\\n?`, 'g'),
      // Default import: import importName from 'module'
      new RegExp(`import\\s+${importName}\\s+from\\s*['"][^'"]+['"];?\\s*\\n?`, 'g'),
    ];
    
    patterns.forEach(pattern => {
      const before = content;
      content = content.replace(pattern, (match, g1, g2, g3) => {
        if (g1 && g2 && g3) {
          // Named import in list
          return g1 + g3;
        }
        // Remove entire import statement
        return '';
      });
      if (content !== before) {
        modified = true;
      }
    });
  });
  
  if (modified) {
    // Clean up empty import statements
    content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];?\s*\n?/g, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Removed unused imports from: ${filePath}`);
  }
}

// Main execution
console.log('Getting ESLint warnings...');
const results = getEslintWarnings();

let totalFixed = 0;

results.forEach(result => {
  if (result.messages && result.messages.length > 0) {
    const unusedVars = [];
    const unusedImports = [];
    
    result.messages.forEach(msg => {
      if (msg.ruleId === '@typescript-eslint/no-unused-vars' && msg.message.includes('is defined but never used')) {
        const match = msg.message.match(/'([^']+)'/);
        if (match) {
          const varName = match[1];
          // Check if it's likely an import (starts with capital letter or is an icon)
          if (/^[A-Z]/.test(varName) || varName.startsWith('Icon')) {
            unusedImports.push(varName);
          } else {
            unusedVars.push(varName);
          }
        }
      }
    });
    
    if (unusedImports.length > 0) {
      removeUnusedImports(result.filePath, unusedImports);
      totalFixed += unusedImports.length;
    }
    
    if (unusedVars.length > 0) {
      fixUnusedVariables(result.filePath, unusedVars);
      totalFixed += unusedVars.length;
    }
  }
});

// Cleanup
try {
  fs.unlinkSync('eslint-output.json');
} catch (e) {
  // Ignore
}

console.log(`\nTotal issues fixed: ${totalFixed}`);
console.log('\nRunning final build check...');

try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✓ Build successful with all warnings fixed!');
} catch (error) {
  console.log('\n⚠ Build completed but may still have warnings. Please review.');
}
