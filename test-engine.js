/*
 * Simple test for StackFast Recommendation Engine
 * Tests the recommendation logic with expanded database
 */

const fs = require('fs');
const path = require('path');

// Load all tool profiles from database
function loadToolProfiles() {
  const databasePath = path.join(__dirname, 'Database');
  const profiles = [];
  
  // Get all JSON files in the database directory
  const files = fs.readdirSync(databasePath).filter(file => file.endsWith('.json'));
  
  for (const file of files) {
    const filePath = path.join(databasePath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const tools = JSON.parse(content);
    profiles.push(...tools);
  }
  
  return profiles;
}

// Simplified recommendation engine for testing
function testRecommendationEngine() {
  console.log('🚀 Testing StackFast Recommendation Engine with Expanded Database\n');
  
  // Load tool profiles
  const toolProfiles = loadToolProfiles();
  console.log(`📚 Loaded ${toolProfiles.length} tool profiles from database\n`);
  
  // List available categories
  const categories = [...new Set(toolProfiles.map(t => t.category))];
  console.log(`📂 Available categories (${categories.length}):`);
  categories.forEach(cat => {
    const count = toolProfiles.filter(t => t.category === cat).length;
    console.log(`   - ${cat}: ${count} tools`);
  });
  
  console.log('\n🧪 Testing recommendation logic with sample projects:\n');
  
  // Test scenarios
  const testCases = [
    {
      name: "Simple Blog Website",
      keywords: ["blog", "website", "articles"],
      expectedCategories: ["Frontend Framework", "CSS Framework", "Deployment Platform"]
    },
    {
      name: "E-commerce Platform", 
      keywords: ["ecommerce", "payment", "authentication", "database"],
      expectedCategories: ["Frontend Framework", "Backend Framework", "Database", "Deployment Platform"]
    },
    {
      name: "AI Chat App",
      keywords: ["ai", "chat", "real-time", "authentication"],
      expectedCategories: ["Frontend Framework", "Backend Framework", "Language Model", "Database"]
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}`);
    console.log(`   Keywords: ${testCase.keywords.join(', ')}`);
    
    // Find matching tools for each expected category
    const recommendations = [];
    testCase.expectedCategories.forEach(category => {
      const categoryTools = toolProfiles.filter(t => t.category === category);
      if (categoryTools.length > 0) {
        // Get highest rated tool in category
        const bestTool = categoryTools.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))[0];
        recommendations.push({
          name: bestTool.name,
          category: bestTool.category,
          popularity: bestTool.popularity_score || 0,
          pricing: bestTool.pricing_model || 'unknown'
        });
      }
    });
    
    console.log(`   Recommendations (${recommendations.length}):`);
    recommendations.forEach(rec => {
      console.log(`     - ${rec.name} (${rec.category}) - ${rec.popularity.toFixed(2)} popularity, ${rec.pricing} pricing`);
    });
    console.log('');
  });
  
  // Test tool compatibility and conflicts
  console.log('🔍 Testing tool compatibility and conflicts:\n');
  
  // Check for tools with rules
  const toolsWithRules = toolProfiles.filter(t => t.rules && t.rules.length > 0);
  console.log(`📋 Found ${toolsWithRules.length} tools with compatibility rules:`);
  toolsWithRules.forEach(tool => {
    console.log(`   - ${tool.name} (${tool.category})`);
    tool.rules.forEach(rule => {
      console.log(`     Rule: ${rule.kind} - ${rule.reason}`);
    });
  });
  
  // Check database quality
  console.log('\n📊 Database Quality Check:\n');
  
  const toolsWithPricing = toolProfiles.filter(t => t.pricing_model).length;
  const toolsWithPopularity = toolProfiles.filter(t => t.popularity_score).length;
  const toolsWithCompatibility = toolProfiles.filter(t => t.compatible_with && t.compatible_with.length > 0).length;
  const toolsWithSkills = toolProfiles.filter(t => t.skills && t.skills.setup && t.skills.daily).length;
  
  console.log(`   - Tools with pricing info: ${toolsWithPricing}/${toolProfiles.length} (${((toolsWithPricing/toolProfiles.length)*100).toFixed(1)}%)`);
  console.log(`   - Tools with popularity scores: ${toolsWithPopularity}/${toolProfiles.length} (${((toolsWithPopularity/toolProfiles.length)*100).toFixed(1)}%)`);
  console.log(`   - Tools with compatibility info: ${toolsWithCompatibility}/${toolProfiles.length} (${((toolsWithCompatibility/toolProfiles.length)*100).toFixed(1)}%)`);
  console.log(`   - Tools with skill requirements: ${toolsWithSkills}/${toolProfiles.length} (${((toolsWithSkills/toolProfiles.length)*100).toFixed(1)}%)`);
  
  console.log('\n🎉 Recommendation Engine Test Complete!\n');
}

// Run the test
testRecommendationEngine();
