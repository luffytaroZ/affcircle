#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AffCircle Development Environment...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, prefix, message) {
  console.log(`${colors[color]}[${prefix}]${colors.reset} ${message}`);
}

// Start backend
log('cyan', 'BACKEND', 'Starting backend server...');
const backend = spawn('node', ['backend/server.js'], {
  stdio: 'pipe',
  cwd: process.cwd()
});

let backendPort = null;
let backendReady = false;

backend.stdout.on('data', (data) => {
  const output = data.toString();
  
  // Extract port from backend output
  const portMatch = output.match(/Server running on port (\d+)/);
  if (portMatch) {
    backendPort = portMatch[1];
    log('green', 'BACKEND', `✅ Backend ready on port ${backendPort}`);
    log('cyan', 'BACKEND', `🔗 http://localhost:${backendPort}`);
    backendReady = true;
    
    // Update frontend environment with actual backend port
    updateFrontendEnv(backendPort);
    
    // Start frontend after backend is ready
    setTimeout(startFrontend, 2000);
  }
  
  // Forward other backend logs
  process.stdout.write(`${colors.cyan}[BACKEND]${colors.reset} ${output}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`${colors.red}[BACKEND ERROR]${colors.reset} ${data}`);
});

function updateFrontendEnv(port) {
  const fs = require('fs');
  const envPath = path.join(__dirname, 'frontend', '.env');
  
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add REACT_APP_BACKEND_URL
    const backendUrl = `REACT_APP_BACKEND_URL=http://localhost:${port}`;
    
    if (envContent.includes('REACT_APP_BACKEND_URL=')) {
      envContent = envContent.replace(/REACT_APP_BACKEND_URL=.*/, backendUrl);
    } else {
      envContent += `\n${backendUrl}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    log('green', 'CONFIG', `Updated frontend .env with backend port ${port}`);
  } catch (error) {
    log('yellow', 'CONFIG', `Warning: Could not update frontend .env: ${error.message}`);
  }
}

function startFrontend() {
  if (!backendReady) {
    log('red', 'STARTUP', 'Backend not ready, delaying frontend start...');
    return;
  }
  
  log('magenta', 'FRONTEND', 'Starting frontend development server...');
  
  const frontend = spawn('yarn', ['start'], {
    stdio: 'pipe',
    cwd: path.join(process.cwd(), 'frontend'),
    shell: true
  });

  frontend.stdout.on('data', (data) => {
    const output = data.toString();
    
    // Check for frontend ready signal
    if (output.includes('webpack compiled') || output.includes('Local:')) {
      log('green', 'FRONTEND', '✅ Frontend ready');
      log('magenta', 'FRONTEND', '🌐 http://localhost:3000');
      
      // Show connection status
      setTimeout(() => {
        log('bright', 'STATUS', '');
        log('bright', 'STATUS', '🎉 Development environment is ready!');
        log('bright', 'STATUS', '');
        log('green', 'STATUS', `📱 Frontend: http://localhost:3000`);
        log('cyan', 'STATUS', `🔧 Backend:  http://localhost:${backendPort}`);
        log('bright', 'STATUS', '');
        log('yellow', 'STATUS', '💡 Connection status is monitored automatically');
        log('yellow', 'STATUS', '💡 Both servers will restart automatically on file changes');
        log('bright', 'STATUS', '');
      }, 1000);
    }
    
    process.stdout.write(`${colors.magenta}[FRONTEND]${colors.reset} ${output}`);
  });

  frontend.stderr.on('data', (data) => {
    process.stderr.write(`${colors.red}[FRONTEND ERROR]${colors.reset} ${data}`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('yellow', 'SHUTDOWN', 'Gracefully shutting down...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}

// Handle backend startup errors
backend.on('error', (error) => {
  log('red', 'BACKEND ERROR', `Failed to start backend: ${error.message}`);
  process.exit(1);
});

backend.on('close', (code) => {
  if (code !== 0) {
    log('red', 'BACKEND', `Backend process exited with code ${code}`);
    process.exit(1);
  }
}); 