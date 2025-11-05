const net = require('net');

const host = 'localhost';
const port = 5432;

const socket = new net.Socket();

console.log(`Testing connection to ${host}:${port}...`);

socket.setTimeout(2000);

socket.on('connect', () => {
  console.log('✅ Successfully connected to the PostgreSQL port!');
  socket.destroy();
  process.exit(0);
});

socket.on('timeout', () => {
  console.log('❌ Connection attempt timed out');
  socket.destroy();
  process.exit(1);
});

socket.on('error', (err) => {
  console.error('❌ Connection error:', err.message);
  process.exit(1);
});

socket.connect(port, host);
