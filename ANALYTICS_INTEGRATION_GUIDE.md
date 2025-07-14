# 🔥 Analytics Integration Guide - Quick Implementation

## 🎯 How to Add Analytics to Your StackStudio Components

### **1. Import and Initialize Analytics**
```typescript
import { useAnalytics } from '../services/analyticsService';

const MyComponent: React.FC = () => {
  const analytics = useAnalytics();
  
  // Track page view on mount
  useEffect(() => {
    analytics.trackPageView('/my-component');
  }, [analytics]);
  
  return (
    // Your component JSX
  );
};
```

### **2. Track User Interactions**
```typescript
const handleButtonClick = () => {
  analytics.trackFeatureUsage('button_click', 'primary_cta', {
    buttonText: 'Generate Blueprint',
    location: 'header'
  });
  
  // Your existing logic
};

const handleToolSelection = (toolName: string) => {
  analytics.trackToolSelected(toolName, 'frontend', 0.95);
  
  // Your existing logic
};
```

### **3. Track Performance Metrics**
```typescript
import { withAnalytics } from '../services/analyticsService';

// Wrap expensive functions
const expensiveOperation = withAnalytics(
  async (data: any) => {
    // Your expensive operation
    return await processData(data);
  },
  'expensive_operation'
);
```

### **4. Track Errors**
```typescript
const handleError = (error: Error) => {
  analytics.trackError(error, 'blueprint_generation');
  
  // Your error handling
};
```

## 🚀 Integration Points

### **In Blueprint Components**
```typescript
// When user generates blueprint
analytics.trackProjectGenerated(
  projectType, 
  selectedTools.map(t => t.name),
  estimatedCost
);

// When user saves blueprint
analytics.trackBlueprintSaved(blueprintId, projectType);
```

### **In Organizer Components**
```typescript
// When user creates board
analytics.trackOrganizerBoardCreated(boardId, blueprintId);

// When user completes task
analytics.trackTaskCompleted(taskId, boardId, category);
```

### **In Search Components**
```typescript
// When user searches
analytics.trackSearchQuery(
  searchTerm, 
  resultsCount, 
  responseTime
);

// When user views recommendations
analytics.trackRecommendationViewed(
  recommendations, 
  searchQuery
);
```

## 📊 Analytics Dashboard Usage

### **Access the Dashboard**
- Navigate to `/analytics-demo` for demo
- Full dashboard at `/analytics` (with auth)
- Real-time metrics update every 30 seconds

### **API Endpoints**
- `GET /api/analytics/dashboard?timeRange=24h&userId=user123`
- Returns comprehensive analytics data
- Supports filtering by user and time range

### **Key Features**
- Real-time metrics cards
- Cost trend analysis
- Tool performance charts
- User engagement insights
- AI-powered recommendations

## 🎨 Customization Options

### **Add Custom Metrics**
```typescript
analytics.track('custom_event', {
  customField: 'value',
  timestamp: Date.now(),
  userId: user.id
});
```

### **Custom Dashboard Cards**
```typescript
const CustomMetricCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold">{icon}</span>
        </div>
      </div>
      <div className="ml-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);
```

## 🔧 Performance Considerations

### **Batch Events**
- Events are automatically batched every 10 seconds
- Critical events (errors, payments) are sent immediately
- Failed events are retried automatically

### **Caching Strategy**
- Dashboard data cached for 24 hours
- Real-time metrics refresh every 30 seconds
- Firestore queries are optimized with indexes

### **Error Handling**
- Graceful degradation when analytics fails
- Fallback data for missing metrics
- User-friendly error messages

## 🎯 Key Events to Track

### **User Journey Events**
- `page_view` - Page navigation
- `search_query` - Search interactions
- `recommendation_viewed` - Recommendation display
- `tool_selected` - Tool selection
- `project_generated` - Blueprint creation
- `blueprint_saved` - Blueprint save
- `organizer_board_created` - Kanban board creation
- `task_completed` - Task completion

### **Performance Events**
- `performance` - Function execution time
- `error` - Error occurrences
- `api_call` - API request tracking
- `feature_usage` - Feature interaction

### **Business Events**
- `cost_calculated` - Cost estimation
- `export_blueprint` - Blueprint export
- `user_signup` - User registration
- `subscription_change` - Plan changes

## 📈 Analytics Best Practices

### **1. Privacy First**
- Never track sensitive user data
- Anonymize user identifiers
- Comply with GDPR/CCPA
- Allow opt-out options

### **2. Performance Conscious**
- Use async tracking
- Batch events efficiently
- Monitor tracking overhead
- Implement circuit breakers

### **3. Data Quality**
- Validate event data
- Handle edge cases
- Monitor data consistency
- Clean up old data

### **4. Actionable Insights**
- Focus on business metrics
- Set up alerts for anomalies
- Create actionable dashboards
- Regular data review cycles

## 🔍 Monitoring & Alerts

### **Set up Alerts**
```typescript
// Monitor high error rates
if (errorRate > 0.05) {
  analytics.track('alert_triggered', {
    alertType: 'high_error_rate',
    threshold: 0.05,
    actual: errorRate
  });
}

// Monitor performance degradation
if (responseTime > 2000) {
  analytics.track('performance_alert', {
    metric: 'response_time',
    threshold: 2000,
    actual: responseTime
  });
}
```

### **Dashboard Monitoring**
- Track dashboard load times
- Monitor user engagement
- Alert on data pipeline failures
- Track feature adoption

## 🚀 Next Steps

### **Immediate Actions**
1. Add analytics to existing components
2. Set up custom events for your use cases
3. Monitor dashboard performance
4. Gather user feedback

### **Advanced Features**
1. A/B testing framework
2. Cohort analysis
3. Funnel tracking
4. Custom segments

### **Integration Roadmap**
1. Email notifications
2. Slack alerts
3. External BI tools
4. Data warehouse export

---

## 💡 **Quick Start Checklist**

- [ ] Import `useAnalytics` in components
- [ ] Add page view tracking
- [ ] Track key user interactions
- [ ] Monitor performance metrics
- [ ] Set up error tracking
- [ ] Access analytics dashboard
- [ ] Review key insights
- [ ] Implement improvements

**The analytics system is ready to provide deep insights into your StackStudio application!** 🎉
