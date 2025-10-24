import { TestApp } from './test/test-utils';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
const envPath = path.resolve(process.cwd(), '.env.test');
console.log(`Loading test environment from: ${envPath}`);

dotenv.config({
  path: envPath,
  override: true
});

// Set test environment
process.env.NODE_ENV = 'test';

console.log('\n===== Test Environment =====');
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? '***' : 'Not set'}`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? '***' : 'Not set'}`);
console.log('===========================\n');

async function debugTest() {
  try {
    console.log('Creating TestApp instance...');
    const testApp = await new TestApp().init();
    console.log('TestApp created successfully');

    console.log('Testing health endpoint...');
    const response = await testApp.getRequest()
      .get('/health')
      .expect(200);

    console.log('Health check response:', response.body);
    await testApp.close();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
  }
}

debugTest();
