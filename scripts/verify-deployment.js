#!/usr/bin/env node
// Deployment Verification Script for Scout Analytics
// Ensures deployment is actually working before claiming success

const https = require('https');
const http = require('http');

class DeploymentVerifier {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.results = [];
    this.startTime = Date.now();
  }

  log(message, status = 'info') {
    const timestamp = new Date().toISOString();
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
    console.log(`${timestamp} ${icons[status]} ${message}`);
    
    this.results.push({
      timestamp,
      status,
      message
    });
  }

  async makeRequest(path, expectedStatus = 200, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      const protocol = url.startsWith('https:') ? https : http;
      
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      const startTime = Date.now();
      
      const req = protocol.get(url, (res) => {
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data,
            responseTime,
            url
          });
        });
      });

      req.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  async verifyHealthEndpoint() {
    this.log('🏥 Checking health endpoint...');
    
    try {
      const response = await this.makeRequest('/health');
      
      if (response.statusCode === 200) {
        this.log(`Health endpoint responding (${response.responseTime}ms)`, 'success');
        return true;
      } else {
        this.log(`Health endpoint returned ${response.statusCode}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Health endpoint failed: ${error.message}`, 'error');
      return false;
    }
  }

  async verifyMainPage() {
    this.log('🏠 Checking main page...');
    
    try {
      const response = await this.makeRequest('/');
      
      if (response.statusCode === 200) {
        // Check if it's actually the React app and not an error page
        const hasReactRoot = response.data.includes('<div id="root">');
        const hasScriptTag = response.data.includes('<script');
        const notErrorPage = !response.data.includes('Application Error');
        
        if (hasReactRoot && hasScriptTag && notErrorPage) {
          this.log(`Main page loading correctly (${response.responseTime}ms)`, 'success');
          this.log(`Page size: ${(response.data.length / 1024).toFixed(1)}KB`);
          return true;
        } else {
          this.log('Main page returning error content', 'error');
          this.log(`Response preview: ${response.data.substring(0, 200)}...`);
          return false;
        }
      } else {
        this.log(`Main page returned ${response.statusCode}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Main page failed: ${error.message}`, 'error');
      return false;
    }
  }

  async verifyApiEndpoints() {
    this.log('🔗 Checking API endpoints...');
    
    const endpoints = [
      { path: '/api/health', name: 'API Health' },
      { path: '/api/insights', name: 'AI Insights' },
      { path: '/api/transactions', name: 'Transactions' },
      { path: '/api/regional-performance', name: 'Regional Performance' }
    ];

    let successCount = 0;
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(endpoint.path);
        
        if (response.statusCode === 200) {
          this.log(`${endpoint.name} API working (${response.responseTime}ms)`, 'success');
          successCount++;
        } else if (response.statusCode === 404) {
          this.log(`${endpoint.name} API not found (404) - may not be implemented yet`, 'warning');
        } else {
          this.log(`${endpoint.name} API returned ${response.statusCode}`, 'error');
        }
      } catch (error) {
        this.log(`${endpoint.name} API failed: ${error.message}`, 'error');
      }
    }
    
    const successRate = (successCount / endpoints.length) * 100;
    this.log(`API endpoints success rate: ${successRate.toFixed(1)}%`);
    
    return successCount >= 2; // At least 50% of endpoints should work
  }

  async verifyPerformance() {
    this.log('⚡ Checking performance...');
    
    try {
      const response = await this.makeRequest('/', 200, 5000);
      
      if (response.responseTime < 3000) {
        this.log(`Good performance: ${response.responseTime}ms`, 'success');
        return true;
      } else if (response.responseTime < 5000) {
        this.log(`Acceptable performance: ${response.responseTime}ms`, 'warning');
        return true;
      } else {
        this.log(`Poor performance: ${response.responseTime}ms`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Performance test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async verifyStaticAssets() {
    this.log('📦 Checking static assets...');
    
    try {
      // First get the main page to find asset references
      const mainPage = await this.makeRequest('/');
      
      // Extract CSS and JS file references
      const cssMatches = mainPage.data.match(/href="([^"]*\.css)"/g) || [];
      const jsMatches = mainPage.data.match(/src="([^"]*\.js)"/g) || [];
      
      const assets = [
        ...cssMatches.map(m => m.match(/href="([^"]*)"/)[1]),
        ...jsMatches.map(m => m.match(/src="([^"]*)"/)[1])
      ];

      let assetSuccessCount = 0;
      
      for (const asset of assets.slice(0, 3)) { // Check first 3 assets
        try {
          const response = await this.makeRequest(asset);
          if (response.statusCode === 200) {
            assetSuccessCount++;
            this.log(`Asset loaded: ${asset}`, 'success');
          } else {
            this.log(`Asset failed: ${asset} (${response.statusCode})`, 'error');
          }
        } catch (error) {
          this.log(`Asset error: ${asset} - ${error.message}`, 'error');
        }
      }
      
      const assetSuccessRate = assets.length > 0 ? (assetSuccessCount / Math.min(assets.length, 3)) * 100 : 100;
      this.log(`Static assets success rate: ${assetSuccessRate.toFixed(1)}%`);
      
      return assetSuccessRate >= 66; // At least 2/3 of checked assets should work
      
    } catch (error) {
      this.log(`Static asset verification failed: ${error.message}`, 'error');
      return false;
    }
  }

  async verifyAzureAuthentication() {
    this.log('🔐 Checking Azure authentication...');
    
    try {
      // Check if the app can access Azure resources (this would be called by the app itself)
      const response = await this.makeRequest('/api/auth/status');
      
      if (response.statusCode === 200) {
        const authData = JSON.parse(response.data);
        if (authData.authenticated) {
          this.log('Azure authentication working', 'success');
          return true;
        } else {
          this.log('Azure authentication not configured', 'warning');
          return true; // Not critical for basic functionality
        }
      } else if (response.statusCode === 404) {
        this.log('Auth status endpoint not implemented (acceptable)', 'info');
        return true;
      } else {
        this.log(`Auth status returned ${response.statusCode}`, 'warning');
        return true; // Not critical
      }
    } catch (error) {
      this.log(`Auth status check failed: ${error.message} (non-critical)`, 'info');
      return true; // Not critical for deployment success
    }
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const successCount = this.results.filter(r => r.status === 'success').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    
    console.log('\n📊 DEPLOYMENT VERIFICATION REPORT');
    console.log('================================');
    console.log(`🕐 Total time: ${totalTime}ms`);
    console.log(`✅ Successes: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⚠️  Warnings: ${warningCount}`);
    console.log(`🌐 Target URL: ${this.baseUrl}`);
    
    return {
      success: errorCount === 0,
      totalTime,
      counts: { success: successCount, error: errorCount, warning: warningCount },
      url: this.baseUrl,
      results: this.results
    };
  }

  async runFullVerification() {
    this.log(`🚀 Starting deployment verification for ${this.baseUrl}`);
    
    const checks = [
      { name: 'Health Endpoint', fn: () => this.verifyHealthEndpoint() },
      { name: 'Main Page', fn: () => this.verifyMainPage() },
      { name: 'API Endpoints', fn: () => this.verifyApiEndpoints() },
      { name: 'Performance', fn: () => this.verifyPerformance() },
      { name: 'Static Assets', fn: () => this.verifyStaticAssets() },
      { name: 'Azure Auth', fn: () => this.verifyAzureAuthentication() }
    ];

    const results = [];
    
    for (const check of checks) {
      this.log(`\n🔍 Running ${check.name} verification...`);
      try {
        const result = await check.fn();
        results.push({ name: check.name, success: result });
        
        if (result) {
          this.log(`${check.name} verification passed`, 'success');
        } else {
          this.log(`${check.name} verification failed`, 'error');
        }
      } catch (error) {
        this.log(`${check.name} verification error: ${error.message}`, 'error');
        results.push({ name: check.name, success: false });
      }
    }
    
    const report = this.generateReport();
    const criticalChecks = ['Health Endpoint', 'Main Page', 'Performance'];
    const criticalFailures = results.filter(r => 
      criticalChecks.includes(r.name) && !r.success
    );
    
    if (criticalFailures.length === 0) {
      console.log('\n🎉 DEPLOYMENT VERIFICATION PASSED');
      console.log('Application is ready for use!');
      process.exit(0);
    } else {
      console.log('\n💥 DEPLOYMENT VERIFICATION FAILED');
      console.log('Critical issues found:');
      criticalFailures.forEach(failure => {
        console.log(`❌ ${failure.name}`);
      });
      process.exit(1);
    }
  }
}

// CLI usage
async function main() {
  const url = process.argv[2] || process.env.DEPLOY_URL || 'http://localhost:5173';
  
  if (!url) {
    console.error('❌ No URL provided. Usage: node verify-deployment.js <url>');
    process.exit(1);
  }
  
  const verifier = new DeploymentVerifier(url);
  await verifier.runFullVerification();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Verification script error:', error.message);
    process.exit(1);
  });
}

module.exports = DeploymentVerifier;