#!/usr/bin/env node

// Quick health check for StackFast
console.log('🏥 StackFast Health Check\n');

const fs = require('fs');
const path = require('path');

// Check critical files
const criticalFiles = [
  'package.json',
  'pages/index.tsx',
  'lib/firebase-admin.js',
  'components/SSRDashboard.tsx',
  '.env.local'
];

let allGood = true;

console.log('📋 Checking critical files...');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
});

// Check for syntax issues in key files
console.log('\n🔍 Checking for syntax issues...');

// Check index.tsx for corruption
try {
  const indexContent = fs.readFileSync('pages/index.tsx', 'utf8');
  if (indexContent.includes('setup-demo.bat')) {
    console.log('❌ pages/index.tsx - Contains corrupted content');
    allGood = false;
  } else if (!indexContent.includes('export default function Home')) {
    console.log('❌ pages/index.tsx - Missing main export');
    allGood = false;
  } else {
    console.log('✅ pages/index.tsx - Syntax OK');
  }
} catch (error) {
  console.log('❌ pages/index.tsx - Cannot read file');
  allGood = false;
}

// Check firebase-admin.js for duplicate exports
try {
  const firebaseContent = fs.readFileSync('lib/firebase-admin.js', 'utf8');
  const exportMatches = firebaseContent.match(/export.*app/g) || [];
  if (exportMatches.length > 1) {
    console.log('❌ lib/firebase-admin.js - Duplicate exports detected');
    allGood = false;
  } else {
    console.log('✅ lib/firebase-admin.js - Exports OK');
  }
} catch (error) {
  console.log('❌ lib/firebase-admin.js - Cannot read file');
  allGood = false;
}

console.log('\n📊 Overall Status:');
if (allGood) {
  console.log('🎉 All checks passed! Ready for demo recording.');
  console.log('🚀 Run: .\\start-demo.ps1');
} else {
  console.log('⚠️  Some issues detected. Please fix before recording.');
}

console.log('\n💡 Demo recording tips:');
console.log('  • Use incognito/private browsing');
console.log('  • Set window size to 1200x800');
console.log('  • Keep recording under 60 seconds');
console.log('  • Focus on AI recommendations feature');
