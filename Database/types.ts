// Global TypeScript interfaces for StackStudio
// Centralized type definitions for consistent typing across the application

// Core Tool Profile Interface
export interface ToolProfile {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  version: string;
  compatibility: CompatibilityInfo;
  pricing: PricingInfo;
  features: string[];
  documentation_url: string;
  github_url?: string;
  npm_package?: string;
  installation_command?: string;
  configuration_complexity: 'low' | 'medium' | 'high';
  learning_curve: 'easy' | 'moderate' | 'steep';
  community_support: 'excellent' | 'good' | 'fair' | 'poor';
  last_updated: string;
  popularity_score: number;
  compatibility_score: number;
  recommendation_weight: number;
}

// Tool Categories
export type ToolCategory = 
  | 'frontend'
  | 'backend'
  | 'database'
  | 'api'
  | 'testing'
  | 'deployment'
  | 'monitoring'
  | 'analytics'
  | 'security'
  | 'devops'
  | 'mobile'
  | 'desktop'
  | 'ai_ml'
  | 'blockchain'
  | 'iot'
  | 'game_development'
  | 'data_science'
  | 'design'
  | 'productivity';

// Compatibility Information
export interface CompatibilityInfo {
  languages: string[];
  frameworks: string[];
  platforms: string[];
  operating_systems: string[];
  node_versions?: string[];
  browser_support?: string[];
  database_support?: string[];
  cloud_providers?: string[];
  integration_complexity: 'simple' | 'moderate' | 'complex';
  prerequisites: string[];
  conflicts_with?: string[];
}

// Pricing Information
export interface PricingInfo {
  model: 'free' | 'freemium' | 'paid' | 'enterprise' | 'usage_based';
  free_tier?: FreeTierInfo;
  paid_plans?: PaidPlanInfo[];
  enterprise_pricing?: string;
  baseline_cost: number; // Monthly cost in USD for typical usage
  cost_per_user?: number;
  cost_per_request?: number;
  cost_scaling_factor: number; // Multiplier for cost as usage increases
}

export interface FreeTierInfo {
  available: boolean;
  limitations: string[];
  monthly_limits?: {
    requests?: number;
    storage?: string;
    bandwidth?: string;
    users?: number;
  };
}

export interface PaidPlanInfo {
  name: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  features: string[];
  limits: {
    requests?: number;
    storage?: string;
    bandwidth?: string;
    users?: number;
  };
}

// Blueprint System Types
export interface Blueprint {
  id: string;
  name: string;
  description: string;
  tools: ToolRecommendation[];
  estimated_cost: CostProjection;
  complexity_score: number;
  development_time: TimeEstimate;
  warnings: Warning[];
  created_at: string;
  updated_at: string;
}

export interface ToolRecommendation {
  tool: ToolProfile;
  reason: string;
  priority: 'critical' | 'recommended' | 'optional';
  alternatives?: ToolProfile[];
  configuration_notes?: string;
  integration_complexity: 'simple' | 'moderate' | 'complex';
  compatibility_score: number;
}

export interface CostProjection {
  monthly_cost: number;
  yearly_cost: number;
  setup_cost: number;
  breakdown: CostBreakdown[];
  scaling_estimates: ScalingEstimate[];
  confidence_level: 'low' | 'medium' | 'high';
}

export interface CostBreakdown {
  category: string;
  tool_name: string;
  monthly_cost: number;
  yearly_cost: number;
  usage_assumptions: string[];
  scaling_factor: number;
}

export interface ScalingEstimate {
  user_count: number;
  monthly_cost: number;
  yearly_cost: number;
  bottlenecks: string[];
  optimization_suggestions: string[];
}

export interface TimeEstimate {
  setup_time: number; // hours
  development_time: number; // hours
  testing_time: number; // hours
  deployment_time: number; // hours
  total_time: number; // hours
  team_size_recommendation: number;
  skill_requirements: string[];
}

export interface Warning {
  type: 'compatibility' | 'cost' | 'complexity' | 'security' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  tools_affected: string[];
}

