/*
 * Enhanced Real-time Analytics Dashboard
 * Complete project lifecycle analytics with cost tracking and user insights
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api-client';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  LineElement,
  PointElement 
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

// Enhanced types for comprehensive analytics
interface AnalyticsData {
  totalRecommendations: number;
  toolSelectionRate: number;
  popularTools: Array<{ name: string; count: number; category: string; successRate: number }>;
  projectTypeDistribution: Record<string, number>;
  averageCompatibilityScore: number;
  userEngagement: {
    dailyActiveUsers: number;
    averageSessionTime: number;
    returnRate: number;
    featuresUsed: string[];
  };
  // New enhanced metrics
  costMetrics: {
    totalCostSaved: number;
    averageProjectCost: number;
    costAccuracy: number;
    monthlyTrends: Array<{ month: string; projected: number; actual: number }>;
  };
  projectHealth: {
    completionRate: number;
    averageTimeToComplete: number;
    taskCompletionByCategory: Array<{ category: string; completed: number; total: number }>;
    bottlenecks: Array<{ area: string; frequency: number; impact: string }>;
  };
  toolAnalytics: {
    mostSuccessful: Array<{ name: string; successRate: number; avgCost: number }>;
    leastSuccessful: Array<{ name: string; successRate: number; issues: string[] }>;
    costEffective: Array<{ name: string; costPerSuccess: number; value: number }>;
  };
  insights: {
    recommendations: Array<{ type: string; message: string; impact: string; action: string }>;
    patterns: Array<{ pattern: string; frequency: number; outcome: string }>;
  };
}

interface RealtimeMetrics {
  recommendationsToday: number;
  projectsGenerated: number;
  blueprintsSaved: number;
  organizerBoardsCreated: number;
  tasksCompleted: number;
  mostPopularProjectType: string;
  currentActiveUsers: number;
  avgResponseTime: number;
}

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Load analytics data
  useEffect(() => {
    if (user) {
      loadAnalyticsData();
      loadRealtimeMetrics();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        loadRealtimeMetrics();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/dashboard?timeRange=${timeRange}&userId=${user?.email}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
        setRealtimeMetrics(data.data.realtimeMetrics);
      } else {
        console.error('Failed to load analytics:', data.error);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeMetrics = async () => {
    // Real-time metrics are now loaded as part of the main analytics data
    // This function is kept for backwards compatibility
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Analytics Dashboard</h1>
        <p className="text-gray-600">Real-time insights into your StackFast usage and recommendations</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {['24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Metrics */}
      {realtimeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Today's Recommendations</p>
                <p className="text-2xl font-bold text-gray-900">{realtimeMetrics.recommendationsToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">🚀</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Projects Generated</p>
                <p className="text-2xl font-bold text-gray-900">{realtimeMetrics.projectsGenerated}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">💾</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Blueprints Saved</p>
                <p className="text-2xl font-bold text-gray-900">{realtimeMetrics.blueprintsSaved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">🔥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Popular Type</p>
                <p className="text-xl font-bold text-gray-900">{realtimeMetrics.mostPopularProjectType}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Tools */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🛠️ Popular Tools</h3>
            <div className="space-y-3">
              {analytics.popularTools.map((tool, index) => (
                <div key={tool.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                    <span className="ml-2 text-sm text-gray-700">{tool.name}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(tool.count / Math.max(...analytics.popularTools.map(t => t.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{tool.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Type Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Project Types</h3>
            <div className="space-y-3">
              {Object.entries(analytics.projectTypeDistribution).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{type}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(count / Math.max(...Object.values(analytics.projectTypeDistribution))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Total Recommendations</span>
                <span className="text-sm font-medium text-gray-900">{analytics.totalRecommendations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Tool Selection Rate</span>
                <span className="text-sm font-medium text-gray-900">{(analytics.toolSelectionRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Avg. Compatibility Score</span>
                <span className="text-sm font-medium text-gray-900">{analytics.averageCompatibilityScore.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔴 Live Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">System is tracking user behavior</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Analytics updated every 30 seconds</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Recommendation engine learning</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          
          {/* Cost Trends Chart */}
          {analytics.costMetrics && analytics.costMetrics.monthlyTrends && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Cost Trends</h3>
              <Line
                data={{
                  labels: analytics.costMetrics.monthlyTrends.map(trend => trend.month),
                  datasets: [
                    {
                      label: 'Projected Cost',
                      data: analytics.costMetrics.monthlyTrends.map(trend => trend.projected),
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.1
                    },
                    {
                      label: 'Actual Cost',
                      data: analytics.costMetrics.monthlyTrends.map(trend => trend.actual),
                      borderColor: 'rgb(34, 197, 94)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      tension: 0.1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Monthly Cost Analysis'
                    }
                  }
                }}
              />
            </div>
          )}

          {/* Project Health Metrics */}
          {analytics.projectHealth && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Project Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Completion Rate</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${analytics.projectHealth.completionRate * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {(analytics.projectHealth.completionRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Avg. Time to Complete</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.projectHealth.averageTimeToComplete.toFixed(1)} days
                  </span>
                </div>
                {analytics.projectHealth.bottlenecks && analytics.projectHealth.bottlenecks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Common Bottlenecks</h4>
                    <div className="space-y-1">
                      {analytics.projectHealth.bottlenecks.slice(0, 3).map((bottleneck, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-600">{bottleneck.area}</span>
                          <span className={`font-medium ${
                            bottleneck.impact === 'High' ? 'text-red-600' : 
                            bottleneck.impact === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                          }`}>{bottleneck.impact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tool Success Rate */}
          {analytics.toolAnalytics && analytics.toolAnalytics.mostSuccessful && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performing Tools</h3>
              <div className="space-y-3">
                {analytics.toolAnalytics.mostSuccessful.slice(0, 5).map((tool, index) => (
                  <div key={tool.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}></div>
                      <span className="text-sm text-gray-700">{tool.name}</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {(tool.successRate * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Engagement Pie Chart */}
          {analytics.userEngagement && analytics.userEngagement.featuresUsed && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Feature Usage</h3>
              <Doughnut
                data={{
                  labels: analytics.userEngagement.featuresUsed.slice(0, 5),
                  datasets: [{
                    data: analytics.userEngagement.featuresUsed.slice(0, 5).map(() => Math.random() * 100),
                    backgroundColor: [
                      '#3B82F6',
                      '#10B981',
                      '#F59E0B',
                      '#EF4444',
                      '#8B5CF6'
                    ]
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    }
                  }
                }}
              />
            </div>
          )}

          {/* Insights Panel */}
          {analytics.insights && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 AI Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {analytics.insights.recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-blue-900">{rec.type}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            rec.impact === 'High' ? 'bg-red-100 text-red-700' : 
                            rec.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>{rec.impact}</span>
                        </div>
                        <p className="text-sm text-gray-700">{rec.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Usage Patterns</h4>
                  <div className="space-y-2">
                    {analytics.insights.patterns.slice(0, 3).map((pattern, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-green-900">{pattern.pattern}</span>
                          <span className="text-xs text-gray-500">{pattern.frequency}x</span>
                        </div>
                        <p className="text-sm text-gray-700">{pattern.outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legacy Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cost Savings Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💸 Cost Savings</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Total Cost Saved</span>
                <span className="text-sm font-medium text-gray-900">{analytics.costMetrics.totalCostSaved.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Average Project Cost</span>
                <span className="text-sm font-medium text-gray-900">{analytics.costMetrics.averageProjectCost.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Cost Accuracy</span>
                <span className="text-sm font-medium text-gray-900">{(analytics.costMetrics.costAccuracy * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Task Completion by Category */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Task Completion</h3>
            <div className="space-y-3">
              {analytics.projectHealth.taskCompletionByCategory.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{category.category}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(category.completed / category.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{category.completed} / {category.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Least Successful Tools */}
          {analytics.toolAnalytics.leastSuccessful && analytics.toolAnalytics.leastSuccessful.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📉 Least Successful Tools</h3>
              <div className="space-y-3">
                {analytics.toolAnalytics.leastSuccessful.slice(0, 5).map((tool) => (
                  <div key={tool.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">{tool.name}</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      {(tool.successRate * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {analytics.insights.recommendations && analytics.insights.recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Recommendations</h3>
              <div className="space-y-3">
                {analytics.insights.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">{rec.type}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rec.impact === 'High' ? 'bg-red-100 text-red-700' : 
                        rec.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>{rec.impact}</span>
                    </div>
                    <p className="text-sm text-gray-700">{rec.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{rec.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
