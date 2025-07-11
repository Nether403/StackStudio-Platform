/*
 * User Analytics & Behavior Tracking System
 * Phase 5: Rapid Implementation - Hour 1-2
 * 
 * This system tracks user interactions to improve recommendations
 */

import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Types for analytics events
export interface AnalyticsEvent {
  userId: string;
  eventType: 'recommendation_viewed' | 'tool_selected' | 'project_generated' | 'blueprint_saved' | 'tool_clicked' | 'compatibility_checked';
  eventData: {
    projectType?: string;
    toolName?: string;
    recommendationScore?: number;
    userAction?: string;
    sessionId?: string;
    eventTimestamp?: number;
    metadata?: Record<string, any>;
  };
  timestamp: any;
}

// Analytics hook for tracking user behavior
export const useAnalytics = () => {
  const { user } = useAuth();
  
  const trackEvent = async (
    eventType: AnalyticsEvent['eventType'],
    eventData: AnalyticsEvent['eventData']
  ) => {
    if (!user) return;
    
    try {
      const event: AnalyticsEvent = {
        userId: user.uid,
        eventType,
        eventData: {
          ...eventData,
          sessionId: getSessionId(),
          eventTimestamp: Date.now()
        },
        timestamp: serverTimestamp()
      };
      
      await addDoc(collection(db, 'user_analytics'), event);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  // Track recommendation views
  const trackRecommendationViewed = (projectType: string, recommendations: any[]) => {
    trackEvent('recommendation_viewed', {
      projectType,
      metadata: {
        recommendationCount: recommendations.length,
        topRecommendations: recommendations.slice(0, 3).map(r => r.name)
      }
    });
  };

  // Track tool selections
  const trackToolSelected = (toolName: string, recommendationScore: number, projectType: string) => {
    trackEvent('tool_selected', {
      toolName,
      recommendationScore,
      projectType,
      userAction: 'selected_from_recommendations'
    });
  };

  // Track project generation
  const trackProjectGenerated = (projectType: string, stackSize: number, compatibilityScore: number) => {
    trackEvent('project_generated', {
      projectType,
      metadata: {
        stackSize,
        compatibilityScore,
        generationTime: Date.now()
      }
    });
  };

  // Track blueprint saves
  const trackBlueprintSaved = (projectType: string, stackTools: string[]) => {
    trackEvent('blueprint_saved', {
      projectType,
      metadata: {
        stackTools,
        saveTime: Date.now()
      }
    });
  };

  return {
    trackRecommendationViewed,
    trackToolSelected,
    trackProjectGenerated,
    trackBlueprintSaved,
    trackEvent
  };
};

// Session management
let sessionId: string | null = null;
const getSessionId = (): string => {
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return sessionId;
};

// Real-time analytics aggregation
export const useAnalyticsAggregator = () => {
  const aggregateUserBehavior = async (userId: string) => {
    // This will be implemented to analyze user patterns
    // For now, return mock data structure
    return {
      toolPreferences: {},
      projectTypeFrequency: {},
      averageCompatibilityScore: 0,
      totalRecommendationsViewed: 0,
      toolSelectionRate: 0
    };
  };

  return { aggregateUserBehavior };
};

// Enhanced recommendation scoring based on user behavior
export const enhanceRecommendationScoring = (
  baseRecommendations: any[],
  userBehavior: any
) => {
  return baseRecommendations.map(rec => {
    let enhancedScore = rec.compatibilityScore;
    
    // Boost score if user has previously selected this tool
    if (userBehavior.toolPreferences?.[rec.name]) {
      enhancedScore += 10;
    }
    
    // Boost score if tool is popular among similar users
    if (userBehavior.similarUserPreferences?.[rec.name]) {
      enhancedScore += 5;
    }
    
    return {
      ...rec,
      compatibilityScore: Math.min(100, enhancedScore),
      personalizedScore: enhancedScore,
      isPersonalized: enhancedScore > rec.compatibilityScore
    };
  });
};
