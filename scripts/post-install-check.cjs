#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Running post-install checks...');

// Check for critical dependencies
const criticalDeps = ['react', 'react-dom', 'vite', '@vitejs/plugin-react', 'rollup'];
const nodeModulesPath = path.join(process.cwd(), 'node_modules');

let missingDeps = [];

for (const dep of criticalDeps) {
    const depPath = path.join(nodeModulesPath, dep);
    if (!fs.existsSync(depPath)) {
        console.warn(`⚠️ Missing critical dependency: ${dep}`);
        missingDeps.push(dep);
    } else {
        console.log(`✅ Found: ${dep}`);
    }
}

// Check for rollup native modules issue
const rollupPath = path.join(nodeModulesPath, 'rollup');
if (fs.existsSync(rollupPath)) {
    console.log('✅ Rollup dependency found');
    
    // Check for problematic native modules
    const rollupNativePath = path.join(nodeModulesPath, '@rollup/rollup-linux-x64-gnu');
    if (fs.existsSync(rollupNativePath)) {
        console.log('✅ Rollup native module found');
    } else {
        console.warn('⚠️ Rollup native module missing (this may cause CI/CD issues)');
    }
} else {
    console.error('❌ Rollup missing - this will cause build failures');
    missingDeps.push('rollup');
}

// Create necessary directories
const dirs = ['test-results', 'coverage', 'dist', 'src/mocks'];
let createdDirs = [];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
        createdDirs.push(dir);
    }
});

// Check TypeScript config
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
    console.log('✅ TypeScript config found');
} else {
    console.warn('⚠️ TypeScript config missing');
}

// Check Vite config
const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
    console.log('✅ Vite config found');
} else {
    console.warn('⚠️ Vite config missing');
}

// Check environment files
const envPaths = ['.env.example', '.env.local', '.env'];
let envFound = false;
for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        console.log(`✅ Environment file found: ${envPath}`);
        envFound = true;
        break;
    }
}
if (!envFound) {
    console.warn('⚠️ No environment files found');
}

// Performance check - count node_modules
const moduleCount = fs.readdirSync(nodeModulesPath).length;
console.log(`📦 Installed packages: ${moduleCount}`);

// Summary
console.log('');
console.log('📊 Post-install Summary:');
console.log(`- Node.js: ${process.version}`);
console.log(`- Platform: ${process.platform}-${process.arch}`);
console.log(`- Critical dependencies: ${criticalDeps.length - missingDeps.length}/${criticalDeps.length} found`);
console.log(`- Directories created: ${createdDirs.length}`);
console.log(`- Total packages: ${moduleCount}`);

if (missingDeps.length > 0) {
    console.error('');
    console.error('❌ Missing critical dependencies:');
    missingDeps.forEach(dep => console.error(`  - ${dep}`));
    console.error('');
    console.error('🔧 To fix, run: npm run recover');
    process.exit(1);
} else {
    console.log('');
    console.log('✅ All post-install checks passed!');
    console.log('🚀 Ready for development and deployment');
}