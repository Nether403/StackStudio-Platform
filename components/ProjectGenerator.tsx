// Enhanced Project Generator Component
// Advanced project creation with saving and AI integration

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StackRecommendationEngine } from '../Engine/stack-recommendation-engine';
import { mlPersonalizationEngine } from '../Engine/ml-personalization-engine';
import { useAnalytics } from '../hooks/useAnalytics';

// Helper functions for project analysis
const analyzeComplexity = (description: string): 'simple' | 'medium' | 'complex' => {
  const complexityKeywords = [
    'real-time', 'ai', 'ml', 'machine learning', 'analytics', 'payment',
    'multi-tenant', 'microservices', 'scale', 'enterprise', 'blockchain',
    'live streaming', 'video processing', 'recommendation engine'
  ];
  
  const lowerDescription = description.toLowerCase();
  const matches = complexityKeywords.filter(keyword => 
    lowerDescription.includes(keyword)
  ).length;
  
  if (matches > 3) return 'complex';
  if (matches > 1) return 'medium';
  return 'simple';
};

const extractFeatures = (description: string): string[] => {
  const features: string[] = [];
  const lowerDescription = description.toLowerCase();
  
  const featureMap = {
    'authentication': ['auth', 'login', 'user', 'account', 'register'],
    'real-time': ['real-time', 'live', 'chat', 'messaging', 'notifications'],
    'payment': ['payment', 'billing', 'subscription', 'checkout', 'stripe'],
    'search': ['search', 'filter', 'find', 'query'],
    'analytics': ['analytics', 'dashboard', 'metrics', 'tracking', 'stats'],
    'media': ['image', 'video', 'photo', 'upload', 'file'],
    'social': ['social', 'share', 'like', 'comment', 'follow'],
    'location': ['location', 'map', 'gps', 'address', 'geo']
  };
  
  Object.entries(featureMap).forEach(([feature, keywords]) => {
    if (keywords.some(keyword => lowerDescription.includes(keyword))) {
      features.push(feature);
    }
  });
  
  return features;
};

const determineScalingNeeds = (description: string, timeline: string): 'low' | 'medium' | 'high' => {
  const scalingKeywords = ['scale', 'thousands', 'millions', 'enterprise', 'global'];
  const lowerDescription = description.toLowerCase();
  
  const hasScalingKeywords = scalingKeywords.some(keyword => 
    lowerDescription.includes(keyword)
  );
  
  if (hasScalingKeywords) return 'high';
  if (timeline === 'long-term' || timeline === '3-6-months') return 'medium';
  return 'low';
};

const checkRealTimeNeeds = (description: string): boolean => {
  const realTimeKeywords = ['real-time', 'live', 'chat', 'messaging', 'notifications', 'websocket'];
  return realTimeKeywords.some(keyword => 
    description.toLowerCase().includes(keyword)
  );
};

const checkAuthNeeds = (description: string): boolean => {
  const authKeywords = ['auth', 'login', 'user', 'account', 'register', 'sign up', 'profile'];
  return authKeywords.some(keyword => 
    description.toLowerCase().includes(keyword)
  );
};

const determineDatabaseNeeds = (description: string): 'simple' | 'relational' | 'nosql' | 'vector' => {
  const lowerDescription = description.toLowerCase();
  
  if (lowerDescription.includes('ai') || lowerDescription.includes('ml') || 
      lowerDescription.includes('recommendation') || lowerDescription.includes('embedding')) {
    return 'vector';
  }
  
  if (lowerDescription.includes('complex') || lowerDescription.includes('relational') ||
      lowerDescription.includes('transaction') || lowerDescription.includes('sql')) {
    return 'relational';
  }
  
  if (lowerDescription.includes('flexible') || lowerDescription.includes('nosql') ||
      lowerDescription.includes('document') || lowerDescription.includes('json')) {
    return 'nosql';
  }
  
  return 'simple';
};

const checkAIMLNeeds = (description: string): boolean => {
  const aiKeywords = ['ai', 'ml', 'machine learning', 'recommendation', 'nlp', 'computer vision', 'prediction'];
  return aiKeywords.some(keyword => 
    description.toLowerCase().includes(keyword)
  );
};

