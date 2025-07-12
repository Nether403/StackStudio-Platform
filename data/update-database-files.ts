/*
 * Update Database Files with Additional Tools
 * Merges additional tools into existing JSON database files
 */

import * as fs from 'fs';
import * as path from 'path';
import { toolsDatabase } from '../data/seed-database';
import { additionalTools } from '../data/additional-tools';

// Combine all tools
const allTools = [...toolsDatabase, ...additionalTools];

// Update coding tools database
const codingToolsPath = path.join(__dirname, '../Database/coding_tools.json');
const aiModelsPath = path.join(__dirname, '../Database/ai_models_and_apis.json');
const deploymentPath = path.join(__dirname, '../Database/deployment_platforms.json');
const databasesPath = path.join(__dirname, '../Database/databases.json');

// Read existing files
let codingTools: any[] = [];
let aiModels: any[] = [];
let deploymentPlatforms: any[] = [];
let databases: any[] = [];

try {
  if (fs.existsSync(codingToolsPath)) {
    codingTools = JSON.parse(fs.readFileSync(codingToolsPath, 'utf8'));
  }
  if (fs.existsSync(aiModelsPath)) {
    aiModels = JSON.parse(fs.readFileSync(aiModelsPath, 'utf8'));
  }
  if (fs.existsSync(deploymentPath)) {
    deploymentPlatforms = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  }
  if (fs.existsSync(databasesPath)) {
    databases = JSON.parse(fs.readFileSync(databasesPath, 'utf8'));
  }
} catch (error) {
  console.log('Note: Some database files may not exist yet, creating new ones...');
}

// Categorize tools
const toolsByCategory = allTools.reduce((acc, tool) => {
  if (!acc[tool.category]) {
    acc[tool.category] = [];
  }
  acc[tool.category].push(tool);
  return acc;
}, {} as Record<string, any[]>);

// Update coding tools (frontend, backend, testing, design, etc.)
const codingCategories = ['frontend', 'backend', 'testing', 'design', 'devops', 'productivity'];
const updatedCodingTools = [
  ...codingTools,
  ...codingCategories.flatMap(category => toolsByCategory[category] || [])
];

// Update AI models and APIs
const aiCategories = ['ai_ml', 'api'];
const updatedAiModels = [
  ...aiModels,
  ...aiCategories.flatMap(category => toolsByCategory[category] || [])
];

// Update deployment platforms
const deploymentCategories = ['deployment', 'monitoring', 'analytics'];
const updatedDeploymentPlatforms = [
  ...deploymentPlatforms,
  ...deploymentCategories.flatMap(category => toolsByCategory[category] || [])
];

// Update databases
const databaseCategories = ['database', 'security'];
const updatedDatabases = [
  ...databases,
  ...databaseCategories.flatMap(category => toolsByCategory[category] || [])
];

// Remove duplicates based on ID
function removeDuplicates(tools: any[]) {
  const seen = new Set();
  return tools.filter(tool => {
    if (seen.has(tool.id)) {
      return false;
    }
    seen.add(tool.id);
    return true;
  });
}

// Write updated files
const finalCodingTools = removeDuplicates(updatedCodingTools);
const finalAiModels = removeDuplicates(updatedAiModels);
const finalDeploymentPlatforms = removeDuplicates(updatedDeploymentPlatforms);
const finalDatabases = removeDuplicates(updatedDatabases);

// Ensure directory exists
const dbDir = path.dirname(codingToolsPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Write files
fs.writeFileSync(codingToolsPath, JSON.stringify(finalCodingTools, null, 2));
fs.writeFileSync(aiModelsPath, JSON.stringify(finalAiModels, null, 2));
fs.writeFileSync(deploymentPath, JSON.stringify(finalDeploymentPlatforms, null, 2));
fs.writeFileSync(databasesPath, JSON.stringify(finalDatabases, null, 2));

// Generate summary
console.log('🎉 Database files updated successfully!');
console.log(`\n📊 Summary:`);
console.log(`- Coding Tools: ${finalCodingTools.length} tools`);
console.log(`- AI Models & APIs: ${finalAiModels.length} tools`);
console.log(`- Deployment Platforms: ${finalDeploymentPlatforms.length} tools`);
console.log(`- Databases: ${finalDatabases.length} tools`);
console.log(`- Total: ${finalCodingTools.length + finalAiModels.length + finalDeploymentPlatforms.length + finalDatabases.length} tools`);

// Generate category breakdown
console.log(`\n📈 Tools by Category:`);
Object.entries(toolsByCategory).forEach(([category, tools]) => {
  console.log(`- ${category}: ${tools.length} tools`);
});

// Generate pricing summary
const freeTools = allTools.filter(tool => tool.pricing.free_tier);
const paidTools = allTools.filter(tool => tool.pricing.paid_plans && tool.pricing.paid_plans.length > 0);

console.log(`\n💰 Pricing Summary:`);
console.log(`- Free tools: ${freeTools.length}`);
console.log(`- Paid tools: ${paidTools.length}`);
console.log(`- Free tier available: ${freeTools.length}`);

console.log(`\n🏁 All database files have been updated with comprehensive tool data!`);
