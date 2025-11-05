#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const net = require('net');

const PORT = 3001;

console.log('🚀 Starting HMS SaaS Backend Server...');

// Function to check if port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false); // Port is free
      });
      server.close();
    });
    server.on('error', () => {
      resolve(true); // Port is in use
    });
  });
}

// Function to kill processes using the port
function killProcessOnPort(port) {
  try {
    if (process.platform === 'win32') {
      // Windows
      try {
        const result = execSync(`netstat -aon | findstr :${port}`, { encoding: 'utf8' });
        const lines = result.split('\n').filter(line => line.includes('LISTENING'));
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            console.log(`🔄 Stopping process PID: ${pid}`);
            try {
              execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            } catch (e) {
              // Process might already be stopped
            }
          }
        });
      } catch (e) {
        // No processes found on port
      }
    } else {
      // Linux/Mac
      try {
        const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8' });
        const pids = result.trim().split('\n').filter(pid => pid);
        
        pids.forEach(pid => {
          console.log(`🔄 Stopping process PID: ${pid}`);
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          } catch (e) {
            // Process might already be stopped
          }
        });
      } catch (e) {
        // No processes found on port
      }
    }
  } catch (error) {
    console.log('⚠️  Could not kill processes on port', port);
  }
}

async function startServer() {
  // Check if port is in use
  const portInUse = await isPortInUse(PORT);
  
  if (portInUse) {
    console.log(`⚠️  Port ${PORT} is already in use. Stopping existing processes...`);
    killProcessOnPort(PORT);
    
    // Wait a bit for processes to stop
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check again
    const stillInUse = await isPortInUse(PORT);
    if (stillInUse) {
      console.log(`❌ Port ${PORT} is still in use. Please manually stop the process and try again.`);
      process.exit(1);
    }
  }
  
  console.log(`✅ Port ${PORT} is free`);
  console.log('📍 Backend will be available at: http://localhost:' + PORT);
  console.log('❤️  Health Check: http://localhost:' + PORT + '/health');
  console.log('🔐 Auth Endpoints: http://localhost:' + PORT + '/auth/*');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('');
  
  // Start the development server
  const child = spawn('npm', ['run', 'start:dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    child.kill('SIGINT');
    process.exit(0);
  });
  
  child.on('close', (code) => {
    process.exit(code);
  });
}

startServer().catch(error => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});