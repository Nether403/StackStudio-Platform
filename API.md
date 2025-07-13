# StackFast API Documentation

> Comprehensive API reference for the StackFast platform

## 🚀 Overview

The StackFast API provides programmatic access to our AI-powered tech stack recommendation engine, tool database, and analytics platform. All API endpoints are built with Next.js API routes and follow RESTful conventions.

**Base URL**: `https://your-domain.com/api`

## 🔐 Authentication

All protected endpoints require authentication via NextAuth.js sessions.

### Session Authentication
```typescript
// Client-side session access
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();

// API route session access
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // Protected endpoint logic
}
```

## 🛠️ Core API Endpoints

### 1. Stack Recommendations

#### Generate Stack Recommendations
```http
POST /api/recommendations
```

**Request Body:**
```typescript
interface RecommendationRequest {
  projectType: "web" | "mobile" | "desktop" | "api" | "data";
  teamSize: number;
  timeline: "rapid" | "standard" | "extended";
  budget: "minimal" | "moderate" | "flexible";
  complexity: "simple" | "moderate" | "complex";
  requirements?: {
    scalability?: "low" | "medium" | "high";
    performance?: "standard" | "high" | "critical";
    security?: "basic" | "standard" | "enterprise";
    compliance?: string[];
  };
  preferences?: {
    openSource?: boolean;
    cloudNative?: boolean;
    aiIntegration?: boolean;
    existingTools?: string[];
  };
}
```

**Response:**
```typescript
interface RecommendationResponse {
  recommendations: StackRecommendation[];
  metadata: {
    generatedAt: string;
    version: string;
    confidence: number;
    alternativeCount: number;
  };
}

interface StackRecommendation {
  id: string;
  name: string;
  description: string;
  confidence: number;
  estimatedCost: {
    monthly: number;
    annual: number;
    breakdown: CostBreakdown[];
  };
  tools: ToolSelection[];
  pros: string[];
  cons: string[];
  timeline: {
    setup: string;
    development: string;
    deployment: string;
  };
  complexity: {
    setup: number;
    maintenance: number;
    scaling: number;
  };
}
```

**Example Request:**
```bash
curl -X POST https://your-domain.com/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "web",
    "teamSize": 3,
    "timeline": "standard",
    "budget": "moderate",
    "complexity": "moderate",
    "requirements": {
      "scalability": "medium",
      "performance": "high"
    },
    "preferences": {
      "openSource": true,
      "cloudNative": true
    }
  }'
```

#### Get Recommendation Details
```http
GET /api/recommendations/{id}
```

**Response:**
```typescript
interface RecommendationDetails extends StackRecommendation {
  implementation: {
    setupSteps: SetupStep[];
    configuration: ConfigurationGuide[];
    bestPractices: string[];
    commonPitfalls: string[];
  };
  monitoring: {
    metrics: string[];
    alerts: AlertConfiguration[];
    dashboards: DashboardConfig[];
  };
  scaling: {
    triggers: ScalingTrigger[];
    strategies: ScalingStrategy[];
    costs: ScalingCosts[];
  };
}
```

### 2. Tool Database

#### Get All Tools
```http
GET /api/tools
```

**Query Parameters:**
- `category`: Filter by tool category
- `pricing`: Filter by pricing model
- `compatibility`: Filter by compatible technologies
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset

**Response:**
```typescript
interface ToolsResponse {
  tools: ToolProfile[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    categories: string[];
    pricingModels: string[];
    compatibilities: string[];
  };
}
```

#### Get Tool Details
```http
GET /api/tools/{id}
```

**Response:**
```typescript
interface ToolDetails extends ToolProfile {
  analytics: {
    popularityTrend: TrendData[];
    userSentiment: SentimentAnalysis;
    competitorComparison: ComparisonData[];
    marketShare: number;
  };
  integrations: {
    compatibleTools: ToolProfile[];
    commonCombinations: ToolCombination[];
    conflictingTools: string[];
  };
  resources: {
    documentation: Link[];
    tutorials: Link[];
    communityLinks: Link[];
    supportChannels: Link[];
  };
}
```

#### Search Tools
```http
GET /api/tools/search
```

**Query Parameters:**
- `q`: Search query
- `filters`: JSON string with filter criteria
- `sort`: Sort criteria (popularity, cost, name)
- `order`: Sort order (asc, desc)

### 3. Analytics

#### Get Analytics Dashboard
```http
GET /api/analytics/dashboard
```

**Response:**
```typescript
interface AnalyticsDashboard {
  overview: {
    totalRecommendations: number;
    uniqueUsers: number;
    popularTools: ToolPopularity[];
    trendsData: TrendData[];
  };
  tools: {
    mostRecommended: ToolUsage[];
    fastestGrowing: ToolGrowth[];
    costEffective: CostAnalysis[];
    highSatisfaction: SatisfactionData[];
  };
  users: {
    segmentation: UserSegment[];
    behavior: BehaviorAnalysis[];
    satisfaction: SatisfactionMetrics;
  };
  performance: {
    responseTime: PerformanceMetrics;
    errorRate: ErrorMetrics;
    uptime: UptimeData;
  };
}
```

