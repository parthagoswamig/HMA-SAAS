import { TestApp } from './test-utils';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
const envPath = path.resolve(process.cwd(), '.env.test');
console.log(`Loading test environment from: ${envPath}`);

dotenv.config({
  path: envPath,
  override: true // Override any existing environment variables
});

// Set test environment
process.env.NODE_ENV = 'test';

// Log test configuration
console.log('\n===== Test Environment =====');
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? '***' : 'Not set'}`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? '***' : 'Not set'}`);
console.log('===========================\n');

let testApp: TestApp;

beforeAll(async () => {
  console.log('\n===== Setting up test environment =====');
  try {
    console.log('Initializing TestApp...');
    testApp = await new TestApp().init();
    global.testApp = testApp;
    console.log('TestApp initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize test app:', error);
    throw error;
  }
  console.log('====================================\n');
}, 30000); // Increased timeout for app initialization

afterAll(async () => {
  console.log('\n===== Cleaning up test environment =====');
  if (testApp) {
    try {
      console.log('Closing TestApp...');
      await testApp.close();
      console.log('TestApp closed successfully');
    } catch (error) {
      console.error('❌ Error during test app teardown:', error);
      throw error;
    }
  } else {
    console.log('No TestApp instance to clean up');
  }
  console.log('===================================\n');
});

declare global {
  // eslint-disable-next-line no-var
  var testApp: TestApp;
}
