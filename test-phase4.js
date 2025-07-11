// Test file to verify Phase 4 integration
// This file tests the recommendation engine and project generator integration

import { StackRecommendationEngine } from './Engine/stack-recommendation-engine';

// Sample tool profiles for testing
const sampleToolProfiles = [
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    skills: { setup: 2, daily: 3 },
    pricing_model: 'free',
    baseline_cost: 0,
    compatible_with: ['javascript', 'typescript'],
    popularity_score: 95,
    community_sentiment: 'highly_positive'
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'backend',
    skills: { setup: 2, daily: 3 },
    pricing_model: 'free',
    baseline_cost: 0,
    compatible_with: ['javascript', 'typescript'],
    popularity_score: 90,
    community_sentiment: 'highly_positive'
  },
  {
    id: 'firebase',
    name: 'Firebase',
    category: 'database',
    skills: { setup: 1, daily: 2 },
    pricing_model: 'freemium',
    baseline_cost: 0,
    compatible_with: ['javascript', 'typescript'],
    popularity_score: 85,
    community_sentiment: 'positive'
  }
];

// Test function
function testRecommendationEngine() {
  console.log('🧪 Testing StackFast Recommendation Engine...');
  
  try {
    // Initialize the engine
    const engine = new StackRecommendationEngine(sampleToolProfiles);
    
    // Test project description
    const projectIdea = "A social media platform for pet owners with photo sharing and real-time chat";
    const skillLevel = { setup: 6, daily: 7 };
    
    // Generate recommendation
    const recommendation = engine.generateRecommendation(projectIdea, skillLevel);
    
    console.log('✅ Recommendation generated successfully!');
    console.log('📋 Summary:', recommendation.summary);
    console.log('🛠️ Recommended Stack:', recommendation.recommendedStack.map(s => s.name).join(', '));
    console.log('💰 Estimated Cost: $' + recommendation.estimatedCost.min + '-$' + recommendation.estimatedCost.max);
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
if (require.main === module) {
  const success = testRecommendationEngine();
  process.exit(success ? 0 : 1);
}

export { testRecommendationEngine };
