const { spawn } = require('child_process');
const path = require('path');

console.log('===================================================');
console.log(' Starting EcoPilot AI Monorepo Developer Services  ');
console.log('===================================================');

// Run Backend
const backendPath = path.resolve(__dirname, 'backend');
console.log(`Starting Backend Express API server...`);
const backendProcess = spawn('npm', ['run', 'dev'], { 
  cwd: backendPath, 
  shell: true,
  stdio: 'inherit' 
});

// Run Frontend
const frontendPath = path.resolve(__dirname, 'frontend');
console.log(`Starting Frontend Vite React server...`);
const frontendProcess = spawn('npm', ['run', 'dev'], { 
  cwd: frontendPath, 
  shell: true,
  stdio: 'inherit' 
});

// Handle terminations
const handleExit = () => {
  console.log('\nStopping all services...');
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(0);
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
process.on('exit', handleExit);
