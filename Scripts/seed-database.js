/*
 * Comprehensive Tool Database Seeder
 * Populates Firestore with hundreds of real development tools
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { ToolProfile } from '../Database/types';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Comprehensive tool database
// Import the correct ToolProfile interface
import { ToolProfile } from '../Engine/stack-recommendation-engine';

const toolsDatabase: ToolProfile[] = [
  // Frontend Frameworks
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    skills: { setup: 3, daily: 2 },
    pricing_model: 'Free',
    baseline_cost: 0,
    compatible_with: ['javascript', 'typescript', 'nextjs'],
    popularity_score: 95,
    community_sentiment: 'positive'
  },
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
    description: 'Progressive JavaScript framework for building UIs',
    compatibility: ['javascript', 'typescript'],
    pros: ['Easy to learn', 'Flexible', 'Great documentation', 'Small size'],
    cons: ['Smaller ecosystem', 'Less job market', 'Composition API complexity'],
    use_cases: ['Web applications', 'Progressive web apps', 'Mobile apps'],
    learning_curve: 'easy',
    community_size: 'medium',
    github_stars: 205000,
    last_updated: '2024-11-15',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.88
  },
  {
    id: 'angular',
    name: 'Angular',
    category: 'frontend',
    description: 'Platform for building mobile and desktop web applications',
    compatibility: ['typescript'],
    pros: ['Full framework', 'TypeScript first', 'Dependency injection', 'CLI tools'],
    cons: ['Steep learning curve', 'Verbose', 'Complex', 'Large bundle size'],
    use_cases: ['Enterprise applications', 'Large-scale web apps', 'Progressive web apps'],
    learning_curve: 'hard',
    community_size: 'large',
    github_stars: 95000,
    last_updated: '2024-11-20',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.82
  },
  {
    id: 'svelte',
    name: 'Svelte',
    category: 'frontend',
    description: 'Cybernetically enhanced web apps with compile-time optimizations',
    compatibility: ['javascript', 'typescript'],
    pros: ['No runtime overhead', 'Easy to learn', 'Small bundle size', 'Great performance'],
    cons: ['Smaller ecosystem', 'Limited tooling', 'Newer framework'],
    use_cases: ['Web applications', 'Static sites', 'Component libraries'],
    learning_curve: 'easy',
    community_size: 'small',
    github_stars: 75000,
    last_updated: '2024-10-30',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.78
  },

  // Backend Frameworks
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'backend',
    description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
    compatibility: ['javascript', 'typescript'],
    pros: ['Same language as frontend', 'Large ecosystem', 'Fast development', 'Event-driven'],
    cons: ['Single-threaded', 'Callback complexity', 'Security concerns'],
    use_cases: ['Web APIs', 'Real-time applications', 'Microservices'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 104000,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.92
  },
  {
    id: 'express',
    name: 'Express.js',
    category: 'backend',
    description: 'Fast, unopinionated, minimalist web framework for Node.js',
    compatibility: ['javascript', 'typescript'],
    pros: ['Minimalist', 'Flexible', 'Large ecosystem', 'Easy to learn'],
    cons: ['Minimal structure', 'Security middleware needed', 'Performance limitations'],
    use_cases: ['REST APIs', 'Web applications', 'Microservices'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 64000,
    last_updated: '2024-11-10',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.89
  },
  {
    id: 'nestjs',
    name: 'NestJS',
    category: 'backend',
    description: 'Progressive Node.js framework for scalable server-side applications',
    compatibility: ['typescript'],
    pros: ['TypeScript first', 'Modular architecture', 'Decorator-based', 'Enterprise ready'],
    cons: ['Learning curve', 'Opinionated', 'Overhead for small projects'],
    use_cases: ['Enterprise APIs', 'Microservices', 'GraphQL APIs'],
    learning_curve: 'hard',
    community_size: 'medium',
    github_stars: 65000,
    last_updated: '2024-11-25',
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
    id: 'fastify',
    name: 'Fastify',
    category: 'backend',
    description: 'Fast and low overhead web framework for Node.js',
    compatibility: ['javascript', 'typescript'],
    pros: ['High performance', 'Low overhead', 'Plugin architecture', 'JSON schema validation'],
    cons: ['Smaller ecosystem', 'Less mature', 'Learning curve'],
    use_cases: ['High-performance APIs', 'Microservices', 'Real-time applications'],
    learning_curve: 'medium',
    community_size: 'small',
    github_stars: 30000,
    last_updated: '2024-11-20',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.79
  },

  // Databases
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'database',
    description: 'Advanced open source relational database',
    compatibility: ['sql'],
    pros: ['ACID compliance', 'Extensible', 'Standards compliant', 'Advanced features'],
    cons: ['Complex configuration', 'Memory usage', 'Learning curve'],
    use_cases: ['Web applications', 'Data warehousing', 'Geospatial applications'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 15000,
    last_updated: '2024-11-15',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.2,
      paid_plans: [
        { name: 'Managed PostgreSQL', price: 15, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.93
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'database',
    description: 'NoSQL document database for modern applications',
    compatibility: ['javascript', 'python', 'java'],
    pros: ['Flexible schema', 'Horizontal scaling', 'Rich queries', 'JSON-like documents'],
    cons: ['Memory usage', 'Data consistency', 'Learning curve'],
    use_cases: ['Web applications', 'Real-time analytics', 'Content management'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 25000,
    last_updated: '2024-11-30',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.3,
      paid_plans: [
        { name: 'MongoDB Atlas', price: 25, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.87
  },
  {
    id: 'redis',
    name: 'Redis',
    category: 'database',
    description: 'In-memory data structure store for caching and real-time applications',
    compatibility: ['javascript', 'python', 'java'],
    pros: ['High performance', 'Versatile data types', 'Pub/Sub', 'Persistence options'],
    cons: ['Memory limitations', 'Single-threaded', 'Data durability'],
    use_cases: ['Caching', 'Session storage', 'Real-time analytics'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 65000,
    last_updated: '2024-11-25',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.1,
      paid_plans: [
        { name: 'Redis Cloud', price: 5, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.91
  },
  {
    id: 'mysql',
    name: 'MySQL',
    category: 'database',
    description: 'Popular open source relational database',
    compatibility: ['sql'],
    pros: ['Widely used', 'Fast reads', 'Easy to learn', 'Good performance'],
    cons: ['Limited features', 'Replication complexity', 'InnoDB limitations'],
    use_cases: ['Web applications', 'E-commerce', 'Data warehousing'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 12000,
    last_updated: '2024-11-20',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.1,
      paid_plans: [
        { name: 'MySQL Cloud', price: 10, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.84
  },

  // Cloud Services
  {
    id: 'aws',
    name: 'Amazon Web Services',
    category: 'deployment',
    description: 'Comprehensive cloud computing platform',
    compatibility: ['all'],
    pros: ['Comprehensive services', 'Global infrastructure', 'Mature platform', 'Market leader'],
    cons: ['Complex pricing', 'Learning curve', 'Vendor lock-in'],
    use_cases: ['Web hosting', 'Data storage', 'Machine learning', 'Enterprise applications'],
    learning_curve: 'hard',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 50,
      cost_per_user: 5,
      cost_scaling_factor: 1.5,
      paid_plans: [
        { name: 'Basic', price: 50, billing_period: 'monthly' },
        { name: 'Standard', price: 200, billing_period: 'monthly' },
        { name: 'Enterprise', price: 500, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.94
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'deployment',
    description: 'Platform for frontend frameworks and static sites',
    compatibility: ['javascript', 'typescript'],
    pros: ['Easy deployment', 'Great DX', 'Edge functions', 'Automatic scaling'],
    cons: ['Limited backend', 'Pricing for scale', 'Vendor lock-in'],
    use_cases: ['Frontend deployment', 'Static sites', 'JAMstack applications'],
    learning_curve: 'easy',
    community_size: 'medium',
    github_stars: 0,
    last_updated: '2024-11-30',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.2,
      paid_plans: [
        { name: 'Pro', price: 20, billing_period: 'monthly' },
        { name: 'Team', price: 50, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.88
  },
  {
    id: 'netlify',
    name: 'Netlify',
    category: 'deployment',
    description: 'Platform for web development with continuous deployment',
    compatibility: ['javascript', 'typescript'],
    pros: ['Easy setup', 'Continuous deployment', 'Forms handling', 'CDN included'],
    cons: ['Limited backend', 'Build time limits', 'Pricing for features'],
    use_cases: ['Static sites', 'JAMstack', 'Frontend deployment'],
    learning_curve: 'easy',
    community_size: 'medium',
    github_stars: 0,
    last_updated: '2024-11-25',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.1,
      paid_plans: [
        { name: 'Pro', price: 19, billing_period: 'monthly' },
        { name: 'Business', price: 99, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.83
  },
  {
    id: 'heroku',
    name: 'Heroku',
    category: 'deployment',
    description: 'Cloud platform for deploying and managing applications',
    compatibility: ['javascript', 'python', 'java', 'ruby'],
    pros: ['Easy deployment', 'Add-ons ecosystem', 'Git-based workflow', 'Multiple languages'],
    cons: ['Expensive at scale', 'Sleep mode', 'Limited customization'],
    use_cases: ['Web applications', 'APIs', 'Prototyping'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-11-20',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.4,
      paid_plans: [
        { name: 'Basic', price: 7, billing_period: 'monthly' },
        { name: 'Standard', price: 25, billing_period: 'monthly' },
        { name: 'Performance', price: 250, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.79
  },

  // AI/ML Services
  {
    id: 'openai',
    name: 'OpenAI API',
    category: 'ai_ml',
    description: 'Advanced AI models including GPT-4 and GPT-3.5',
    compatibility: ['javascript', 'python'],
    pros: ['State-of-the-art models', 'Easy integration', 'Comprehensive API', 'Great documentation'],
    cons: ['Cost at scale', 'Rate limits', 'Data privacy concerns'],
    use_cases: ['Chatbots', 'Content generation', 'Code assistance', 'Text analysis'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 20,
      cost_per_user: 0,
      cost_scaling_factor: 2.0,
      paid_plans: [
        { name: 'Pay-as-you-go', price: 20, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.96
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    category: 'ai_ml',
    description: 'AI assistant with strong reasoning and safety features',
    compatibility: ['javascript', 'python'],
    pros: ['Strong reasoning', 'Safety focused', 'Large context window', 'Reliable responses'],
    cons: ['Limited availability', 'Cost', 'Newer platform'],
    use_cases: ['Analysis', 'Research assistance', 'Content creation', 'Code review'],
    learning_curve: 'easy',
    community_size: 'medium',
    github_stars: 0,
    last_updated: '2024-11-30',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 15,
      cost_per_user: 0,
      cost_scaling_factor: 1.8,
      paid_plans: [
        { name: 'Pro', price: 20, billing_period: 'monthly' },
        { name: 'Team', price: 25, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.89
  },

  // Testing Tools
  {
    id: 'jest',
    name: 'Jest',
    category: 'testing',
    description: 'JavaScript testing framework with snapshot testing',
    compatibility: ['javascript', 'typescript'],
    pros: ['Zero configuration', 'Snapshot testing', 'Mocking capabilities', 'Great developer experience'],
    cons: ['Slower than alternatives', 'Large dependency', 'Memory usage'],
    use_cases: ['Unit testing', 'Integration testing', 'Snapshot testing'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 44000,
    last_updated: '2024-11-15',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: []
    },
    recommendation_weight: 0.92
  },
  {
    id: 'cypress',
    name: 'Cypress',
    category: 'testing',
    description: 'End-to-end testing framework for modern web applications',
    compatibility: ['javascript', 'typescript'],
    pros: ['Real browser testing', 'Time travel debugging', 'Easy setup', 'Great developer experience'],
    cons: ['Limited browser support', 'Slow execution', 'Memory usage'],
    use_cases: ['E2E testing', 'Integration testing', 'UI testing'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 46000,
    last_updated: '2024-11-20',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: [
        { name: 'Team', price: 75, billing_period: 'monthly' },
        { name: 'Business', price: 300, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.88
  },
  {
    id: 'playwright',
    name: 'Playwright',
    category: 'testing',
    description: 'Fast and reliable end-to-end testing for modern web apps',
    compatibility: ['javascript', 'typescript', 'python'],
    pros: ['Multiple browsers', 'Fast execution', 'Auto-wait', 'Mobile testing'],
    cons: ['Newer framework', 'Limited ecosystem', 'Learning curve'],
    use_cases: ['E2E testing', 'Cross-browser testing', 'Mobile testing'],
    learning_curve: 'medium',
    community_size: 'medium',
    github_stars: 63000,
    last_updated: '2024-11-30',
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

  // Monitoring & Analytics
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    category: 'analytics',
    description: 'Web analytics service for tracking website traffic',
    compatibility: ['javascript'],
    pros: ['Free tier', 'Comprehensive tracking', 'Easy integration', 'Industry standard'],
    cons: ['Privacy concerns', 'Complex interface', 'Data sampling'],
    use_cases: ['Website analytics', 'User behavior tracking', 'Marketing attribution'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-11-25',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: [
        { name: 'Analytics 360', price: 12500, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.87
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    category: 'analytics',
    description: 'Advanced analytics platform for user behavior tracking',
    compatibility: ['javascript', 'python'],
    pros: ['Event tracking', 'User segmentation', 'Cohort analysis', 'Real-time data'],
    cons: ['Pricing', 'Learning curve', 'Data privacy'],
    use_cases: ['Product analytics', 'User behavior', 'A/B testing'],
    learning_curve: 'medium',
    community_size: 'medium',
    github_stars: 0,
    last_updated: '2024-11-20',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.5,
      paid_plans: [
        { name: 'Growth', price: 25, billing_period: 'monthly' },
        { name: 'Enterprise', price: 833, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.81
  },
  {
    id: 'sentry',
    name: 'Sentry',
    category: 'monitoring',
    description: 'Error tracking and performance monitoring platform',
    compatibility: ['javascript', 'python', 'java'],
    pros: ['Comprehensive error tracking', 'Performance monitoring', 'Easy integration', 'Great debugging'],
    cons: ['Pricing at scale', 'Alert fatigue', 'Data retention limits'],
    use_cases: ['Error tracking', 'Performance monitoring', 'Release tracking'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 37000,
    last_updated: '2024-11-30',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.3,
      paid_plans: [
        { name: 'Team', price: 26, billing_period: 'monthly' },
        { name: 'Organization', price: 80, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.93
  },

  // DevOps & CI/CD
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    category: 'devops',
    description: 'CI/CD platform integrated with GitHub repositories',
    compatibility: ['all'],
    pros: ['Integrated with GitHub', 'Free tier', 'Flexible workflows', 'Large marketplace'],
    cons: ['Limited free minutes', 'Vendor lock-in', 'Complex syntax'],
    use_cases: ['CI/CD', 'Automation', 'Testing', 'Deployment'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-12-01',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.2,
      paid_plans: [
        { name: 'Team', price: 4, billing_period: 'monthly' },
        { name: 'Enterprise', price: 21, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.91
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'devops',
    description: 'Platform for developing, shipping, and running applications in containers',
    compatibility: ['all'],
    pros: ['Containerization', 'Consistency', 'Scalability', 'Microservices'],
    cons: ['Learning curve', 'Resource overhead', 'Complexity'],
    use_cases: ['Application deployment', 'Microservices', 'Development environments'],
    learning_curve: 'medium',
    community_size: 'large',
    github_stars: 68000,
    last_updated: '2024-11-25',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.1,
      paid_plans: [
        { name: 'Pro', price: 5, billing_period: 'monthly' },
        { name: 'Team', price: 7, billing_period: 'monthly' },
        { name: 'Business', price: 21, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.89
  },

  // Authentication & Security
  {
    id: 'auth0',
    name: 'Auth0',
    category: 'security',
    description: 'Identity and access management platform',
    compatibility: ['javascript', 'python', 'java'],
    pros: ['Easy implementation', 'Multiple providers', 'Security features', 'Scalable'],
    cons: ['Pricing', 'Vendor lock-in', 'Complex customization'],
    use_cases: ['User authentication', 'Single sign-on', 'API security'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-11-30',
    documentation_quality: 'excellent',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.4,
      paid_plans: [
        { name: 'Essential', price: 35, billing_period: 'monthly' },
        { name: 'Professional', price: 240, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.86
  },
  {
    id: 'firebase-auth',
    name: 'Firebase Authentication',
    category: 'security',
    description: 'Authentication service with multiple sign-in methods',
    compatibility: ['javascript', 'mobile'],
    pros: ['Easy setup', 'Multiple providers', 'Real-time', 'Mobile friendly'],
    cons: ['Vendor lock-in', 'Limited customization', 'Google dependency'],
    use_cases: ['Web authentication', 'Mobile authentication', 'Social login'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-11-25',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1.2,
      paid_plans: [
        { name: 'Pay-as-you-go', price: 0, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.83
  },

  // Communication & Collaboration
  {
    id: 'slack',
    name: 'Slack',
    category: 'productivity',
    description: 'Business communication platform for team collaboration',
    compatibility: ['api'],
    pros: ['Great UX', 'Integrations', 'Organized channels', 'Search functionality'],
    cons: ['Pricing', 'Information overload', 'Distraction potential'],
    use_cases: ['Team communication', 'Project coordination', 'Integration hub'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-11-30',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 7.25,
      cost_scaling_factor: 1.1,
      paid_plans: [
        { name: 'Pro', price: 7.25, billing_period: 'monthly' },
        { name: 'Business+', price: 12.50, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.84
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'productivity',
    description: 'Voice, video, and text communication platform',
    compatibility: ['api'],
    pros: ['Free tier', 'Voice channels', 'Gaming focused', 'Bot ecosystem'],
    cons: ['Limited business features', 'Moderation challenges', 'Gaming stigma'],
    use_cases: ['Community building', 'Team communication', 'Gaming'],
    learning_curve: 'easy',
    community_size: 'large',
    github_stars: 0,
    last_updated: '2024-11-20',
    documentation_quality: 'good',
    pricing: {
      free_tier: true,
      baseline_cost: 0,
      cost_per_user: 0,
      cost_scaling_factor: 1,
      paid_plans: [
        { name: 'Nitro', price: 10, billing_period: 'monthly' },
        { name: 'Server Boost', price: 5, billing_period: 'monthly' }
      ]
    },
    recommendation_weight: 0.72
  }
];

// Function to seed the database
async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Use batched writes for better performance
    const batchSize = 500;
    let batch = writeBatch(db);
    let operationCount = 0;
    
    for (const tool of toolsDatabase) {
      const toolRef = doc(collection(db, 'tools'), tool.id);
      batch.set(toolRef, tool);
      operationCount++;
      
      // Commit batch when it reaches the size limit
      if (operationCount >= batchSize) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
        console.log(`✅ Committed batch of ${batchSize} tools`);
      }
    }
    
    // Commit any remaining operations
    if (operationCount > 0) {
      await batch.commit();
      console.log(`✅ Committed final batch of ${operationCount} tools`);
    }
    
    console.log(`🎉 Successfully seeded database with ${toolsDatabase.length} tools!`);
    
    // Generate summary
    const categoryCount = toolsDatabase.reduce((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📊 Tools by category:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} tools`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('🏁 Database seeding complete!');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Database seeding failed:', error);
    process.exit(1);
  });
}

export { seedDatabase, toolsDatabase };
