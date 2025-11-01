/**
 * HMS SaaS - Diagnostic Script for Remaining Issues
 * This script will tell you exactly what's wrong and how to fix it
 */

const axios = require('axios');

const CONFIG = {
  backendUrl: 'https://hma-saas-1.onrender.com',
  credentials: {
    email: 'admin@test.com',
    password: 'Admin@123'
  }
};

let authToken = null;

async function authenticate() {
  console.log('🔐 Authenticating...\n');
  
  try {
    const response = await axios.post(
      `${CONFIG.backendUrl}/auth/login`,
      CONFIG.credentials,
      { timeout: 30000 }
    );
    
    authToken = response.data.accessToken || response.data.access_token || response.data.token;
    console.log('✅ Authentication successful\n');
    return true;
  } catch (error) {
    console.log('❌ Authentication failed:', error.message);
    return false;
  }
}

async function testEndpoint(name, url) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   URL: ${CONFIG.backendUrl}${url}`);
  
  try {
    const response = await axios.get(`${CONFIG.backendUrl}${url}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   📦 Response:`, JSON.stringify(response.data, null, 2).substring(0, 500));
    
    // Check if it's an empty response
    if (response.data?.data) {
      const data = response.data.data;
      if (Array.isArray(data) && data.length === 0) {
        console.log(`   ⚠️  WARNING: Endpoint works but returns empty data`);
        console.log(`   💡 FIX: Need to seed test data in database`);
      } else if (data.items && Array.isArray(data.items) && data.items.length === 0) {
        console.log(`   ⚠️  WARNING: Endpoint works but returns empty data`);
        console.log(`   💡 FIX: Need to seed test data in database`);
      } else if (data.queue && Array.isArray(data.queue) && data.queue.length === 0) {
        console.log(`   ⚠️  WARNING: Queue is empty`);
        console.log(`   💡 FIX: Need to create appointments/cases with WAITING status`);
      } else {
        console.log(`   ✅ SUCCESS: Endpoint returns data!`);
      }
    }
    
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.response?.status || 'Network Error'}`);
    console.log(`   📝 Error:`, error.response?.data?.message || error.message);
    
    if (error.response?.status === 500) {
      console.log(`   💡 FIX: Backend code has a bug - check Render logs`);
    } else if (error.response?.status === 403) {
      console.log(`   💡 FIX: Permission issue - run permission fix SQL`);
    } else if (error.response?.status === 404) {
      console.log(`   💡 FIX: Endpoint doesn't exist - check routes`);
    }
    
    return { success: false, error: error.message, response: error.response?.data };
  }
}

async function diagnose() {
  console.log('🔍 HMS SaaS - Diagnostic Tool');
  console.log('=' .repeat(80));
  console.log('\nThis tool will diagnose the 3 remaining issues:\n');
  console.log('1. OPD Queue');
  console.log('2. Emergency Cases & Queue');
  console.log('3. Shifts\n');
  console.log('=' .repeat(80));

  // Authenticate
  const authenticated = await authenticate();
  if (!authenticated) {
    console.log('\n❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Test each problematic endpoint
  const results = {
    opd: await testEndpoint('OPD Queue', '/opd/queue'),
    emergencyCases: await testEndpoint('Emergency Cases', '/emergency/cases'),
    emergencyQueue: await testEndpoint('Emergency Queue', '/emergency/queue'),
    shifts: await testEndpoint('Shifts List', '/shifts')
  };

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(80));

  const issues = [];
  const warnings = [];
  const successes = [];

  Object.entries(results).forEach(([key, result]) => {
    if (result.success) {
      if (result.data?.data) {
        const data = result.data.data;
        const isEmpty = 
          (Array.isArray(data) && data.length === 0) ||
          (data.items && Array.isArray(data.items) && data.items.length === 0) ||
          (data.queue && Array.isArray(data.queue) && data.queue.length === 0);
        
        if (isEmpty) {
          warnings.push(key);
        } else {
          successes.push(key);
        }
      } else {
        successes.push(key);
      }
    } else {
      issues.push(key);
    }
  });

  console.log(`\n✅ Working: ${successes.length}`);
  successes.forEach(key => console.log(`   - ${key}`));

  console.log(`\n⚠️  Empty Data: ${warnings.length}`);
  warnings.forEach(key => console.log(`   - ${key}`));

  console.log(`\n❌ Broken: ${issues.length}`);
  issues.forEach(key => console.log(`   - ${key}`));

  // Recommendations
  console.log('\n' + '='.repeat(80));
  console.log('💡 RECOMMENDATIONS');
  console.log('='.repeat(80));

  if (issues.length > 0) {
    console.log('\n🔴 CRITICAL: Some endpoints are broken');
    console.log('\n   Option 1: Deploy backend fixes');
    console.log('   ```bash');
    console.log('   git add -A');
    console.log('   git commit -m "fix: Backend endpoint issues"');
    console.log('   git push');
    console.log('   # Wait 5-10 minutes for Render to deploy');
    console.log('   ```');
    console.log('\n   Option 2: Check Render logs');
    console.log('   - Go to https://dashboard.render.com');
    console.log('   - Find your hms-saas service');
    console.log('   - Click "Logs" to see errors');
  }

  if (warnings.length > 0) {
    console.log('\n🟡 INFO: Endpoints work but have no data');
    console.log('\n   Solution: Seed test data');
    console.log('   ```bash');
    console.log('   cd apps/api');
    console.log('   npx prisma db seed');
    console.log('   ```');
    console.log('\n   Or create data manually:');
    console.log('   - Create appointments with WAITING status for OPD queue');
    console.log('   - Create emergency cases for Emergency module');
    console.log('   - Create shifts for Shifts module');
  }

  if (successes.length === 4) {
    console.log('\n🎉 ALL ENDPOINTS WORKING!');
    console.log('   Your system is 100% production ready!');
  }

  console.log('\n' + '='.repeat(80));
  console.log('📄 Full results saved to: testsprite_tests/diagnostic_report.json');
  console.log('='.repeat(80));

  // Save results
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, '../testsprite_tests/diagnostic_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    summary: {
      working: successes.length,
      emptyData: warnings.length,
      broken: issues.length
    }
  }, null, 2));
}

diagnose().catch(error => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
});
