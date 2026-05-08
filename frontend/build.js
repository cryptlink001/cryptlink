const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Disable all ESLint checks
process.env.ESLINT_NO_DEV_ERRORS = 'true';
process.env.TSC_COMPILE_ON_ERROR = 'true';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.CI = 'false';

// Create .env file for build
fs.writeFileSync('.env.build', 'CI=false\nESLINT_NO_DEV_ERRORS=true\nTSC_COMPILE_ON_ERROR=true\nSKIP_PREFLIGHT_CHECK=true');

// Run build with all checks disabled
try {
  console.log('Starting build with ESLint disabled...');
  execSync('node ./node_modules/react-scripts/bin/react-scripts.js build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      CI: 'false',
      ESLINT_NO_DEV_ERRORS: 'true',
      TSC_COMPILE_ON_ERROR: 'true',
      SKIP_PREFLIGHT_CHECK: 'true'
    }
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