#### Get Tool Analytics
```http
GET /api/analytics/tools/{id}
```

#### Get User Analytics
```http
GET /api/analytics/users
```

### 4. Project Management

#### Create Project
```http
POST /api/projects
```

**Request Body:**
```typescript
interface CreateProjectRequest {
  name: string;
  description?: string;
  recommendationId: string;
  customizations?: {
    selectedTools: string[];
    excludedTools: string[];
    budgetAdjustments: BudgetAdjustment[];
  };
}
```

#### Get User Projects
```http
GET /api/projects
```

#### Update Project
```http
PUT /api/projects/{id}
```

#### Delete Project
```http
DELETE /api/projects/{id}
```

### 5. Community Features

#### Get Community Insights
```http
GET /api/community/insights
```

#### Submit Tool Review
```http
POST /api/community/reviews
```

**Request Body:**
```typescript
interface ReviewRequest {
  toolId: string;
  rating: number; // 1-5
  review: string;
  useCase: string;
  teamSize: number;
  projectDuration: string;
  wouldRecommend: boolean;
  pros: string[];
  cons: string[];
}
```

#### Get Tool Reviews
```http
GET /api/community/reviews/{toolId}
```

### 6. Cost Analysis

#### Get Cost Projection
```http
POST /api/cost/projection
```

**Request Body:**
```typescript
interface CostProjectionRequest {
  tools: string[];
  usage: {
    users: number;
    requests: number;
    storage: number; // GB
    bandwidth: number; // GB
  };
  duration: number; // months
  scaling: {
    userGrowth: number; // percentage per month
    usageGrowth: number; // percentage per month
  };
}
```

**Response:**
```typescript
interface CostProjection {
  monthly: CostBreakdown[];
  annual: number;
  breakdown: {
    toolCosts: ToolCost[];
    infrastructureCosts: InfrastructureCost[];
    operationalCosts: OperationalCost[];
  };
  optimization: {
    suggestions: OptimizationSuggestion[];
    potentialSavings: number;
    riskLevel: "low" | "medium" | "high";
  };
}
```

## 🔄 Webhooks

### Recommendation Events
```http
POST /api/webhooks/recommendations
```

Subscribe to recommendation events for integration with external systems.

**Event Types:**
- `recommendation.created`
- `recommendation.used`
- `recommendation.rated`

**Payload:**
```typescript
interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
  signature: string; // HMAC signature for verification
}
```

## 📊 Response Formats

### Standard Response Structure
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}
```

### Error Response Codes
- **400**: Bad Request - Invalid request parameters
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Server error

## 🚀 SDK and Client Libraries

### JavaScript/TypeScript SDK
```bash
npm install @stackfast/sdk
```

```typescript
import { StackFastClient } from '@stackfast/sdk';

const client = new StackFastClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-domain.com/api'
});

// Generate recommendations
const recommendations = await client.recommendations.generate({
  projectType: 'web',
  teamSize: 3,
  timeline: 'standard'
});

// Get tool details
const tool = await client.tools.getById('react');

// Analyze costs
const costs = await client.cost.project({
  tools: ['react', 'nodejs', 'postgresql'],
  usage: { users: 1000, requests: 10000 }
});
```

### Python SDK
```bash
pip install stackfast-python
```

```python
from stackfast import StackFastClient

client = StackFastClient(
    api_key='your-api-key',
    base_url='https://your-domain.com/api'
)

# Generate recommendations
recommendations = client.recommendations.generate({
    'project_type': 'web',
    'team_size': 3,
    'timeline': 'standard'
})

# Get analytics
analytics = client.analytics.dashboard()
```

## 📈 Rate Limits

- **Free Tier**: 100 requests/hour
- **Pro Tier**: 1,000 requests/hour
- **Enterprise**: Custom limits

Rate limit headers:
- `X-RateLimit-Limit`: Request limit per hour
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## 🔧 Development Tools

### API Testing
```bash
# Health check
curl https://your-domain.com/api/health

# Get OpenAPI specification
curl https://your-domain.com/api/openapi.json
```

### Postman Collection
Import our Postman collection for easy API testing:
```
https://your-domain.com/api/postman-collection.json
```

## 📝 Examples

### Complete Workflow Example
```typescript
// 1. Generate recommendations
const recommendations = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectType: 'web',
    teamSize: 5,
    timeline: 'standard',
    budget: 'moderate'
  })
});

const { data: recs } = await recommendations.json();

// 2. Get detailed cost analysis
const costAnalysis = await fetch('/api/cost/projection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tools: recs[0].tools.map(t => t.id),
    usage: { users: 1000, requests: 50000 },
    duration: 12
  })
});

// 3. Create project
const project = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Web App',
    recommendationId: recs[0].id
  })
});
```

---

**For more detailed examples and advanced usage patterns, visit our [Developer Portal](https://docs.stackfast.dev).**
