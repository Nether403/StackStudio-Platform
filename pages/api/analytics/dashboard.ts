/*
 * Analytics Dashboard API
 * Provides comprehensive analytics data for the StackStudio dashboard
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';

interface AnalyticsQueryParams {
  timeRange?: '24h' | '7d' | '30d';
  userId?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeRange = '24h', userId } = req.query as AnalyticsQueryParams;
    
    // Calculate time range
    const now = new Date();
    const cutoffDate = new Date();
    switch (timeRange) {
      case '24h':
        cutoffDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
    }

    // Prepare queries
    const baseQuery = userId 
      ? query(
          collection(db, 'user_analytics'),
          where('userId', '==', userId),
          where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
          orderBy('timestamp', 'desc'),
          limit(1000)
        )
      : query(
          collection(db, 'user_analytics'),
          where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
          orderBy('timestamp', 'desc'),
          limit(1000)
        );

    // Execute queries
    const [analyticsSnapshot, blueprintsSnapshot, organizerSnapshot] = await Promise.all([
      getDocs(baseQuery),
      getDocs(query(collection(db, 'blueprints'), where('createdAt', '>=', Timestamp.fromDate(cutoffDate)), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'organizer_boards'), where('createdAt', '>=', Timestamp.fromDate(cutoffDate)), orderBy('createdAt', 'desc')))
    ]);

    const events = analyticsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const blueprints = blueprintsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const organizerBoards = organizerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Process analytics data
    const analytics = processAnalyticsData(events, blueprints, organizerBoards);

    res.status(200).json({
      success: true,
      data: analytics,
      metadata: {
        timeRange,
        eventsCount: events.length,
        blueprintsCount: blueprints.length,
        organizerBoardsCount: organizerBoards.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function processAnalyticsData(events: any[], blueprints: any[], organizerBoards: any[]) {
  // Basic metrics
  const totalRecommendations = events.filter(e => e.eventType === 'recommendation_viewed').length;
  const toolSelections = events.filter(e => e.eventType === 'tool_selected');
  const toolSelectionRate = totalRecommendations > 0 ? toolSelections.length / totalRecommendations : 0;

  // Tool analytics
  const toolCounts: Record<string, { count: number; category: string; successRate: number }> = {};
  const toolCategories: Record<string, number> = {};
  
  toolSelections.forEach(event => {
    if (event.eventData?.toolName) {
      const toolName = event.eventData.toolName;
      const category = event.eventData.category || 'Other';
      
      if (!toolCounts[toolName]) {
        toolCounts[toolName] = { count: 0, category, successRate: 0 };
      }
      toolCounts[toolName].count++;
      toolCategories[category] = (toolCategories[category] || 0) + 1;
    }
  });

  // Calculate tool success rates (based on subsequent project generation)
  Object.keys(toolCounts).forEach(toolName => {
    const toolEvents = toolSelections.filter(e => e.eventData?.toolName === toolName);
    const successfulProjects = toolEvents.filter(e => {
      // Look for project generation within 10 minutes of tool selection
      const projectGenerated = events.find(pe => 
        pe.eventType === 'project_generated' && 
        pe.userId === e.userId &&
        new Date(pe.timestamp.toDate()).getTime() - new Date(e.timestamp.toDate()).getTime() < 600000
      );
      return !!projectGenerated;
    });
    
    toolCounts[toolName].successRate = toolEvents.length > 0 ? successfulProjects.length / toolEvents.length : 0;
  });

  const popularTools = Object.entries(toolCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([name, data]) => ({ name, count: data.count, category: data.category, successRate: data.successRate }));

  // Project type distribution
  const projectTypeDistribution: Record<string, number> = {};
  blueprints.forEach(blueprint => {
    if (blueprint.projectType) {
      projectTypeDistribution[blueprint.projectType] = (projectTypeDistribution[blueprint.projectType] || 0) + 1;
    }
  });

  // Cost metrics
  const costMetrics = {
    totalCostSaved: blueprints.reduce((sum, bp) => sum + (bp.estimatedCost?.total || 0), 0),
    averageProjectCost: blueprints.length > 0 ? blueprints.reduce((sum, bp) => sum + (bp.estimatedCost?.total || 0), 0) / blueprints.length : 0,
    costAccuracy: 0.85, // Placeholder - would need actual vs estimated data
    monthlyTrends: generateMonthlyCostTrends(blueprints)
  };

  // Project health metrics
  const projectHealth = {
    completionRate: calculateCompletionRate(organizerBoards),
    averageTimeToComplete: calculateAverageCompletionTime(organizerBoards),
    taskCompletionByCategory: calculateTaskCompletionByCategory(organizerBoards),
    bottlenecks: identifyBottlenecks(organizerBoards)
  };

  // User engagement
  const uniqueUsers = Array.from(new Set(events.map(e => e.userId)));
  const userEngagement = {
    dailyActiveUsers: uniqueUsers.length,
    averageSessionTime: calculateAverageSessionTime(events),
    returnRate: calculateReturnRate(events, uniqueUsers),
    featuresUsed: Array.from(new Set(events.map(e => e.eventType)))
  };

  // Tool analytics
  const toolAnalytics = {
    mostSuccessful: popularTools.filter(t => t.successRate > 0.7).slice(0, 5),
    leastSuccessful: popularTools.filter(t => t.successRate < 0.3).slice(0, 5).map(t => ({
      name: t.name,
      successRate: t.successRate,
      issues: ['Low adoption rate', 'Configuration complexity', 'Documentation gaps']
    })),
    costEffective: popularTools.sort((a, b) => (b.successRate / Math.max(1, b.count)) - (a.successRate / Math.max(1, a.count))).slice(0, 5).map(t => ({
      name: t.name,
      costPerSuccess: t.count > 0 ? 100 / t.count : 0, // Placeholder calculation
      value: t.successRate * 100
    }))
  };

  // Generate insights
  const insights = generateInsights(events, blueprints, organizerBoards, popularTools);

  // Real-time metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEvents = events.filter(e => new Date(e.timestamp.toDate()) >= today);
  const todayBlueprints = blueprints.filter(bp => new Date(bp.createdAt.toDate()) >= today);
  const todayOrganizers = organizerBoards.filter(ob => new Date(ob.createdAt.toDate()) >= today);

  const realtimeMetrics = {
    recommendationsToday: todayEvents.filter(e => e.eventType === 'recommendation_viewed').length,
    projectsGenerated: todayBlueprints.length,
    blueprintsSaved: todayBlueprints.filter(bp => bp.saved).length,
    organizerBoardsCreated: todayOrganizers.length,
    tasksCompleted: todayOrganizers.reduce((sum, board) => sum + (board.completedTasks || 0), 0),
    mostPopularProjectType: Object.entries(projectTypeDistribution).sort(([, a], [, b]) => b - a)[0]?.[0] || 'web-app',
    currentActiveUsers: uniqueUsers.length,
    avgResponseTime: calculateAverageResponseTime(todayEvents)
  };

  return {
    totalRecommendations,
    toolSelectionRate,
    popularTools,
    projectTypeDistribution,
    averageCompatibilityScore: calculateAverageCompatibilityScore(events),
    userEngagement,
    costMetrics,
    projectHealth,
    toolAnalytics,
    insights,
    realtimeMetrics
  };
}

// Helper functions
function generateMonthlyCostTrends(blueprints: any[]) {
  const monthlyData: Record<string, { projected: number; actual: number }> = {};
  
  blueprints.forEach(bp => {
    if (bp.createdAt && bp.estimatedCost) {
      const month = new Date(bp.createdAt.toDate()).toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { projected: 0, actual: 0 };
      }
      monthlyData[month].projected += bp.estimatedCost.total || 0;
      monthlyData[month].actual += bp.actualCost || bp.estimatedCost.total || 0; // Fallback to projected
    }
  });

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Last 6 months
    .map(([month, data]) => ({ month, ...data }));
}

function calculateCompletionRate(organizerBoards: any[]) {
  if (organizerBoards.length === 0) return 0;
  
  const completedBoards = organizerBoards.filter(board => {
    const totalTasks = board.totalTasks || 0;
    const completedTasks = board.completedTasks || 0;
    return totalTasks > 0 && completedTasks / totalTasks >= 0.8; // 80% completion threshold
  });
  
  return completedBoards.length / organizerBoards.length;
}

function calculateAverageCompletionTime(organizerBoards: any[]) {
  const completedBoards = organizerBoards.filter(board => board.completedAt && board.createdAt);
  
  if (completedBoards.length === 0) return 0;
  
  const totalTime = completedBoards.reduce((sum, board) => {
    const start = new Date(board.createdAt.toDate());
    const end = new Date(board.completedAt.toDate());
    return sum + (end.getTime() - start.getTime());
  }, 0);
  
  return totalTime / completedBoards.length / (1000 * 60 * 60 * 24); // Convert to days
}

function calculateTaskCompletionByCategory(organizerBoards: any[]) {
  const categories: Record<string, { completed: number; total: number }> = {};
  
  organizerBoards.forEach(board => {
    if (board.tasks) {
      board.tasks.forEach((task: any) => {
        const category = task.category || 'General';
        if (!categories[category]) {
          categories[category] = { completed: 0, total: 0 };
        }
        categories[category].total++;
        if (task.completed) {
          categories[category].completed++;
        }
      });
    }
  });
  
  return Object.entries(categories).map(([category, data]) => ({
    category,
    completed: data.completed,
    total: data.total
  }));
}

function identifyBottlenecks(organizerBoards: any[]) {
  const bottlenecks: Record<string, number> = {};
  
  organizerBoards.forEach(board => {
    if (board.columns) {
      board.columns.forEach((column: any) => {
        if (column.tasks && column.tasks.length > 5) { // Bottleneck threshold
          const area = column.title || 'Unknown';
          bottlenecks[area] = (bottlenecks[area] || 0) + 1;
        }
      });
    }
  });
  
  return Object.entries(bottlenecks)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([area, frequency]) => ({
      area,
      frequency,
      impact: frequency > 10 ? 'High' : frequency > 5 ? 'Medium' : 'Low'
    }));
}

function calculateAverageSessionTime(events: any[]) {
  const userSessions: Record<string, { start: Date; end: Date }[]> = {};
  
  events.forEach(event => {
    if (!userSessions[event.userId]) {
      userSessions[event.userId] = [];
    }
    
    const eventTime = new Date(event.timestamp.toDate());
    const userEvents = userSessions[event.userId];
    
    // Find or create session (events within 30 minutes are same session)
    let currentSession = userEvents.find(session => 
      Math.abs(session.end.getTime() - eventTime.getTime()) < 30 * 60 * 1000
    );
    
    if (!currentSession) {
      currentSession = { start: eventTime, end: eventTime };
      userEvents.push(currentSession);
    } else {
      currentSession.end = eventTime > currentSession.end ? eventTime : currentSession.end;
      currentSession.start = eventTime < currentSession.start ? eventTime : currentSession.start;
    }
  });
  
  const allSessions = Object.values(userSessions).flat();
  if (allSessions.length === 0) return 0;
  
  const totalTime = allSessions.reduce((sum, session) => 
    sum + (session.end.getTime() - session.start.getTime()), 0
  );
  
  return totalTime / allSessions.length / (1000 * 60); // Convert to minutes
}

function calculateReturnRate(events: any[], uniqueUsers: string[]) {
  const userDays: Record<string, Set<string>> = {};
  
  events.forEach(event => {
    if (!userDays[event.userId]) {
      userDays[event.userId] = new Set();
    }
    const day = new Date(event.timestamp.toDate()).toISOString().substring(0, 10);
    userDays[event.userId].add(day);
  });
  
  const returningUsers = Object.values(userDays).filter(days => days.size > 1).length;
  
  return uniqueUsers.length > 0 ? returningUsers / uniqueUsers.length : 0;
}

function calculateAverageCompatibilityScore(events: any[]) {
  const scoreEvents = events.filter(e => e.eventData?.compatibilityScore);
  
  if (scoreEvents.length === 0) return 0;
  
  const totalScore = scoreEvents.reduce((sum, event) => sum + event.eventData.compatibilityScore, 0);
  
  return totalScore / scoreEvents.length;
}

function calculateAverageResponseTime(events: any[]) {
  const responseEvents = events.filter(e => e.eventData?.responseTime);
  
  if (responseEvents.length === 0) return 0;
  
  const totalTime = responseEvents.reduce((sum, event) => sum + event.eventData.responseTime, 0);
  
  return totalTime / responseEvents.length;
}

function generateInsights(events: any[], blueprints: any[], organizerBoards: any[], popularTools: any[]) {
  const insights = {
    recommendations: [] as any[],
    patterns: [] as any[]
  };

  // Generate recommendations based on data
  if (popularTools.length > 0) {
    const topTool = popularTools[0];
    if (topTool.successRate < 0.5) {
      insights.recommendations.push({
        type: 'tool_optimization',
        message: `${topTool.name} has low success rate (${(topTool.successRate * 100).toFixed(1)}%)`,
        impact: 'Medium',
        action: 'Review tool configuration and documentation'
      });
    }
  }

  // Pattern analysis
  const hourlyActivity = analyzeHourlyActivity(events);
  const peakHour = Object.entries(hourlyActivity).sort(([, a], [, b]) => b - a)[0];
  
  if (peakHour) {
    insights.patterns.push({
      pattern: `Peak usage at ${peakHour[0]}:00`,
      frequency: peakHour[1],
      outcome: 'Optimal time for system maintenance is off-peak hours'
    });
  }

  return insights;
}

function analyzeHourlyActivity(events: any[]) {
  const hourlyData: Record<string, number> = {};
  
  events.forEach(event => {
    const hour = new Date(event.timestamp.toDate()).getHours().toString();
    hourlyData[hour] = (hourlyData[hour] || 0) + 1;
  });
  
  return hourlyData;
}
