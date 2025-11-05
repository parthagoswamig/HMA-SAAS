const { exec } = require('child_process');

const ports = [5432, 5433, 5434];
const user = 'postgres';
const password = 'Subha@123';

console.log('Testing PostgreSQL connection...');

ports.forEach(port => {
  const command = `psql -h localhost -p ${port} -U ${user} -c "SELECT 1"`;
  
  console.log(`\nTrying port ${port}...`);
  
  const env = { ...process.env, PGPASSWORD: password };
  
  exec(command, { env }, (error, stdout, stderr) => {
    if (error) {
      console.log(`Port ${port}: Connection failed - ${error.message}`);
      return;
    }
    console.log(`Port ${port}: Connection successful!`);
    console.log('Response:', stdout);
  });
});