const calculateAverageCompatibility = (stack: Array<{ compatibilityScore: number }>): number => {
  if (stack.length === 0) return 0;
  const sum = stack.reduce((acc, item) => acc + item.compatibilityScore, 0);
  return Math.round(sum / stack.length);
};

const generatePhases = (recommendation: any): Array<{
  title: string;
  description: string;
  tasks: string[];
  estimatedTime: string;
}> => {
  return [
    {
      title: 'Setup & Planning',
      description: 'Initialize project and set up development environment',
      tasks: [
        'Set up development environment',
        'Initialize project structure',
        'Configure version control',
        'Plan project architecture'
      ],
      estimatedTime: '1-2 days'
    },
    {
      title: 'Core Development',
      description: 'Build main features and functionality',
      tasks: [
        'Implement core features',
        'Set up database schema',
        'Build API endpoints',
        'Create user interface'
      ],
      estimatedTime: '1-3 weeks'
    },
    {
      title: 'Testing & Deployment',
      description: 'Test application and deploy to production',
      tasks: [
        'Write unit tests',
        'Perform integration testing',
        'Set up deployment pipeline',
        'Deploy to production'
      ],
      estimatedTime: '3-5 days'
    }
  ];
};

const generatePrompts = (recommendation: any): Array<{
  phase: string;
  task: string;
  prompt: string;
}> => {
  return [
    {
      phase: 'Setup',
      task: 'Project Structure',
      prompt: 'Help me set up a project structure for ' + recommendation.summary
    },
    {
      phase: 'Development',
      task: 'Implementation',
      prompt: 'Guide me through implementing the core features for ' + recommendation.summary
    },
    {
      phase: 'Testing',
      task: 'Testing Strategy',
      prompt: 'Create a comprehensive testing strategy for ' + recommendation.summary
    }
  ];
};

// Load tool profiles data
const loadToolProfiles = async () => {
  try {
    const response = await fetch('/Database/coding_tools.json');
    const codingTools = await response.json();
    return codingTools;
  } catch (error) {
    console.error('Error loading tool profiles:', error);
    return [];
  }
};

interface ProjectIdea {
  description: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferences: {
    frontend?: string;
    backend?: string;
    database?: string;
    hosting?: string;
  };
  projectType: 'web-app' | 'mobile-app' | 'desktop-app' | 'api' | 'other';
  timeline: '1-week' | '2-4-weeks' | '1-3-months' | '3-6-months' | 'long-term';
}

interface GeneratedBlueprint {
  summary: string;
  recommendedStack: Array<{
    name: string;
    category: string;
    reason: string;
  }>;
  compatibilityScore: number;
  phases: Array<{
    title: string;
    description: string;
    tasks: string[];
    estimatedTime: string;
  }>;
  prompts: Array<{
    phase: string;
    task: string;
    prompt: string;
  }>;
  // ML Personalization fields
  personalizedScore?: number;
  confidence?: number;
  mlReasoning?: string[];
  alternatives?: Array<{
    stack: string[];
    confidence: number;
    reasoning: string;
  }>;
}

