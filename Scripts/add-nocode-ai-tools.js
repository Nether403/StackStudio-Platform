/*
 * No-Code/Low-Code and AI Development Tools Database Expansion
 * Adding modern AI-powered development platforms and no-code tools
 */

const fs = require('fs');
const path = require('path');

// No-Code/Low-Code and AI Development Tools
const noCodeLowCodeTools = [
  // AI-Powered Development Platforms
  {
    id: 'bolt_new',
    name: 'Bolt.new',
    category: 'ai_development',
    description: 'AI-powered full-stack development platform that generates complete applications',
    compatibility: ['javascript', 'typescript', 'react', 'vue', 'angular'],
    pros: ['Full-stack generation', 'Real-time preview', 'Modern frameworks', 'No setup required'],
    cons: ['Limited customization', 'Dependency on AI', 'Usage limits'],
    use_cases: ['Rapid prototyping', 'MVP development', 'Learning projects', 'Quick demos'],
    learning_curve: 'easy',
    community_size: 'medium',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 20,
      cost_scaling_factor: 1.5,
      paid_plans: [
        { name: 'Pro', cost: 20 },
        { name: 'Team', cost: 40 }
      ]
    },
    recommendation_weight: 0.85
  },
  {
    id: 'lovable_ai',
    name: 'Lovable',
    category: 'ai_development',
    description: 'AI web app builder that creates full-stack applications from natural language',
    compatibility: ['javascript', 'typescript', 'react'],
    pros: ['Natural language input', 'Full-stack generation', 'Modern UI/UX', 'Deployment included'],
    cons: ['Limited to web apps', 'AI dependency', 'Template constraints'],
    use_cases: ['Web app development', 'SaaS prototypes', 'Business applications', 'MVPs'],
    learning_curve: 'easy',
    community_size: 'small',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 29,
      cost_scaling_factor: 1.2,
      paid_plans: [
        { name: 'Pro', cost: 29 },
        { name: 'Team', cost: 99 }
      ]
    },
    recommendation_weight: 0.80
  },
  {
    id: 'manus_ai',
    name: 'Manus AI',
    category: 'ai_development',
    description: 'AI development assistant for code generation and project management',
    compatibility: ['javascript', 'typescript', 'python', 'java'],
    pros: ['Multi-language support', 'Project management', 'Code generation', 'Documentation'],
    cons: ['Newer platform', 'Limited integrations', 'Learning curve'],
    use_cases: ['Code assistance', 'Project planning', 'Documentation', 'Code review'],
    learning_curve: 'medium',
    community_size: 'small',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'fair',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 15,
      cost_scaling_factor: 1.3,
      paid_plans: [
        { name: 'Pro', cost: 15 },
        { name: 'Enterprise', cost: 45 }
      ]
    },
    recommendation_weight: 0.70
  },
  {
    id: 'blackbox_ai',
    name: 'Blackbox AI',
    category: 'ai_development',
    description: 'AI code generation platform with real-time coding assistance',
    compatibility: ['javascript', 'typescript', 'python', 'java', 'csharp', 'go'],
    pros: ['Multi-language support', 'Real-time suggestions', 'Code completion', 'Free tier'],
    cons: ['Code quality varies', 'Internet dependency', 'Limited context understanding'],
    use_cases: ['Code completion', 'Function generation', 'Bug fixing', 'Learning'],
    learning_curve: 'easy',
    community_size: 'medium',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 10,
      cost_scaling_factor: 1.2,
      paid_plans: [
        { name: 'Pro', cost: 10 },
        { name: 'Team', cost: 25 }
      ]
    },
    recommendation_weight: 0.75
  },
  {
    id: 'windsurf_ai',
    name: 'Windsurf',
    category: 'ai_development',
    description: 'AI-powered IDE with intelligent code generation and project management',
    compatibility: ['javascript', 'typescript', 'python', 'java', 'csharp'],
    pros: ['Full IDE experience', 'AI integration', 'Project management', 'Collaborative features'],
    cons: ['Resource intensive', 'Learning curve', 'Subscription required'],
    use_cases: ['Full-stack development', 'Team collaboration', 'Project management', 'Code review'],
    learning_curve: 'medium',
    community_size: 'small',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 20,
      cost_scaling_factor: 1.4,
      paid_plans: [
        { name: 'Pro', cost: 20 },
        { name: 'Team', cost: 50 }
      ]
    },
    recommendation_weight: 0.78
  },
  {
    id: 'cursor_ai',
    name: 'Cursor',
    category: 'ai_development',
    description: 'AI-powered code editor built for pair programming with AI',
    compatibility: ['javascript', 'typescript', 'python', 'java', 'csharp', 'go'],
    pros: ['VSCode-like interface', 'AI pair programming', 'Context awareness', 'Fast performance'],
    cons: ['Subscription cost', 'AI dependency', 'Limited offline functionality'],
    use_cases: ['AI pair programming', 'Code editing', 'Refactoring', 'Learning'],
    learning_curve: 'easy',
    community_size: 'medium',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 20,
      cost_scaling_factor: 1.3,
      paid_plans: [
        { name: 'Pro', cost: 20 },
        { name: 'Business', cost: 40 }
      ]
    },
    recommendation_weight: 0.88
  },
  {
    id: 'rocket_new',
    name: 'Rocket.new',
    category: 'no_code',
    description: 'No-code platform for rapid application development and deployment',
    compatibility: ['visual_builder'],
    pros: ['No coding required', 'Rapid development', 'Built-in deployment', 'Template library'],
    cons: ['Limited customization', 'Vendor lock-in', 'Performance limitations'],
    use_cases: ['Business applications', 'Prototypes', 'Internal tools', 'Landing pages'],
    learning_curve: 'easy',
    community_size: 'small',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 30,
      cost_scaling_factor: 1.5,
      paid_plans: [
        { name: 'Starter', cost: 30 },
        { name: 'Pro', cost: 60 },
        { name: 'Enterprise', cost: 150 }
      ]
    },
    recommendation_weight: 0.75
  },
  // Additional No-Code/Low-Code Platforms
  {
    id: 'webflow',
    name: 'Webflow',
    category: 'no_code',
    description: 'Visual web development platform for designers and developers',
    compatibility: ['visual_builder', 'html', 'css', 'javascript'],
    pros: ['Visual design', 'Custom code support', 'Responsive design', 'CMS included'],
    cons: ['Learning curve', 'Pricing', 'Limited backend functionality'],
    use_cases: ['Business websites', 'Portfolio sites', 'E-commerce', 'Marketing sites'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 12,
      cost_scaling_factor: 1.8,
      paid_plans: [
        { name: 'Basic', cost: 12 },
        { name: 'CMS', cost: 16 },
        { name: 'Business', cost: 36 }
      ]
    },
    recommendation_weight: 0.85
  },
  {
    id: 'bubble',
    name: 'Bubble',
    category: 'no_code',
    description: 'Full-stack no-code platform for building web applications',
    compatibility: ['visual_builder'],
    pros: ['Full-stack capabilities', 'Database included', 'Custom logic', 'Large community'],
    cons: ['Performance limitations', 'Learning curve', 'Vendor lock-in'],
    use_cases: ['Web applications', 'SaaS products', 'Marketplaces', 'Social platforms'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 25,
      cost_scaling_factor: 2.0,
      paid_plans: [
        { name: 'Personal', cost: 25 },
        { name: 'Professional', cost: 115 },
        { name: 'Production', cost: 475 }
      ]
    },
    recommendation_weight: 0.80
  },
  {
    id: 'retool',
    name: 'Retool',
    category: 'low_code',
    description: 'Low-code platform for building internal tools and admin panels',
    compatibility: ['javascript', 'sql', 'apis'],
    pros: ['Rapid development', 'Database connections', 'Custom components', 'Team collaboration'],
    cons: ['Pricing', 'Learning curve', 'Limited public app deployment'],
    use_cases: ['Internal tools', 'Admin panels', 'Dashboards', 'CRUD applications'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 10,
      cost_scaling_factor: 1.5,
      paid_plans: [
        { name: 'Team', cost: 10 },
        { name: 'Business', cost: 50 },
        { name: 'Enterprise', cost: 100 }
      ]
    },
    recommendation_weight: 0.88
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: 'no_code',
    description: 'No-code database and application platform with spreadsheet interface',
    compatibility: ['visual_builder', 'apis'],
    pros: ['Easy to use', 'Flexible data models', 'Automation', 'Collaboration'],
    cons: ['Limited customization', 'Performance with large datasets', 'Pricing'],
    use_cases: ['Project management', 'CRM', 'Content management', 'Team collaboration'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 10,
      cost_scaling_factor: 1.6,
      paid_plans: [
        { name: 'Plus', cost: 10 },
        { name: 'Pro', cost: 20 },
        { name: 'Enterprise', cost: 45 }
      ]
    },
    recommendation_weight: 0.82
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'no_code',
    description: 'No-code automation platform connecting apps and services',
    compatibility: ['apis', 'webhooks'],
    pros: ['Extensive integrations', 'Easy automation', 'No coding required', 'Reliable'],
    cons: ['Pricing for high usage', 'Limited logic', 'Dependency on third-party APIs'],
    use_cases: ['Workflow automation', 'Data synchronization', 'Task automation', 'Integration'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 20,
      cost_scaling_factor: 2.5,
      paid_plans: [
        { name: 'Starter', cost: 20 },
        { name: 'Professional', cost: 49 },
        { name: 'Team', cost: 69 }
      ]
    },
    recommendation_weight: 0.90
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'no_code',
    description: 'All-in-one workspace with no-code database and page building capabilities',
    compatibility: ['visual_builder', 'markdown'],
    pros: ['Versatile', 'Collaboration', 'Templates', 'Affordable'],
    cons: ['Performance with large datasets', 'Limited customization', 'Learning curve'],
    use_cases: ['Documentation', 'Project management', 'Knowledge base', 'Team collaboration'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 8,
      cost_scaling_factor: 1.2,
      paid_plans: [
        { name: 'Plus', cost: 8 },
        { name: 'Business', cost: 15 },
        { name: 'Enterprise', cost: 25 }
      ]
    },
    recommendation_weight: 0.85
  },
  {
    id: 'framer',
    name: 'Framer',
    category: 'no_code',
    description: 'No-code website builder with advanced design and interaction capabilities',
    compatibility: ['visual_builder', 'react'],
    pros: ['Advanced animations', 'Responsive design', 'Component system', 'React integration'],
    cons: ['Learning curve', 'Limited backend', 'Pricing'],
    use_cases: ['Marketing sites', 'Portfolio sites', 'Landing pages', 'Interactive prototypes'],
    learning_curve: 'medium',
    community_size: 'medium',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 5,
      cost_scaling_factor: 1.5,
      paid_plans: [
        { name: 'Mini', cost: 5 },
        { name: 'Basic', cost: 15 },
        { name: 'Pro', cost: 25 }
      ]
    },
    recommendation_weight: 0.80
  },
  {
    id: 'make_integromat',
    name: 'Make (Integromat)',
    category: 'no_code',
    description: 'Visual automation platform for connecting apps and automating workflows',
    compatibility: ['apis', 'webhooks'],
    pros: ['Visual workflow builder', 'Complex logic support', 'Extensive integrations', 'Real-time execution'],
    cons: ['Learning curve', 'Pricing', 'Complex for simple tasks'],
    use_cases: ['Complex automations', 'Data processing', 'API integrations', 'Workflow optimization'],
    learning_curve: 'medium',
    community_size: 'medium',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 9,
      cost_scaling_factor: 2.0,
      paid_plans: [
        { name: 'Core', cost: 9 },
        { name: 'Pro', cost: 16 },
        { name: 'Teams', cost: 29 }
      ]
    },
    recommendation_weight: 0.82
  }
];

