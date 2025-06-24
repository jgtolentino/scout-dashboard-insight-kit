#!/usr/bin/env node

/**
 * Scout Analytics Dashboard - React Context Error Debugger & Fixer
 * Fixes the "Cannot read properties of undefined (reading 'createContext')" error
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 React Context Error Debugger & Fixer');
console.log('=====================================\n');

// Step 1: Check for React version mismatches
console.log('📋 Step 1: Checking React versions...');
try {
  const reactVersions = execSync('npm ls react --json', { encoding: 'utf8' });
  const versions = JSON.parse(reactVersions);
  
  // Find all React versions
  const findReactVersions = (deps, versions = new Set()) => {
    if (deps?.dependencies) {
      Object.entries(deps.dependencies).forEach(([name, info]) => {
        if (name === 'react' && info.version) {
          versions.add(info.version);
        }
        if (info.dependencies) {
          findReactVersions(info, versions);
        }
      });
    }
    return versions;
  };
  
  const uniqueVersions = findReactVersions(versions);
  
  if (uniqueVersions.size > 1) {
    console.log('⚠️  Multiple React versions detected:', Array.from(uniqueVersions).join(', '));
  } else {
    console.log('✅ Single React version:', Array.from(uniqueVersions)[0]);
  }
} catch (error) {
  console.log('⚠️  Could not check React versions');
}

// Step 2: Fix package.json overrides
console.log('\n📋 Step 2: Adding React version overrides...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add overrides to force React 18
if (!packageJson.overrides) {
  packageJson.overrides = {};
}

packageJson.overrides['react'] = '^18.3.1';
packageJson.overrides['react-dom'] = '^18.3.1';
packageJson.overrides['react-reconciler'] = '^0.29.0'; // Compatible with React 18

// Add resolutions for Yarn
if (!packageJson.resolutions) {
  packageJson.resolutions = {};
}
packageJson.resolutions['react'] = '^18.3.1';
packageJson.resolutions['react-dom'] = '^18.3.1';
packageJson.resolutions['react-reconciler'] = '^0.29.0';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with React overrides');

// Step 3: Create a React context polyfill
console.log('\n📋 Step 3: Creating React context polyfill...');
const polyfillContent = `/**
 * React Context Polyfill
 * Ensures React is available globally for legacy code
 */

// Only apply in development/browser environment
if (typeof window !== 'undefined' && !window.React) {
  import('react').then((React) => {
    window.React = React.default || React;
    console.log('✅ React polyfill applied');
  }).catch(err => {
    console.error('Failed to load React polyfill:', err);
  });
}
`;

const polyfillPath = path.join(process.cwd(), 'src', 'utils', 'react-polyfill.ts');
const utilsDir = path.join(process.cwd(), 'src', 'utils');

if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true });
}

fs.writeFileSync(polyfillPath, polyfillContent);
console.log('✅ Created React polyfill at src/utils/react-polyfill.ts');

// Step 4: Update main.tsx to include polyfill
console.log('\n📋 Step 4: Updating main.tsx...');
const mainTsxPath = path.join(process.cwd(), 'src', 'main.tsx');
if (fs.existsSync(mainTsxPath)) {
  let mainContent = fs.readFileSync(mainTsxPath, 'utf8');
  
  if (!mainContent.includes('react-polyfill')) {
    // Add polyfill import at the top
    mainContent = `import './utils/react-polyfill';\n${mainContent}`;
    fs.writeFileSync(mainTsxPath, mainContent);
    console.log('✅ Updated main.tsx with polyfill import');
  } else {
    console.log('✅ main.tsx already includes polyfill');
  }
}

// Step 5: Clean and reinstall
console.log('\n📋 Step 5: Clean install instructions...');
console.log('Run the following commands to complete the fix:\n');
console.log('rm -rf node_modules package-lock.json');
console.log('npm install');
console.log('npm dedupe');
console.log('npm run build');

// Step 6: Create verification script
const verifyScript = `// Verify React is properly loaded
console.log('React version:', React?.version || 'Not loaded');
console.log('createContext available:', typeof React?.createContext === 'function');

// Check all context providers
const contexts = document.querySelectorAll('[data-react-context]');
console.log('Active contexts:', contexts.length);
`;

fs.writeFileSync(path.join(process.cwd(), 'verify-react.js'), verifyScript);
console.log('\n✅ Created verify-react.js - Run in browser console after rebuild');

console.log('\n🎯 Summary of fixes applied:');
console.log('   1. Added React version overrides to package.json');
console.log('   2. Created React polyfill for global access');
console.log('   3. Updated main.tsx to include polyfill');
console.log('   4. Ready for clean install');

console.log('\n⚡ Quick fix command (copy & run):');
console.log('rm -rf node_modules package-lock.json && npm install && npm dedupe && npm run build\n');