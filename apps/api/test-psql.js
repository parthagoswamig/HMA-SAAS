const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read the .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Extract the database URL
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (!dbUrlMatch) {
  console.error('❌ Could not find DATABASE_URL in .env file');
  process.exit(1);
}

const dbUrl = dbUrlMatch[1];
console.log('Using database URL:', dbUrl);

// Parse the database URL
const url = new URL(dbUrl);
const username = url.username;
const password = url.password;
const host = url.hostname;
const port = url.port || '5432';
const database = url.pathname.split('/')[1];

console.log('\nConnection details:');
console.log(`- Host: ${host}`);
console.log(`- Port: ${port}`);
console.log(`- Username: ${username}`);
console.log(`- Database: ${database}`);

// Test connection with psql
console.log('\nTesting connection with psql...');
const psqlPath = 'C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe';
const command = `"${psqlPath}" -h ${host} -p ${port} -U ${username} -d ${database} -c "SELECT 'Connection successful' as status"`;

console.log('\nRunning command:');
console.log(command.replace(new RegExp(password, 'g'), '********'));

const env = { ...process.env, PGPASSWORD: password };

exec(command, { env }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Connection failed:');
    console.error(stderr);
    console.error('Error code:', error.code);
    return;
  }
  
  console.log('\n✅ Connection successful!');
  console.log('Output:');
  console.log(stdout);
});