const ProjectGenerator: React.FC = () => {
  const { user } = useAuth();
  const { trackRecommendationViewed, trackProjectGenerated, trackBlueprintSaved, trackToolSelected } = useAnalytics();
  const [projectIdea, setProjectIdea] = useState<ProjectIdea>({
    description: '',
    skillLevel: 'intermediate',
    preferences: {},
    projectType: 'web-app',
    timeline: '2-4-weeks'
  });
  const [blueprint, setBlueprint] = useState<GeneratedBlueprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState('');

  const generateBlueprint = async () => {
    if (!projectIdea.description.trim()) {
      alert('Please describe your project idea');
      return;
    }

    setLoading(true);
    try {
      // Load tool profiles
      const toolProfiles = await loadToolProfiles();
      
      // Initialize the recommendation engine
      const engine = new StackRecommendationEngine(toolProfiles);
      
      // Create skill level for engine
      const skillLevel = {
        setup: projectIdea.skillLevel === 'beginner' ? 3 : projectIdea.skillLevel === 'intermediate' ? 6 : 9,
        daily: projectIdea.skillLevel === 'beginner' ? 4 : projectIdea.skillLevel === 'intermediate' ? 7 : 10
      };

      // Generate recommendation using the engine
      const recommendation = engine.generateRecommendation(
        projectIdea.description,
        skillLevel,
        []
      );
      
      // 🧠 ML PERSONALIZATION: Get personalized recommendations
      let finalRecommendation = recommendation;
      if (user) {
        // Learn from user behavior
        mlPersonalizationEngine.learnFromUserBehavior(user.uid, 'project_generated', {
          projectType: projectIdea.projectType,
          description: projectIdea.description,
          skillLevel: projectIdea.skillLevel,
          preferences: projectIdea.preferences,
          timeline: projectIdea.timeline
        });
        
        // Get personalized recommendations
        const personalizedRecommendations = mlPersonalizationEngine.generatePersonalizedRecommendations(
          user.uid,
          {
            type: projectIdea.projectType,
            description: projectIdea.description,
            skillLevel: projectIdea.skillLevel,
            preferences: projectIdea.preferences,
            timeline: projectIdea.timeline
          }
        );
        
        // If we have personalized recommendations, use the best one
        if (personalizedRecommendations.length > 0) {
          const bestPersonalized = personalizedRecommendations[0];
          finalRecommendation = {
            ...recommendation,
            recommendedStack: bestPersonalized.stack.map(tech => ({
              name: tech,
              category: 'personalized',
              reason: bestPersonalized.reasoning.join(', '),
              compatibilityScore: Math.round(bestPersonalized.personalizedScore * 100)
            }))
          };
          
          // Store ML data separately for the blueprint
          (finalRecommendation as any).personalizedScore = bestPersonalized.personalizedScore;
          (finalRecommendation as any).confidence = bestPersonalized.confidence;
          (finalRecommendation as any).mlReasoning = bestPersonalized.reasoning;
          (finalRecommendation as any).alternatives = bestPersonalized.alternatives;
        }
      }
      
      // Convert to our existing blueprint format
      const generatedBlueprint: GeneratedBlueprint = {
        summary: finalRecommendation.summary,
        recommendedStack: finalRecommendation.recommendedStack,
        compatibilityScore: calculateAverageCompatibility(finalRecommendation.recommendedStack),
        phases: generatePhases(finalRecommendation),
        prompts: generatePrompts(finalRecommendation),
        // Add ML insights
        ...((finalRecommendation as any).personalizedScore && {
          personalizedScore: Math.round((finalRecommendation as any).personalizedScore * 100),
          confidence: Math.round((finalRecommendation as any).confidence * 100),
          mlReasoning: (finalRecommendation as any).mlReasoning,
          alternatives: (finalRecommendation as any).alternatives
        })
      };

      setBlueprint(generatedBlueprint);
      setProjectName(extractProjectName(projectIdea.description));
      
      // 🔥 TRACK USER BEHAVIOR
      trackRecommendationViewed(projectIdea.projectType, finalRecommendation.recommendedStack);
      trackProjectGenerated(
        projectIdea.projectType, 
        finalRecommendation.recommendedStack.length, 
        calculateAverageCompatibility(finalRecommendation.recommendedStack)
      );
    } catch (error) {
      console.error('Error generating blueprint:', error);
      alert('Failed to generate blueprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractProjectName = (description: string): string => {
    const words = description.split(' ').slice(0, 3);
    return words.join(' ').replace(/[^a-zA-Z0-9 ]/g, '');
  };

  const saveProject = async () => {
    if (!user || !blueprint) return;

    setSaving(true);
    try {
      const projectData = {
        userId: user.uid,
        name: projectName || 'Untitled Project',
        description: projectIdea.description,
        skillLevel: projectIdea.skillLevel,
        preferences: projectIdea.preferences,
        projectType: projectIdea.projectType,
        timeline: projectIdea.timeline,
        blueprint: blueprint,
        stack: blueprint.recommendedStack.map(item => item.name),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'user_projects'), projectData);
      
      // 🔥 TRACK BLUEPRINT SAVE
      trackBlueprintSaved(projectIdea.projectType, blueprint.recommendedStack.map(item => item.name));
      
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Generator</h1>
        <p className="text-gray-600">
          Describe your project idea and get a complete tech stack recommendation and roadmap
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="space-y-6">
          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              value={projectIdea.description}
              onChange={(e) => setProjectIdea({...projectIdea, description: e.target.value})}
              placeholder="Describe your project idea in detail... (e.g., 'A social media platform for pet owners with photo sharing, vet appointment booking, and community features')"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>

          {/* Skill Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Skill Level
            </label>
            <select
              value={projectIdea.skillLevel}
              onChange={(e) => setProjectIdea({...projectIdea, skillLevel: e.target.value as ProjectIdea['skillLevel']})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select your skill level"
            >
              <option value="beginner">Beginner - New to development</option>
              <option value="intermediate">Intermediate - Some experience</option>
              <option value="advanced">Advanced - Experienced developer</option>
            </select>
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Type
            </label>
            <select
              value={projectIdea.projectType}
              onChange={(e) => setProjectIdea({...projectIdea, projectType: e.target.value as ProjectIdea['projectType']})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select project type"
            >
              <option value="web-app">Web Application</option>
              <option value="mobile-app">Mobile App</option>
              <option value="desktop-app">Desktop Application</option>
              <option value="api">API/Backend Service</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Timeline
            </label>
            <select
              value={projectIdea.timeline}
              onChange={(e) => setProjectIdea({...projectIdea, timeline: e.target.value as ProjectIdea['timeline']})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select expected timeline"
            >
              <option value="1-week">1 Week (MVP/Prototype)</option>
              <option value="2-4-weeks">2-4 Weeks (Basic Features)</option>
              <option value="1-3-months">1-3 Months (Full Features)</option>
              <option value="3-6-months">3-6 Months (Complex Project)</option>
              <option value="long-term">Long-term (6+ Months)</option>
            </select>
          </div>

          {/* Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technology Preferences (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Frontend</label>
                <input
                  type="text"
                  value={projectIdea.preferences.frontend || ''}
                  onChange={(e) => setProjectIdea({
                    ...projectIdea,
                    preferences: {...projectIdea.preferences, frontend: e.target.value}
                  })}
                  placeholder="e.g., React, Vue, Angular"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Backend</label>
                <input
                  type="text"
                  value={projectIdea.preferences.backend || ''}
                  onChange={(e) => setProjectIdea({
                    ...projectIdea,
                    preferences: {...projectIdea.preferences, backend: e.target.value}
                  })}
                  placeholder="e.g., Node.js, Python, Java"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="space-y-2">
            <button
              onClick={generateBlueprint}
              disabled={loading || !projectIdea.description.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing with AI Engine...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Generate AI-Powered Blueprint
                </div>
              )}
            </button>
            <div className="text-xs text-gray-500 text-center">
              ✨ Enhanced with advanced recommendation engine • Compatibility scoring • Cost analysis
            </div>
          </div>
        </div>
      </div>

      {/* Blueprint Results */}
      {blueprint && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Project Blueprint</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Compatibility Score:</span>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                {blueprint.compatibilityScore}%
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
            <p className="text-gray-600">{blueprint.summary}</p>
          </div>

          {/* Recommended Stack */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Tech Stack</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {blueprint.recommendedStack.map((tech, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{tech.name}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {tech.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{tech.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Project Phases */}
          {blueprint.phases && blueprint.phases.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Phases</h3>
              <div className="space-y-4">
                {blueprint.phases.map((phase, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{phase.title}</h4>
                      <span className="text-xs text-gray-500">{phase.estimatedTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {phase.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Project */}
          {user && (
            <div className="border-t pt-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter a name for your project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={saveProject}
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectGenerator;
