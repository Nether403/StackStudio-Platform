// Simple test to verify GitHub integration dependencies
console.log('✅ GitHub integration test started');

// Basic smoke test
try {
  const { Octokit } = require('@octokit/rest');
  console.log('✅ Octokit dependency loaded successfully');
  
  // Test environment variables (they should be present in CI)
  if (process.env.GITHUB_ID) {
    console.log('✅ GitHub ID environment variable present');
  } else {
    console.log('⚠️  GitHub ID not set (expected in local development)');
  }
  
  if (process.env.GITHUB_SECRET) {
    console.log('✅ GitHub Secret environment variable present');
  } else {
    console.log('⚠️  GitHub Secret not set (expected in local development)');
  }
  
  console.log('✅ All GitHub integration tests passed');
  process.exit(0);
} catch (error) {
  console.error('❌ GitHub integration test failed:', error.message);
  process.exit(1);
}