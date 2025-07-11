/*
 * Analytics Tracker Service
 * Tracks user interactions and sends analytics data to Firestore
 */

import React from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface AnalyticsEvent {
  eventType: string;
  eventData?: Record<string, any>;
  userId?: string;
  timestamp: Timestamp;
  sessionId?: string;
  userAgent?: string;
  referrer?: string;
}

class AnalyticsTracker {
  private sessionId: string;
  private userId: string | null = null;
  private queue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushInterval();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startFlushInterval() {
    // Flush events every 10 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 10000);
  }

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  track(eventType: string, eventData?: Record<string, any>) {
    const event: AnalyticsEvent = {
      eventType,
      eventData,
      userId: this.userId || undefined,
      timestamp: Timestamp.now(),
      sessionId: this.sessionId,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      referrer: typeof window !== 'undefined' ? document.referrer : ''
    };

    this.queue.push(event);

    // Flush immediately for critical events
    if (this.isCriticalEvent(eventType)) {
      this.flush();
    }
  }

  private isCriticalEvent(eventType: string): boolean {
    const criticalEvents = ['error', 'crash', 'payment', 'signup', 'login'];
    return criticalEvents.includes(eventType);
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      // Send events to Firestore
      const batch = eventsToSend.map(event => 
        addDoc(collection(db, 'user_analytics'), event)
      );
      
      await Promise.all(batch);
      console.log(`[Analytics] Sent ${eventsToSend.length} events to Firestore`);
    } catch (error) {
      console.error('[Analytics] Failed to send events:', error);
      // Re-queue failed events
      this.queue.unshift(...eventsToSend);
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush(); // Final flush
  }

  // Convenience methods for common events
  trackPageView(page: string, additionalData?: Record<string, any>) {
    this.track('page_view', {
      page,
      url: typeof window !== 'undefined' ? window.location.href : '',
      ...additionalData
    });
  }

  trackRecommendationViewed(recommendations: any[], query: string) {
    this.track('recommendation_viewed', {
      recommendationCount: recommendations.length,
      query,
      timestamp: Date.now()
    });
  }

  trackToolSelected(toolName: string, category: string, compatibilityScore?: number) {
    this.track('tool_selected', {
      toolName,
      category,
      compatibilityScore,
      timestamp: Date.now()
    });
  }

  trackProjectGenerated(projectType: string, toolsUsed: string[], estimatedCost?: number) {
    this.track('project_generated', {
      projectType,
      toolsUsed,
      estimatedCost,
      toolCount: toolsUsed.length,
      timestamp: Date.now()
    });
  }

  trackBlueprintSaved(blueprintId: string, projectType: string) {
    this.track('blueprint_saved', {
      blueprintId,
      projectType,
      timestamp: Date.now()
    });
  }

  trackOrganizerBoardCreated(boardId: string, blueprintId?: string) {
    this.track('organizer_board_created', {
      boardId,
      blueprintId,
      timestamp: Date.now()
    });
  }

  trackTaskCompleted(taskId: string, boardId: string, category: string) {
    this.track('task_completed', {
      taskId,
      boardId,
      category,
      timestamp: Date.now()
    });
  }

  trackError(error: Error, context?: string) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
  }

  trackPerformance(metric: string, value: number, context?: string) {
    this.track('performance', {
      metric,
      value,
      context,
      timestamp: Date.now()
    });
  }

  trackSearchQuery(query: string, resultsCount: number, responseTime: number) {
    this.track('search_query', {
      query,
      resultsCount,
      responseTime,
      timestamp: Date.now()
    });
  }

  trackFeatureUsage(featureName: string, action: string, value?: any) {
    this.track('feature_usage', {
      featureName,
      action,
      value,
      timestamp: Date.now()
    });
  }
}

// Global analytics instance
export const analytics = new AnalyticsTracker();

// React hook for analytics
export function useAnalytics() {
  const { user } = useAuth();

  React.useEffect(() => {
    analytics.setUserId(user?.email || null);
  }, [user]);

  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackRecommendationViewed: analytics.trackRecommendationViewed.bind(analytics),
    trackToolSelected: analytics.trackToolSelected.bind(analytics),
    trackProjectGenerated: analytics.trackProjectGenerated.bind(analytics),
    trackBlueprintSaved: analytics.trackBlueprintSaved.bind(analytics),
    trackOrganizerBoardCreated: analytics.trackOrganizerBoardCreated.bind(analytics),
    trackTaskCompleted: analytics.trackTaskCompleted.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackSearchQuery: analytics.trackSearchQuery.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics)
  };
}

// Performance monitoring
export function withAnalytics<T extends (...args: any[]) => any>(
  fn: T,
  metricName: string
): T {
  return ((...args: any[]) => {
    const startTime = performance.now();
    
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.then(
          (value) => {
            const endTime = performance.now();
            analytics.trackPerformance(metricName, endTime - startTime, 'success');
            return value;
          },
          (error) => {
            const endTime = performance.now();
            analytics.trackPerformance(metricName, endTime - startTime, 'error');
            analytics.trackError(error, metricName);
            throw error;
          }
        );
      } else {
        const endTime = performance.now();
        analytics.trackPerformance(metricName, endTime - startTime, 'success');
        return result;
      }
    } catch (error) {
      const endTime = performance.now();
      analytics.trackPerformance(metricName, endTime - startTime, 'error');
      analytics.trackError(error as Error, metricName);
      throw error;
    }
  }) as T;
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analytics.destroy();
  });
}

export default analytics;
