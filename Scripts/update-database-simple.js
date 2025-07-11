/*
 * Simple Database Update Script
 * Updates JSON files with comprehensive tool data
 */

const fs = require('fs');
const path = require('path');

// Comprehensive tool database
const toolsDatabase = [
  // Frontend Frameworks
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    description: 'A JavaScript library for building user interfaces',
    compatibility: ['javascript', 'typescript'],
    pros: ['Large ecosystem', 'Component-based', 'Virtual DOM', 'Strong community'],
    cons: ['Learning curve', 'Frequent updates', 'Complex state management'],
    use_cases: ['Web applications', 'Mobile apps', 'Desktop apps'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 220000,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.95
  },
  {
    id: 'vue',
    name: 'Vue.js',
    category: 'frontend',
    description: 'The Progressive JavaScript Framework',
    compatibility: ['javascript', 'typescript'],
    pros: ['Easy to learn', 'Flexible', 'Great documentation', 'Small bundle size'],
    cons: ['Smaller ecosystem than React', 'Less job market'],
    use_cases: ['Web applications', 'Progressive web apps', 'Single-page applications'],
    learning_curve: 'easy',
    community_size: 'medium',
    github_stars: 206000,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.85
  },
  {
    id: 'angular',
    name: 'Angular',
    category: 'frontend',
    description: 'Platform for building mobile and desktop web applications',
    compatibility: ['typescript'],
    pros: ['Full framework', 'TypeScript first', 'Powerful CLI', 'Enterprise-ready'],
    cons: ['Steep learning curve', 'Verbose', 'Frequent breaking changes'],
    use_cases: ['Enterprise applications', 'Large-scale web apps', 'Mobile apps'],
    learning_curve: 'hard',
    community_size: 'large',
    github_stars: 93000,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.75
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'frontend',
    description: 'React framework with server-side rendering and static site generation',
    compatibility: ['javascript', 'typescript'],
    pros: ['Server-side rendering', 'Static site generation', 'API routes', 'Great performance'],
    cons: ['Learning curve', 'Opinionated', 'Complexity for simple apps'],
    use_cases: ['Full-stack React apps', 'Static sites', 'E-commerce', 'Landing pages'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 118000,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.90
  },
  {
    id: 'svelte',
    name: 'Svelte',
    category: 'frontend',
    description: 'Cybernetically enhanced web apps',
    compatibility: ['javascript', 'typescript'],
    pros: ['No virtual DOM', 'Small bundle size', 'Great performance', 'Simple syntax'],
    cons: ['Smaller ecosystem', 'Less tooling', 'Newer framework'],
    use_cases: ['Web applications', 'Performance-critical apps', 'Small projects'],
    learning_curve: 'easy',
    community_size: 'small',
    github_stars: 76000,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.70
  },
  // Backend Frameworks
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'backend',
    description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
    compatibility: ['javascript', 'typescript'],
    pros: ['JavaScript everywhere', 'Large ecosystem', 'Fast development', 'Great for APIs'],
    cons: ['Single-threaded', 'Callback complexity', 'Not ideal for CPU-intensive tasks'],
    use_cases: ['Web APIs', 'Real-time applications', 'Microservices', 'Command-line tools'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 104000,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.90
  },
  {
    id: 'express',
    name: 'Express.js',
    category: 'backend',
    description: 'Fast, unopinionated, minimalist web framework for Node.js',
    compatibility: ['javascript', 'typescript'],
    pros: ['Lightweight', 'Flexible', 'Large ecosystem', 'Easy to learn'],
    cons: ['Minimal by design', 'Requires additional packages', 'No built-in security'],
    use_cases: ['Web APIs', 'Web applications', 'Microservices', 'RESTful services'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 64000,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.85
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    category: 'backend',
    description: 'Modern, fast web framework for building APIs with Python',
    compatibility: ['python'],
    pros: ['Fast performance', 'Automatic API documentation', 'Type hints', 'Modern Python'],
    cons: ['Relatively new', 'Python-only', 'Learning curve for advanced features'],
    use_cases: ['REST APIs', 'GraphQL APIs', 'Machine learning APIs', 'Microservices'],
    learning_curve: 'medium',
    community_size: 'medium',
    github_stars: 71000,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.80
  },
  {
    id: 'django',
    name: 'Django',
    category: 'backend',
    description: 'The web framework for perfectionists with deadlines',
    compatibility: ['python'],
    pros: ['Full-featured', 'Secure by default', 'Admin interface', 'ORM included'],
    cons: ['Monolithic', 'Learning curve', 'Can be overkill for simple apps'],
    use_cases: ['Web applications', 'Content management', 'E-commerce', 'Enterprise apps'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 76000,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.80
  },
  {
    id: 'flask',
    name: 'Flask',
    category: 'backend',
    description: 'A lightweight WSGI web application framework',
    compatibility: ['python'],
    pros: ['Lightweight', 'Flexible', 'Easy to learn', 'Great for microservices'],
    cons: ['Minimal by design', 'Requires additional packages', 'No built-in ORM'],
    use_cases: ['Web APIs', 'Microservices', 'Prototyping', 'Simple web applications'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 66000,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.75
  },
  // Databases
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'database',
    description: 'Advanced open source relational database',
    compatibility: ['sql'],
    pros: ['ACID compliant', 'Extensible', 'JSON support', 'Great performance'],
    cons: ['Complex configuration', 'Resource intensive', 'Learning curve'],
    use_cases: ['Web applications', 'Data analytics', 'Enterprise applications', 'GIS applications'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 15000,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.90
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'database',
    description: 'Document-oriented NoSQL database',
    compatibility: ['javascript', 'python', 'java', 'csharp'],
    pros: ['Flexible schema', 'Horizontal scaling', 'Rich queries', 'Great for JSON'],
    cons: ['Memory usage', 'Eventual consistency', 'Complex aggregation'],
    use_cases: ['Web applications', 'Content management', 'IoT applications', 'Real-time analytics'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 25000,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: [
        { name: 'Atlas Starter', cost: 0 },
        { name: 'Atlas Serverless', cost: 0.10 },
        { name: 'Atlas Dedicated', cost: 57 }
      ]
    },
    recommendation_weight: 0.80
  },
  {
    id: 'mysql',
    name: 'MySQL',
    category: 'database',
    description: 'Open-source relational database management system',
    compatibility: ['sql'],
    pros: ['Mature', 'Fast', 'Reliable', 'Large community'],
    cons: ['Limited features vs PostgreSQL', 'Oracle ownership concerns'],
    use_cases: ['Web applications', 'E-commerce', 'Data warehousing', 'Online transaction processing'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 10000,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.75
  },
  {
    id: 'redis',
    name: 'Redis',
    category: 'database',
    description: 'In-memory data structure store',
    compatibility: ['javascript', 'python', 'java', 'csharp'],
    pros: ['Extremely fast', 'Versatile data types', 'Pub/sub messaging', 'Great for caching'],
    cons: ['Memory-only', 'Single-threaded', 'Persistence complexity'],
    use_cases: ['Caching', 'Session storage', 'Real-time messaging', 'Leaderboards'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 64000,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.85
  },
  // Development Tools
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    category: 'development_tools',
    description: 'Free source-code editor with rich ecosystem',
    compatibility: ['javascript', 'typescript', 'python', 'java', 'csharp'],
    pros: ['Free', 'Extensive extensions', 'Git integration', 'IntelliSense'],
    cons: ['Can be resource-heavy', 'Extension dependency'],
    use_cases: ['Code editing', 'Debugging', 'Git management', 'Extension development'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 158000,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.95
  },
  {
    id: 'git',
    name: 'Git',
    category: 'development_tools',
    description: 'Distributed version control system',
    compatibility: ['all'],
    pros: ['Distributed', 'Branching model', 'Fast', 'Industry standard'],
    cons: ['Learning curve', 'Complex merge conflicts', 'Command-line heavy'],
    use_cases: ['Version control', 'Collaboration', 'Code history', 'Deployment'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 50000,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 1.0
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'deployment',
    description: 'Platform for developing, shipping, and running applications in containers',
    compatibility: ['all'],
    pros: ['Containerization', 'Consistent environments', 'Microservices', 'DevOps integration'],
    cons: ['Learning curve', 'Resource overhead', 'Complexity for simple apps'],
    use_cases: ['Application deployment', 'Development environments', 'Microservices', 'CI/CD'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 68000,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: [
        { name: 'Docker Pro', cost: 5 },
        { name: 'Docker Team', cost: 7 },
        { name: 'Docker Business', cost: 21 }
      ]
    },
    recommendation_weight: 0.90
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    category: 'deployment',
    description: 'Open-source container orchestration system',
    compatibility: ['all'],
    pros: ['Auto-scaling', 'Service discovery', 'Rolling updates', 'Cloud-native'],
    cons: ['Complex setup', 'Steep learning curve', 'Resource overhead'],
    use_cases: ['Container orchestration', 'Microservices', 'Cloud deployments', 'Auto-scaling'],
    learning_curve: 'hard',
    community_size: 'large',
    github_stars: 106000,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.80
  },
  {
    id: 'aws',
    name: 'Amazon Web Services',
    category: 'cloud',
    description: 'Comprehensive cloud computing platform',
    compatibility: ['all'],
    pros: ['Comprehensive services', 'Reliable', 'Global infrastructure', 'Market leader'],
    cons: ['Complex pricing', 'Steep learning curve', 'Vendor lock-in'],
    use_cases: ['Cloud hosting', 'Serverless computing', 'Data storage', 'Machine learning'],
    learning_curve: 'hard',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.5,
      paid_plans: []
    },
    recommendation_weight: 0.85
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'deployment',
    description: 'Platform for frontend developers to deploy and host web applications',
    compatibility: ['javascript', 'typescript'],
    pros: ['Zero-config deployments', 'Edge network', 'Git integration', 'Serverless functions'],
    cons: ['Focused on frontend', 'Pricing for large projects', 'Limited backend capabilities'],
    use_cases: ['Static site hosting', 'Jamstack applications', 'Next.js deployment', 'Frontend hosting'],
    learning_curve: 'easy',
    community_size: 'medium',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: [
        { name: 'Pro', cost: 20 },
        { name: 'Team', cost: 40 }
      ]
    },
    recommendation_weight: 0.80
  },
  {
    id: 'netlify',
    name: 'Netlify',
    category: 'deployment',
    description: 'Platform for modern web development with continuous deployment',
    compatibility: ['javascript', 'typescript'],
    pros: ['Easy deployment', 'Git integration', 'Forms handling', 'CDN included'],
    cons: ['Limited backend features', 'Build time limits', 'Bandwidth limits'],
    use_cases: ['Static site hosting', 'Jamstack applications', 'Form handling', 'A/B testing'],
    learning_curve: 'easy',
    community_size: 'medium',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: [
        { name: 'Pro', cost: 19 },
        { name: 'Business', cost: 99 }
      ]
    },
    recommendation_weight: 0.75
  },
  // AI/ML Tools
  {
    id: 'github_copilot',
    name: 'GitHub Copilot',
    category: 'ai_tools',
    description: 'AI pair programmer that helps you write code faster',
    compatibility: ['javascript', 'typescript', 'python', 'java', 'csharp'],
    pros: ['Code suggestions', 'Multiple language support', 'IDE integration', 'Context awareness'],
    cons: ['Subscription cost', 'Code quality concerns', 'Privacy considerations'],
    use_cases: ['Code completion', 'Function generation', 'Documentation writing', 'Bug fixing'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: false,
      baseline_cost: 10,
      cost_per_user: 10,
      cost_scaling_factor: 1,
      paid_plans: [
        { name: 'Individual', cost: 10 },
        { name: 'Business', cost: 19 }
      ]
    },
    recommendation_weight: 0.85
  },
  {
    id: 'openai_api',
    name: 'OpenAI API',
    category: 'ai_tools',
    description: 'API for accessing OpenAI\'s language models',
    compatibility: ['javascript', 'typescript', 'python', 'java', 'csharp'],
    pros: ['Powerful models', 'Flexible pricing', 'Good documentation', 'Multiple use cases'],
    cons: ['Usage-based pricing', 'Rate limits', 'Dependency on external service'],
    use_cases: ['Chatbots', 'Content generation', 'Code generation', 'Text analysis'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 2,
      paid_plans: []
    },
    recommendation_weight: 0.90
  },
  {
    id: 'tensorflow',
    name: 'TensorFlow',
    category: 'ai_tools',
    description: 'Open-source machine learning framework',
    compatibility: ['python', 'javascript'],
    pros: ['Comprehensive ecosystem', 'Production-ready', 'Community support', 'Flexible deployment'],
    cons: ['Steep learning curve', 'Complex for beginners', 'Resource intensive'],
    use_cases: ['Machine learning', 'Deep learning', 'Computer vision', 'Natural language processing'],
    learning_curve: 'hard',
    community_size: 'large',
    github_stars: 182000,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.85
  },
  {
    id: 'pytorch',
    name: 'PyTorch',
    category: 'ai_tools',
    description: 'Open-source machine learning library',
    compatibility: ['python'],
    pros: ['Dynamic computation graphs', 'Pythonic', 'Great for research', 'Strong community'],
    cons: ['Newer than TensorFlow', 'Less deployment options', 'Memory usage'],
    use_cases: ['Research', 'Computer vision', 'Natural language processing', 'Reinforcement learning'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 78000,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.80
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    category: 'ai_tools',
    description: 'Platform for sharing and using machine learning models',
    compatibility: ['python', 'javascript'],
    pros: ['Pre-trained models', 'Easy to use', 'Large model hub', 'Community-driven'],
    cons: ['Dependent on internet', 'Model licensing', 'Performance considerations'],
    use_cases: ['NLP tasks', 'Model deployment', 'Transfer learning', 'Prototyping'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 127000,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: [
        { name: 'Pro', cost: 9 },
        { name: 'Enterprise', cost: 20 }
      ]
    },
    recommendation_weight: 0.85
  }
];

// Transform tools to match existing format
const transformedTools = toolsDatabase.map(tool => ({
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
    link: `https://example.com/${tool.id}`
  },
  pricing_model: tool.pricing.free_tier ? 'freemium' : 'paid',
  baseline_cost: tool.pricing.baseline_cost,
  compatible_with: tool.compatibility,
  popularity_score: tool.recommendation_weight,
  community_sentiment: tool.community_size === 'large' ? 'highly_positive' : 'positive',
  documentation_link: `https://docs.${tool.id}.com`,
  website_link: `https://${tool.id}.com`
}));

// Database file paths
const databaseDir = path.join(__dirname, '../Database');
const codingToolsPath = path.join(databaseDir, 'coding_tools.json');
const aiModelsPath = path.join(databaseDir, 'ai_models_and_apis.json');
const deploymentPath = path.join(databaseDir, 'deployment_platforms.json');
const databasesPath = path.join(databaseDir, 'databases.json');

// Ensure directory exists
if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, { recursive: true });
}

// Categorize tools
const categorizedTools = {
  frontend: [],
  backend: [],
  database: [],
  development_tools: [],
  deployment: [],
  cloud: [],
  ai_tools: []
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

// Update coding tools (frontend + backend + development_tools)
const existingCodingTools = readExistingFile(codingToolsPath);
const newCodingTools = [
  ...categorizedTools.frontend,
  ...categorizedTools.backend,
  ...categorizedTools.development_tools
];

// Merge and deduplicate
const mergedCodingTools = [...existingCodingTools];
newCodingTools.forEach(newTool => {
  const existingIndex = mergedCodingTools.findIndex(t => t.id === newTool.id);
  if (existingIndex >= 0) {
    mergedCodingTools[existingIndex] = newTool;
  } else {
    mergedCodingTools.push(newTool);
  }
});

// Update AI models and APIs
const existingAiModels = readExistingFile(aiModelsPath);
const newAiModels = categorizedTools.ai_tools;
const mergedAiModels = [...existingAiModels];
newAiModels.forEach(newTool => {
  const existingIndex = mergedAiModels.findIndex(t => t.id === newTool.id);
  if (existingIndex >= 0) {
    mergedAiModels[existingIndex] = newTool;
  } else {
    mergedAiModels.push(newTool);
  }
});

// Update deployment platforms
const existingDeployment = readExistingFile(deploymentPath);
const newDeployment = [...categorizedTools.deployment, ...categorizedTools.cloud];
const mergedDeployment = [...existingDeployment];
newDeployment.forEach(newTool => {
  const existingIndex = mergedDeployment.findIndex(t => t.id === newTool.id);
  if (existingIndex >= 0) {
    mergedDeployment[existingIndex] = newTool;
  } else {
    mergedDeployment.push(newTool);
  }
});

// Update databases
const existingDatabases = readExistingFile(databasesPath);
const newDatabases = categorizedTools.database;
const mergedDatabases = [...existingDatabases];
newDatabases.forEach(newTool => {
  const existingIndex = mergedDatabases.findIndex(t => t.id === newTool.id);
  if (existingIndex >= 0) {
    mergedDatabases[existingIndex] = newTool;
  } else {
    mergedDatabases.push(newTool);
  }
});

// Write files
fs.writeFileSync(codingToolsPath, JSON.stringify(mergedCodingTools, null, 2));
fs.writeFileSync(aiModelsPath, JSON.stringify(mergedAiModels, null, 2));
fs.writeFileSync(deploymentPath, JSON.stringify(mergedDeployment, null, 2));
fs.writeFileSync(databasesPath, JSON.stringify(mergedDatabases, null, 2));

console.log('✅ Database files updated successfully!');
console.log(`📊 Updated ${mergedCodingTools.length} coding tools`);
console.log(`🤖 Updated ${mergedAiModels.length} AI models and APIs`);
console.log(`🚀 Updated ${mergedDeployment.length} deployment platforms`);
console.log(`💾 Updated ${mergedDatabases.length} databases`);
