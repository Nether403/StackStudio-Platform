import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mlPersonalizationEngine } from '../Engine/ml-personalization-engine';

interface PersonalizationDashboardProps {
  className?: string;
}

interface UserInsights {
  totalProjects: number;
  favoriteStacks: number;
  successfulDeployments: number;
  averageSessionDuration: number;
  mostUsedFeatures: string[];
  preferredComplexity: string;
  topDomains: string[];
}

const PersonalizationDashboard: React.FC<PersonalizationDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    complexity: 'intermediate',
    domains: [] as string[],
    technologies: [] as string[],
    budget: 'medium',
    timeframe: 'medium'
  });

  useEffect(() => {
    loadUserInsights();
  }, [user]);

  const loadUserInsights = async () => {
    if (!user) return;

    try {
      const userInsights = mlPersonalizationEngine.getUserInsights(user.uid);
      setInsights(userInsights);
    } catch (error) {
      console.error('Error loading user insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<typeof preferences>) => {
    if (!user) return;

    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    // Learn from preference changes
    mlPersonalizationEngine.learnFromUserBehavior(user.uid, 'preferences_updated', {
      preferences: updatedPreferences,
      timestamp: new Date()
    });
  };

  const generatePersonalizedRecommendations = async () => {
    if (!user) return;

    try {
      const recommendations = mlPersonalizationEngine.generatePersonalizedRecommendations(
        user.uid,
        {
          type: 'web-app',
          description: 'Based on your preferences and history',
          skillLevel: preferences.complexity,
          preferences: preferences,
          timeline: preferences.timeframe
        }
      );

      console.log('Personalized recommendations:', recommendations);
      // You could display these in a modal or navigate to a new page
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const domains = [
    'Web Development', 'Mobile Apps', 'Data Science', 'Machine Learning', 
    'DevOps', 'Game Development', 'Blockchain', 'IoT', 'Desktop Apps'
  ];

  const technologies = [
    'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'TypeScript',
    'Next.js', 'Nuxt.js', 'Express', 'Django', 'PostgreSQL', 'MongoDB',
    'Docker', 'AWS', 'Firebase', 'GraphQL', 'Tailwind CSS'
  ];

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🧠 AI Personalization</h1>
        <p className="text-gray-600">Customize your experience with machine learning-powered recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Insights */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Your Insights</h2>
            
            {insights ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Projects Created</span>
                  <span className="font-semibold text-blue-600">{insights.totalProjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Favorite Stacks</span>
                  <span className="font-semibold text-green-600">{insights.favoriteStacks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Successful Deployments</span>
                  <span className="font-semibold text-purple-600">{insights.successfulDeployments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg. Session (min)</span>
                  <span className="font-semibold text-orange-600">{Math.round(insights.averageSessionDuration / 60)}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">Preferred Complexity</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    insights.preferredComplexity === 'beginner' ? 'bg-green-100 text-green-700' :
                    insights.preferredComplexity === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {insights.preferredComplexity}
                  </span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">Most Used Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {insights.mostUsedFeatures.slice(0, 3).map((feature, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">Top Domains</h3>
                  <div className="flex flex-wrap gap-2">
                    {insights.topDomains.map((domain, index) => (
                      <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎯</div>
                <p>No insights yet. Start creating projects to see your personalized data!</p>
              </div>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ Preferences</h2>
            
            <div className="space-y-6">
              {/* Complexity Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Complexity
                </label>
                <div className="flex space-x-4">
                  {['beginner', 'intermediate', 'advanced'].map(level => (
                    <button
                      key={level}
                      onClick={() => updatePreferences({ complexity: level })}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        preferences.complexity === level
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Domain Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {domains.map(domain => (
                    <button
                      key={domain}
                      onClick={() => {
                        const newDomains = preferences.domains.includes(domain)
                          ? preferences.domains.filter(d => d !== domain)
                          : [...preferences.domains, domain];
                        updatePreferences({ domains: newDomains });
                      }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        preferences.domains.includes(domain)
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>

              {/* Technology Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Technologies
                </label>
                <div className="flex flex-wrap gap-2">
                  {technologies.map(tech => (
                    <button
                      key={tech}
                      onClick={() => {
                        const newTech = preferences.technologies.includes(tech)
                          ? preferences.technologies.filter(t => t !== tech)
                          : [...preferences.technologies, tech];
                        updatePreferences({ technologies: newTech });
                      }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        preferences.technologies.includes(tech)
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget & Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Preference
                  </label>
                  <select
                    value={preferences.budget}
                    onChange={(e) => updatePreferences({ budget: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Budget preference"
                  >
                    <option value="free">Free / Open Source</option>
                    <option value="low">Low Budget ($0-50/month)</option>
                    <option value="medium">Medium Budget ($50-200/month)</option>
                    <option value="high">High Budget ($200+/month)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Timeline
                  </label>
                  <select
                    value={preferences.timeframe}
                    onChange={(e) => updatePreferences({ timeframe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Project timeline preference"
                  >
                    <option value="quick">Quick (1-2 weeks)</option>
                    <option value="medium">Medium (1-2 months)</option>
                    <option value="long">Long-term (3+ months)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">🤖 AI Recommendations</h2>
              <button
                onClick={generatePersonalizedRecommendations}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Generate Personalized Recommendations
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🧠</span>
                <h3 className="font-semibold text-gray-800">Machine Learning Insights</h3>
              </div>
              <p className="text-gray-700 text-sm">
                Based on your usage patterns, preferences, and successful projects, our AI will recommend 
                the most suitable technology stacks for your next project. The more you use StackFast, 
                the better our recommendations become!
              </p>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Behavioral Analysis
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  Community Trends
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Success Probability
                </span>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                  Technical Fit
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationDashboard;
