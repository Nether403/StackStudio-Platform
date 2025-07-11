/*
 * Real-time Analytics Dashboard
 * Phase 5: Rapid Implementation - Hour 3-4
 * 
 * Live analytics showing user behavior and recommendation performance
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Types for analytics data
interface AnalyticsData {
  totalRecommendations: number;
  toolSelectionRate: number;
  popularTools: Array<{ name: string; count: number }>;
  projectTypeDistribution: Record<string, number>;
  averageCompatibilityScore: number;
  userEngagement: {
    dailyActiveUsers: number;
    averageSessionTime: number;
    returnRate: number;
  };
}

interface RealtimeMetrics {
  recommendationsToday: number;
  projectsGenerated: number;
  blueprintsSaved: number;
  mostPopularProjectType: string;
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
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - getHoursFromRange(timeRange));

      const analyticsQuery = query(
        collection(db, 'user_analytics'),
        where('userId', '==', user?.uid),
        where('timestamp', '>=', cutoffDate),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(analyticsQuery);
      const events = snapshot.docs.map(doc => doc.data());

      // Process analytics data
      const processedData = processAnalyticsEvents(events);
      setAnalytics(processedData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeMetrics = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayQuery = query(
        collection(db, 'user_analytics'),
        where('timestamp', '>=', today),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(todayQuery);
      const events = snapshot.docs.map(doc => doc.data());

      const metrics = calculateRealtimeMetrics(events);
      setRealtimeMetrics(metrics);
    } catch (error) {
      console.error('Error loading realtime metrics:', error);
    }
  };

  const processAnalyticsEvents = (events: any[]): AnalyticsData => {
    const toolCounts: Record<string, number> = {};
    const projectTypes: Record<string, number> = {};
    let totalCompatibilityScore = 0;
    let compatibilityCount = 0;

    events.forEach(event => {
      if (event.eventType === 'tool_selected' && event.eventData?.toolName) {
        toolCounts[event.eventData.toolName] = (toolCounts[event.eventData.toolName] || 0) + 1;
      }

      if (event.eventData?.projectType) {
        projectTypes[event.eventData.projectType] = (projectTypes[event.eventData.projectType] || 0) + 1;
      }

      if (event.eventData?.recommendationScore) {
        totalCompatibilityScore += event.eventData.recommendationScore;
        compatibilityCount++;
      }
    });

    const popularTools = Object.entries(toolCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      totalRecommendations: events.filter(e => e.eventType === 'recommendation_viewed').length,
      toolSelectionRate: events.filter(e => e.eventType === 'tool_selected').length / Math.max(1, events.filter(e => e.eventType === 'recommendation_viewed').length),
      popularTools,
      projectTypeDistribution: projectTypes,
      averageCompatibilityScore: compatibilityCount > 0 ? totalCompatibilityScore / compatibilityCount : 0,
      userEngagement: {
        dailyActiveUsers: 1, // Simplified for now
        averageSessionTime: 0,
        returnRate: 0
      }
    };
  };

  const calculateRealtimeMetrics = (events: any[]): RealtimeMetrics => {
    const recommendationsToday = events.filter(e => e.eventType === 'recommendation_viewed').length;
    const projectsGenerated = events.filter(e => e.eventType === 'project_generated').length;
    const blueprintsSaved = events.filter(e => e.eventType === 'blueprint_saved').length;
    
    const projectTypeCounts = events.reduce((acc, event) => {
      if (event.eventData?.projectType) {
        acc[event.eventData.projectType] = (acc[event.eventData.projectType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostPopularProjectType = Object.entries(projectTypeCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'web-app';

    return {
      recommendationsToday,
      projectsGenerated,
      blueprintsSaved,
      mostPopularProjectType
    };
  };

  const getHoursFromRange = (range: string): number => {
    switch (range) {
      case '24h': return 24;
      case '7d': return 24 * 7;
      case '30d': return 24 * 30;
      default: return 24;
    }
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
                        className="bg-blue-600 h-2 rounded-full" 
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
                        className="bg-green-600 h-2 rounded-full" 
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
    </div>
  );
};

export default AnalyticsDashboard;
