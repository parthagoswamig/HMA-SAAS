const { spawn } = require('child_process');

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.PORT = '10000';
process.env.DATABASE_URL = 'postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?schema=public';
process.env.JWT_SECRET = 'your-super-secure-jwt-secret-key-at-least-32-chars';
process.env.JWT_ACCESS_SECRET = 'your-jwt-access-secret-key-here';
process.env.JWT_ACCESS_EXPIRATION = '15m';
process.env.JWT_REFRESH_SECRET = 'your-jwt-refresh-secret-key-here';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.CORS_ORIGINS = 'http://localhost:3000,http://localhost:3001';
process.env.BCRYPT_SALT_ROUNDS = '10';

console.log('Starting backend with environment variables...');
console.log('CORS_ORIGINS:', process.env.CORS_ORIGINS);

// Start the backend
const backend = spawn('npm', ['run', 'start:dev'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

backend.on('error', (error) => {
  console.error('Backend error:', error);
});

backend.on('exit', (code) => {
  console.log('Backend exited with code:', code);
});