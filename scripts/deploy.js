#!/usr/bin/env node

/**
 * HMS SaaS Deployment Helper Script
 * 
 * This script helps automate the deployment process by:
 * - Validating environment variables
 * - Running pre-deployment checks
 * - Deploying to different environments
 * - Post-deployment verification
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}${colors.bright}${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.magenta}${colors.bright}=== ${msg} ===${colors.reset}`)
};

// Configuration
const config = {
  environments: ['staging', 'production'],
  requiredEnvVars: {
    backend: [
      'DATABASE_URL',
      'SUPABASE_URL', 
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET',
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET'
    ],
    frontend: [
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]
  }
};

// Helper functions
function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    });
    return result.trim();
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function loadEnvFile(filePath) {
  if (!checkFileExists(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) {
      env[match[1]] = match[2];
    }
  });
  
  return env;
}

function validateEnvironmentVariables(env, required) {
  const missing = required.filter(key => !env[key] || env[key].includes('your-'));
  return missing;
}

// Main deployment functions
async function preDeploymentChecks() {
  log.section('Pre-deployment Checks');
  
  // Check if we're in the right directory
  if (!checkFileExists('./apps/api/package.json') || !checkFileExists('./apps/web/package.json')) {
    throw new Error('Please run this script from the project root directory');
  }
  
  log.success('Project structure validated');
  
  // Check Node.js version
  const nodeVersion = process.version;
  log.info(`Node.js version: ${nodeVersion}`);
  
  // Check if required files exist
  const requiredFiles = [
    './apps/api/Dockerfile',
    './apps/web/vercel.json',
    './render-supabase.yaml',
    './DEPLOYMENT.md'
  ];
  
  requiredFiles.forEach(file => {
    if (checkFileExists(file)) {
      log.success(`Found: ${file}`);
    } else {
      log.warning(`Missing: ${file}`);
    }
  });
  
  // Check git status
  try {
    const gitStatus = execCommand('git status --porcelain');
    if (gitStatus) {
      log.warning('You have uncommitted changes. Consider committing before deployment.');
    } else {
      log.success('Git working directory is clean');
    }
  } catch (error) {
    log.warning('Could not check git status');
  }
}

async function validateBackendEnvironment(environment = 'staging') {
  log.section(`Validating Backend Environment (${environment})`);
  
  const envFile = environment === 'staging' ? 
    './apps/api/.env.staging' : 
    './apps/api/.env.production';
  
  if (!checkFileExists(envFile)) {
    log.error(`Environment file not found: ${envFile}`);
    log.info('Please create the environment file with required variables');
    return false;
  }
  
  const env = loadEnvFile(envFile);
  const missing = validateEnvironmentVariables(env, config.requiredEnvVars.backend);
  
  if (missing.length > 0) {
    log.error('Missing or placeholder environment variables:');
    missing.forEach(key => log.error(`  - ${key}`));
    return false;
  }
  
  log.success('All backend environment variables are set');
  return true;
}

async function validateFrontendEnvironment() {
  log.section('Validating Frontend Environment');
  
  const envFile = './apps/web/.env.local';
  
  if (!checkFileExists(envFile)) {
    log.error(`Environment file not found: ${envFile}`);
    return false;
  }
  
  const env = loadEnvFile(envFile);
  const missing = validateEnvironmentVariables(env, config.requiredEnvVars.frontend);
  
  if (missing.length > 0) {
    log.error('Missing or placeholder frontend environment variables:');
    missing.forEach(key => log.error(`  - ${key}`));
    return false;
  }
  
  log.success('All frontend environment variables are set');
  return true;
}

async function testDatabaseConnection() {
  log.section('Testing Database Connection');
  
  try {
    process.chdir('./apps/api');
    execCommand('npm run prisma:generate');
    execCommand('npx prisma db push --skip-generate');
    log.success('Database connection successful');
    process.chdir('../..');
    return true;
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`);
    process.chdir('../..');
    return false;
  }
}

async function deployBackend(environment = 'staging') {
  log.section(`Deploying Backend (${environment})`);
  
  log.info('Pushing code to repository...');
  try {
    execCommand('git add .');
    execCommand(`git commit -m "Deploy to ${environment}" || true`);
    execCommand('git push origin main');
    log.success('Code pushed to repository');
  } catch (error) {
    log.warning(`Git operations failed: ${error.message}`);
  }
  
  log.info('Backend deployment triggered via git push');
  log.info('Monitor deployment progress in Render dashboard');
  
  return true;
}

async function deployFrontend() {
  log.section('Deploying Frontend');
  
  try {
    process.chdir('./apps/web');
    
    // Check if Vercel CLI is installed
    try {
      execCommand('vercel --version');
    } catch (error) {
      log.info('Installing Vercel CLI...');
      execCommand('npm install -g vercel');
    }
    
    log.info('Deploying to Vercel...');
    const deployResult = execCommand('vercel --prod --yes');
    log.success('Frontend deployed successfully');
    log.info(`Deployment URL: ${deployResult}`);
    
    process.chdir('../..');
    return deployResult;
  } catch (error) {
    process.chdir('../..');
    log.error(`Frontend deployment failed: ${error.message}`);
    return false;
  }
}

async function postDeploymentTests(backendUrl, frontendUrl) {
  log.section('Post-deployment Tests');
  
  // Test backend health
  if (backendUrl) {
    try {
      execCommand(`curl -f ${backendUrl}/health`);
      log.success('Backend health check passed');
    } catch (error) {
      log.error('Backend health check failed');
    }
  }
  
  // Test frontend accessibility
  if (frontendUrl) {
    try {
      execCommand(`curl -f -I ${frontendUrl}`);
      log.success('Frontend accessibility check passed');
    } catch (error) {
      log.error('Frontend accessibility check failed');
    }
  }
}

function showDeploymentSummary(environment, backendUrl, frontendUrl) {
  log.section('Deployment Summary');
  
  console.log(`\n${colors.bright}Environment:${colors.reset} ${environment}`);
  
  if (backendUrl) {
    console.log(`${colors.bright}Backend API:${colors.reset} ${backendUrl}`);
    console.log(`${colors.bright}API Docs:${colors.reset} ${backendUrl}/api-docs`);
    console.log(`${colors.bright}Health Check:${colors.reset} ${backendUrl}/health`);
  }
  
  if (frontendUrl) {
    console.log(`${colors.bright}Frontend App:${colors.reset} ${frontendUrl}`);
  }
  
  console.log('\n' + colors.green + 'Next Steps:' + colors.reset);
  console.log('1. Test user registration and login');
  console.log('2. Verify all HMS features work correctly');
  console.log('3. Update DNS records if using custom domains');
  console.log('4. Set up monitoring and error tracking');
  console.log('5. Configure backups and maintenance schedules\n');
}

// Main deployment workflow
async function deploy() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'staging';
  
  if (!config.environments.includes(environment)) {
    log.error(`Invalid environment: ${environment}`);
    log.info(`Valid environments: ${config.environments.join(', ')}`);
    process.exit(1);
  }
  
  log.info(`Starting HMS SaaS deployment to ${environment}...`);
  
  try {
    // Pre-deployment checks
    await preDeploymentChecks();
    
    // Environment validation
    const backendValid = await validateBackendEnvironment(environment);
    const frontendValid = await validateFrontendEnvironment();
    
    if (!backendValid || !frontendValid) {
      log.error('Environment validation failed. Please fix the issues above.');
      process.exit(1);
    }
    
    // Database connection test
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      log.error('Database connection test failed. Please check your DATABASE_URL.');
      process.exit(1);
    }
    
    // Deploy backend
    await deployBackend(environment);
    
    // Deploy frontend
    const frontendUrl = await deployFrontend();
    
    // Post-deployment tests
    const backendUrl = `https://hms-backend-${environment}.onrender.com`;
    await postDeploymentTests(backendUrl, frontendUrl);
    
    // Show summary
    showDeploymentSummary(environment, backendUrl, frontendUrl);
    
    log.success('🎉 Deployment completed successfully!');
    
  } catch (error) {
    log.error(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'deploy':
      deploy();
      break;
    case 'check':
      preDeploymentChecks().then(() => {
        log.success('All pre-deployment checks passed!');
      }).catch(error => {
        log.error(`Pre-deployment check failed: ${error.message}`);
        process.exit(1);
      });
      break;
    case 'validate':
      Promise.all([
        validateBackendEnvironment('staging'),
        validateFrontendEnvironment()
      ]).then(results => {
        if (results.every(r => r)) {
          log.success('All environment validations passed!');
        } else {
          log.error('Environment validation failed');
          process.exit(1);
        }
      });
      break;
    default:
      console.log(`
${colors.bright}HMS SaaS Deployment Helper${colors.reset}

Usage:
  node scripts/deploy.js deploy [staging|production]  Deploy to specified environment
  node scripts/deploy.js check                       Run pre-deployment checks
  node scripts/deploy.js validate                    Validate environment variables

Examples:
  node scripts/deploy.js deploy staging              Deploy to staging
  node scripts/deploy.js deploy production           Deploy to production
  node scripts/deploy.js check                       Check deployment readiness
      `);
  }
}