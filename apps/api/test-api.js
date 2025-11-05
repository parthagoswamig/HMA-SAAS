const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:4000';

async function testHealthCheck() {
  try {
    console.log('Testing health check endpoint...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

async function main() {
  console.log('Starting API tests...\n');
  
  // Test health check
  const isHealthy = await testHealthCheck();
  
  if (!isHealthy) {
    console.log('\n❌ API is not running. Please start the server with: npm run start:dev');
    return;
  }
  
  console.log('\n✅ API is running and responding to requests!');
  console.log('\nYou can now test the following endpoints:');
  console.log('1. POST /api/v1/auth/register - Register a new user');
  console.log('2. POST /api/v1/auth/login - Login and get JWT token');
  console.log('3. GET /api/v1/tenants - List all tenants (requires authentication)');
  console.log('\nTo test these endpoints, you can use:');
  console.log('- Postman');
  console.log('- cURL');
  console.log('- Or any HTTP client');
}

main();
