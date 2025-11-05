import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
const envPath = path.resolve(process.cwd(), '.env.test');
console.log(`Loading test environment from: ${envPath}`);

try {
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

  console.log('✅ Environment loaded successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Error loading environment:', error);
  process.exit(1);
}