// Transform tools to match existing format
const transformedTools = noCodeLowCodeTools.map(tool => ({
  id: tool.id,
  name: tool.name,
  description: tool.description,
  category: tool.category,
  notableStrengths: tool.pros,
  rules: [],
  skills: { setup: 1, daily: 1 },
  costModel: {
    type: tool.pricing.free_tier ? 'Freemium' : 'Paid',
    base_cost_monthly: tool.pricing.baseline_cost,
    free_tier_details: tool.pricing.free_tier ? 'Free tier available' : 'No free tier',
    link: `https://${tool.id.replace(/_/g, '')}.com`
  },
  pricing_model: tool.pricing.free_tier ? 'freemium' : 'paid',
  baseline_cost: tool.pricing.baseline_cost,
  compatible_with: tool.compatibility,
  popularity_score: tool.recommendation_weight,
  community_sentiment: tool.community_size === 'large' ? 'highly_positive' : 'positive',
  documentation_link: `https://docs.${tool.id.replace(/_/g, '')}.com`,
  website_link: `https://${tool.id.replace(/_/g, '')}.com`
}));

// Database file paths
const databaseDir = path.join(__dirname, '../Database');
const codingToolsPath = path.join(databaseDir, 'coding_tools.json');
const aiModelsPath = path.join(databaseDir, 'ai_models_and_apis.json');