// Organizer System Types
export interface OrganizerBoard {
  id: string;
  boardId: string;
  userId: string;
  projectName: string;
  title: string;
  description: string;
  columnOrder: string[];
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
  blueprint_id?: string;
}

export interface OrganizerColumn {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  taskIds: string[];
  color: string;
  position: number;
  createdAt: any;
}

export interface OrganizerTask {
  id: string;
  taskId: string;
  boardId: string;
  columnId: string;
  content: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedHours: number;
  toolName: string;
  dependencies: string[];
  tags: string[];
  createdAt: any;
  updatedAt: any;
  completedAt?: any;
  assigned_to?: string;
  tool_profile_id?: string;
}

// Project Templates
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tools: ToolProfile[];
  configuration: TemplateConfiguration;
  estimated_cost: CostProjection;
  complexity_level: 'beginner' | 'intermediate' | 'advanced';
  use_cases: string[];
  prerequisites: string[];
  created_by: string;
  created_at: string;
  popularity_score: number;
  success_rate: number;
}

export interface TemplateConfiguration {
  required_tools: string[];
  optional_tools: string[];
  environment_variables: string[];
  configuration_files: ConfigurationFile[];
  deployment_steps: string[];
  testing_strategy: string[];
}

export interface ConfigurationFile {
  filename: string;
  content: string;
  description: string;
  is_template: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// Search and Filter Types
export interface SearchFilters {
  category?: ToolCategory[];
  pricing_model?: PricingInfo['model'][];
  compatibility_score?: number;
  popularity_score?: number;
  learning_curve?: ToolProfile['learning_curve'][];
  community_support?: ToolProfile['community_support'][];
  languages?: string[];
  frameworks?: string[];
  platforms?: string[];
}

export interface SearchResult {
  tools: ToolProfile[];
  total: number;
  filters_applied: SearchFilters;
  search_query?: string;
  suggestions?: string[];
}

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'premium';
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  last_login: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  preferred_languages: string[];
  preferred_frameworks: string[];
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  budget_range: 'low' | 'medium' | 'high' | 'unlimited';
  project_types: string[];
  notification_settings: NotificationSettings;
}

export interface NotificationSettings {
  email_notifications: boolean;
  project_updates: boolean;
  cost_alerts: boolean;
  new_tool_recommendations: boolean;
  security_alerts: boolean;
}

// Analytics and Metrics Types
export interface AnalyticsData {
  tool_usage: ToolUsageMetrics[];
  cost_trends: CostTrend[];
  project_success_rates: ProjectSuccessMetrics[];
  user_engagement: UserEngagementMetrics;
  performance_metrics: PerformanceMetrics;
}

export interface ToolUsageMetrics {
  tool_id: string;
  usage_count: number;
  success_rate: number;
  average_setup_time: number;
  user_satisfaction: number;
  common_issues: string[];
}

export interface CostTrend {
  date: string;
  average_cost: number;
  median_cost: number;
  cost_categories: CostCategoryBreakdown[];
}

export interface CostCategoryBreakdown {
  category: ToolCategory;
  percentage: number;
  average_cost: number;
}

export interface ProjectSuccessMetrics {
  template_id: string;
  success_rate: number;
  average_completion_time: number;
  common_blockers: string[];
  satisfaction_score: number;
}

export interface UserEngagementMetrics {
  daily_active_users: number;
  monthly_active_users: number;
  average_session_duration: number;
  feature_usage: FeatureUsage[];
  retention_rate: number;
}

export interface FeatureUsage {
  feature_name: string;
  usage_count: number;
  unique_users: number;
  average_time_spent: number;
}

export interface PerformanceMetrics {
  api_response_time: number;
  page_load_time: number;
  error_rate: number;
  uptime_percentage: number;
  cache_hit_rate: number;
}

// Export commonly used union types
export type Priority = 'High' | 'Medium' | 'Low';
export type Environment = 'development' | 'staging' | 'production';
export type Status = 'active' | 'inactive' | 'deprecated' | 'experimental';

// Re-export for convenience
export type { ToolProfile as Tool }; // Alias for backward compatibility
