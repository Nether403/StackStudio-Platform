import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { mlPersonalizationEngine } from '../Engine/ml-personalization-engine';
import { communitySystem } from '../Engine/community-system';
import AnalyticsDashboard from './AnalyticsDashboard';
import CommunityDashboard from './CommunityDashboard';
import PersonalizationDashboard from './PersonalizationDashboard';
import RapidPrototyping from './RapidPrototyping';

interface SuperDashboardProps {
  className?: string;
}

interface DashboardStats {
  totalProjects: number;
  personalizedRecommendations: number;
  communityConnections: number;
  aiInsights: number;
  weeklyGrowth: number;
  successRate: number;
}

const SuperDashboard: React.FC<SuperDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const analyticsHook = useAnalytics();
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'community' | 'personalization' | 'prototyping'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    personalizedRecommendations: 0,
    communityConnections: 0,
    aiInsights: 0,
    weeklyGrowth: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, [user]);

  const loadDashboardStats = async () => {
    if (!user || !user.email) return;

    try {
      // Get user insights from ML engine
      const userInsights = mlPersonalizationEngine.getUserInsights(user.email);
      
      // Get community insights
      const communityInsights = communitySystem.getCommunityInsights();
      
      // Calculate stats
      const dashboardStats: DashboardStats = {
        totalProjects: userInsights.totalProjects || 0,
        personalizedRecommendations: 10, // Mock data for now
        communityConnections: userInsights.favoriteStacks || 0,
        aiInsights: userInsights.mostUsedFeatures?.length || 0,
        weeklyGrowth: communityInsights.growthMetrics?.newUsersThisWeek || 0,
        successRate: userInsights.successfulDeployments > 0 ? 
          Math.round((userInsights.successfulDeployments / userInsights.totalProjects) * 100) : 0
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              StackFast AI Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Powered by machine learning • Community-driven • Personalized for you
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">AI Active</span>
            </div>
            <div className="text-sm text-gray-500">
              Welcome back, {user?.name || 'Developer'}!
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <div className="text-blue-100">Projects Created</div>
            </div>
            <div className="text-4xl opacity-80">🚀</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.personalizedRecommendations}</div>
              <div className="text-purple-100">AI Recommendations</div>
            </div>
            <div className="text-4xl opacity-80">🧠</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.communityConnections}</div>
              <div className="text-green-100">Community Links</div>
            </div>
            <div className="text-4xl opacity-80">🤝</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <div className="text-orange-100">Success Rate</div>
            </div>
            <div className="text-4xl opacity-80">📈</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'prototyping', label: 'Rapid Prototyping', icon: '⚡' },
          { id: 'analytics', label: 'Analytics', icon: '📈' },
          { id: 'community', label: 'Community', icon: '🏘️' },
          { id: 'personalization', label: 'AI Personalization', icon: '🧠' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeView === tab.id
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeView === 'overview' && (
        <div className="space-y-8">
          {/* AI Insights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🧠 AI Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">🎯</span>
                  <h3 className="font-semibold text-blue-800">Personalized Recommendations</h3>
                </div>
                <p className="text-blue-700 text-sm">
                  AI analyzes your preferences and success patterns to suggest the perfect tech stack for your next project.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">🔮</span>
                  <h3 className="font-semibold text-purple-800">Predictive Analytics</h3>
                </div>
                <p className="text-purple-700 text-sm">
                  Machine learning predicts project success probability and suggests improvements before you start.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">📊</span>
                  <h3 className="font-semibold text-green-800">Smart Insights</h3>
                </div>
                <p className="text-green-700 text-sm">
                  Real-time analysis of your coding patterns, preferences, and community trends to optimize your workflow.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🚀 Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => setActiveView('prototyping')}
                className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 text-left transform hover:scale-105"
              >
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-semibold">Rapid Prototyping</div>
                <div className="text-sm opacity-90">Generate code in minutes</div>
              </button>

              <button className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors text-left">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold">Generate Project</div>
                <div className="text-sm opacity-90">AI-powered recommendations</div>
              </button>

              <button 
                onClick={() => setActiveView('personalization')}
                className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors text-left"
              >
                <div className="text-2xl mb-2">🧠</div>
                <div className="font-semibold">AI Personalization</div>
                <div className="text-sm opacity-90">Customize your experience</div>
              </button>

              <button 
                onClick={() => setActiveView('community')}
                className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors text-left"
              >
                <div className="text-2xl mb-2">🏘️</div>
                <div className="font-semibold">Join Community</div>
                <div className="text-sm opacity-90">Connect with developers</div>
              </button>

              <button className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition-colors text-left">
                <div className="text-2xl mb-2">📈</div>
                <div className="font-semibold">View Analytics</div>
                <div className="text-sm opacity-90">Track your progress</div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Recent Activity</h2>
            <div className="space-y-4">
              {[
                { icon: '🚀', action: 'Created project', target: 'Modern Web App', time: '2 hours ago', color: 'blue' },
                { icon: '🧠', action: 'AI recommendation', target: 'Next.js + TypeScript', time: '5 hours ago', color: 'purple' },
                { icon: '🏘️', action: 'Joined community', target: 'Web Development', time: '1 day ago', color: 'green' },
                { icon: '📈', action: 'Viewed analytics', target: 'Usage insights', time: '2 days ago', color: 'orange' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-medium text-gray-800">{activity.action}</span>
                      <span className="text-gray-600 ml-1">{activity.target}</span>
                    </div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'analytics' && (
        <AnalyticsDashboard />
      )}

      {activeView === 'prototyping' && (
        <RapidPrototyping />
      )}

      {activeView === 'community' && (
        <CommunityDashboard />
      )}

      {activeView === 'personalization' && (
        <PersonalizationDashboard />
      )}
    </div>
  );
};

export default SuperDashboard;