// Ensure directory exists
if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, { recursive: true });
}

// Categorize tools
const categorizedTools = {
  ai_development: [],
  no_code: [],
  low_code: []
};

transformedTools.forEach(tool => {
  if (categorizedTools[tool.category]) {
    categorizedTools[tool.category].push(tool);
  }
});

// Read existing files and merge
function readExistingFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.log(`Note: Could not read ${filePath}, will create new file`);
  }
  return [];
}

// Update coding tools with AI development tools
const existingCodingTools = readExistingFile(codingToolsPath);
const aiDevelopmentTools = categorizedTools.ai_development;
const mergedCodingTools = [...existingCodingTools];

aiDevelopmentTools.forEach(newTool => {
  const existingIndex = mergedCodingTools.findIndex(t => t.id === newTool.id);
  if (existingIndex >= 0) {
    mergedCodingTools[existingIndex] = newTool;
  } else {
    mergedCodingTools.push(newTool);
  }
});

// Update AI models with no-code/low-code tools
const existingAiModels = readExistingFile(aiModelsPath);
const noCodeLowCodeCombined = [...categorizedTools.no_code, ...categorizedTools.low_code];
const mergedAiModels = [...existingAiModels];

noCodeLowCodeCombined.forEach(newTool => {
  const existingIndex = mergedAiModels.findIndex(t => t.id === newTool.id);
  if (existingIndex >= 0) {
    mergedAiModels[existingIndex] = newTool;
  } else {
    mergedAiModels.push(newTool);
  }
});

// Write files
fs.writeFileSync(codingToolsPath, JSON.stringify(mergedCodingTools, null, 2));
fs.writeFileSync(aiModelsPath, JSON.stringify(mergedAiModels, null, 2));

console.log('✅ No-Code/Low-Code and AI Development Tools added successfully!');
console.log(`🤖 Added ${aiDevelopmentTools.length} AI development tools to coding_tools.json`);
console.log(`🎨 Added ${noCodeLowCodeCombined.length} no-code/low-code tools to ai_models_and_apis.json`);
console.log(`📊 Total coding tools: ${mergedCodingTools.length}`);
console.log(`🔧 Total AI/no-code tools: ${mergedAiModels.length}`);

// List added tools
console.log('\n🚀 AI Development Tools Added:');
aiDevelopmentTools.forEach(tool => console.log(`  - ${tool.name} (${tool.id})`));

console.log('\n🎨 No-Code/Low-Code Tools Added:');
noCodeLowCodeCombined.forEach(tool => console.log(`  - ${tool.name} (${tool.id})`));
