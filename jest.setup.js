// Global setup for Jest tests
process.env.NODE_ENV = 'test';

// Set test database URL if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/hms_test?schema=public';
}

// Increase timeout for tests
jest.setTimeout(30000);
