// Enhanced Cost Estimator with Real Data Integration
// Wires the cost projection system to actual tool pricing data

import { 
  ToolProfile, 
  CostProjection, 
  CostBreakdown, 
  ScalingEstimate, 
  PricingInfo 
} from '../Database/types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

export interface EnhancedCostProjection extends CostProjection {
  cached_at: string;
  data_freshness: 'fresh' | 'stale' | 'outdated';
  pricing_sources: string[];
  confidence_factors: ConfidenceFactor[];
}

export interface ConfidenceFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export class CostEstimator {
  private cache: Map<string, EnhancedCostProjection> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Calculate cost projection using real tool pricing data
   */
  async calculateProjectCost(
    tools: ToolProfile[], 
    projectScale: ProjectScale,
    userCount: number = 1,
    useCache: boolean = true
  ): Promise<EnhancedCostProjection> {
    const cacheKey = this.generateCacheKey(tools, projectScale, userCount);
    
    // Check cache first
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (this.isCacheFresh(cached)) {
        return cached;
      }
    }

    // Calculate fresh projection
    const projection = await this.computeCostProjection(tools, projectScale, userCount);
    
    // Cache the result
    this.cache.set(cacheKey, projection);
    
    // Store in Firestore for persistence
    await this.storeCostProjection(cacheKey, projection);
    
    return projection;
  }

  /**
   * Compute cost projection from tool pricing data
   */
  private async computeCostProjection(
    tools: ToolProfile[], 
    projectScale: ProjectScale,
    userCount: number
  ): Promise<EnhancedCostProjection> {
    const breakdown: CostBreakdown[] = [];
    const scalingEstimates: ScalingEstimate[] = [];
    const confidenceFactors: ConfidenceFactor[] = [];
    const pricingSources: string[] = [];
    
    let totalMonthlyCost = 0;
    let totalYearlyCost = 0;
    let totalSetupCost = 0;

    // Calculate costs for each tool
    for (const tool of tools) {
      const toolCost = await this.calculateToolCost(tool, projectScale, userCount);
      breakdown.push(toolCost);
      
      totalMonthlyCost += toolCost.monthly_cost;
      totalYearlyCost += toolCost.yearly_cost;
      
      // Track pricing sources
      if (tool.pricing.baseline_cost > 0) {
        pricingSources.push(tool.name);
      }
      
      // Add confidence factors
      confidenceFactors.push({
        factor: `${tool.name} pricing accuracy`,
        impact: tool.pricing.baseline_cost > 0 ? 'positive' : 'negative',
        weight: tool.recommendation_weight || 1,
        description: tool.pricing.baseline_cost > 0 
          ? 'Accurate pricing data available' 
          : 'Pricing data estimated'
      });
    }

    // Generate scaling estimates
    const scalingPoints = [1, 10, 100, 1000, 10000];
    for (const users of scalingPoints) {
      const scaledCost = this.calculateScaledCost(breakdown, users, projectScale);
      scalingEstimates.push({
        user_count: users,
        monthly_cost: scaledCost.monthly,
        yearly_cost: scaledCost.yearly,
        bottlenecks: scaledCost.bottlenecks,
        optimization_suggestions: scaledCost.optimizations
      });
    }

    // Calculate confidence level
    const confidenceLevel = this.calculateConfidenceLevel(confidenceFactors);

    return {
      monthly_cost: Math.round(totalMonthlyCost * 100) / 100,
      yearly_cost: Math.round(totalYearlyCost * 100) / 100,
      setup_cost: totalSetupCost,
      breakdown,
      scaling_estimates: scalingEstimates,
      confidence_level: confidenceLevel,
      cached_at: new Date().toISOString(),
      data_freshness: 'fresh',
      pricing_sources: pricingSources,
      confidence_factors: confidenceFactors
    };
  }

  /**
   * Calculate cost for individual tool using real pricing data
   */
  private async calculateToolCost(
    tool: ToolProfile, 
    projectScale: ProjectScale,
    userCount: number
  ): Promise<CostBreakdown> {
    const { pricing } = tool;
    let monthlyCost = 0;
    let yearlyCost = 0;
    let usageAssumptions: string[] = [];
    let scalingFactor = 1;

    // Use baseline cost from real data
    if (pricing.baseline_cost > 0) {
      monthlyCost = pricing.baseline_cost;
      
      // Apply scaling based on project characteristics
      if (projectScale.complexity === 'complex') {
        scalingFactor *= 1.5;
        usageAssumptions.push('Complex project requires higher tier');
      }
      
      if (projectScale.expectedTraffic === 'high') {
        scalingFactor *= 2;
        usageAssumptions.push('High traffic increases usage costs');
      }
      
      // Apply user-based scaling
      if (pricing.cost_per_user && userCount > 1) {
        monthlyCost += pricing.cost_per_user * (userCount - 1);
        usageAssumptions.push(`${userCount} users`);
      }
      
      // Apply overall scaling factor
      monthlyCost *= scalingFactor * pricing.cost_scaling_factor;
    } else {
      // Fallback estimation when no pricing data available
      monthlyCost = this.estimateToolCost(tool, projectScale, userCount);
      usageAssumptions.push('Cost estimated based on category and complexity');
    }

    // Calculate yearly cost with potential discount
    yearlyCost = monthlyCost * 12;
    if (pricing.paid_plans?.some(plan => plan.billing_period === 'yearly')) {
      yearlyCost *= 0.85; // Typical 15% yearly discount
      usageAssumptions.push('Yearly discount applied');
    }

    return {
      category: tool.category,
      tool_name: tool.name,
      monthly_cost: Math.round(monthlyCost * 100) / 100,
      yearly_cost: Math.round(yearlyCost * 100) / 100,
      usage_assumptions: usageAssumptions,
      scaling_factor: scalingFactor
    };
  }

  /**
   * Estimate cost when no pricing data available
   */
  private estimateToolCost(
    tool: ToolProfile, 
    projectScale: ProjectScale,
    userCount: number
  ): number {
    // Category-based cost estimation
    const categoryBaseCosts = {
      'frontend': 0,     // Usually free frameworks
      'backend': 20,     // Hosting costs
      'database': 15,    // Database hosting
      'api': 10,         // API services
      'testing': 5,      // Testing services
      'deployment': 25,  // CI/CD and hosting
      'monitoring': 15,  // Monitoring services
      'analytics': 20,   // Analytics platforms
      'security': 30,    // Security tools
      'devops': 40,      // DevOps platforms
      'mobile': 10,      // Mobile development
      'desktop': 5,      // Desktop frameworks
      'ai_ml': 50,       // AI/ML services
      'blockchain': 30,  // Blockchain platforms
      'iot': 25,         // IoT platforms
      'game_development': 15,
      'data_science': 35,
      'design': 20,
      'productivity': 10
    };

    const baseCost = categoryBaseCosts[tool.category] || 20;
    
    // Apply complexity multiplier
    const complexityMultiplier = {
      'simple': 0.5,
      'medium': 1,
      'complex': 2
    };
    
    return baseCost * complexityMultiplier[projectScale.complexity] * userCount;
  }

  /**
   * Calculate scaled costs for different user counts
   */
  private calculateScaledCost(
    breakdown: CostBreakdown[],
    targetUsers: number,
    projectScale: ProjectScale
  ): {
    monthly: number;
    yearly: number;
    bottlenecks: string[];
    optimizations: string[];
  } {
    let scaledMonthly = 0;
    const bottlenecks: string[] = [];
    const optimizations: string[] = [];

    for (const item of breakdown) {
      let itemCost = item.monthly_cost;
      
      // Apply user-based scaling
      if (targetUsers > 1) {
        itemCost *= Math.sqrt(targetUsers); // Sublinear scaling
      }
      
      // Identify bottlenecks at scale
      if (targetUsers > 1000 && item.category === 'database') {
        bottlenecks.push('Database may require sharding or clustering');
        itemCost *= 1.5;
      }
      
      if (targetUsers > 10000 && item.category === 'backend') {
        bottlenecks.push('Backend may require microservices architecture');
        itemCost *= 2;
      }
      
      scaledMonthly += itemCost;
    }

    // Add optimization suggestions
    if (targetUsers > 100) {
      optimizations.push('Consider CDN for static assets');
      optimizations.push('Implement caching strategy');
    }
    
    if (targetUsers > 1000) {
      optimizations.push('Consider database read replicas');
      optimizations.push('Implement auto-scaling');
    }

    return {
      monthly: Math.round(scaledMonthly * 100) / 100,
      yearly: Math.round(scaledMonthly * 12 * 100) / 100,
      bottlenecks,
      optimizations
    };
  }

  /**
   * Calculate confidence level based on available data
   */
  private calculateConfidenceLevel(factors: ConfidenceFactor[]): 'low' | 'medium' | 'high' {
    const positiveWeight = factors
      .filter(f => f.impact === 'positive')
      .reduce((sum, f) => sum + f.weight, 0);
    
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    
    const confidence = positiveWeight / totalWeight;
    
    if (confidence > 0.8) return 'high';
    if (confidence > 0.5) return 'medium';
    return 'low';
  }

  /**
   * Generate cache key for cost projection
   */
  private generateCacheKey(
    tools: ToolProfile[], 
    projectScale: ProjectScale,
    userCount: number
  ): string {
    const toolIds = tools.map(t => t.id).sort().join(',');
    const scaleKey = `${projectScale.complexity}-${projectScale.expectedTraffic}-${userCount}`;
    return `cost-${toolIds}-${scaleKey}`;
  }

  /**
   * Check if cached projection is still fresh
   */
  private isCacheFresh(projection: EnhancedCostProjection): boolean {
    const cachedAt = new Date(projection.cached_at);
    const now = new Date();
    return (now.getTime() - cachedAt.getTime()) < this.CACHE_DURATION;
  }

  /**
   * Store cost projection in Firestore
   */
  private async storeCostProjection(
    cacheKey: string, 
    projection: EnhancedCostProjection
  ): Promise<void> {
    try {
      const docRef = doc(db, 'cost_projections', cacheKey);
      await setDoc(docRef, projection);
    } catch (error) {
      console.error('Failed to store cost projection:', error);
    }
  }

  /**
   * Load cost projection from Firestore
   */
  private async loadCostProjection(cacheKey: string): Promise<EnhancedCostProjection | null> {
    try {
      const docRef = doc(db, 'cost_projections', cacheKey);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as EnhancedCostProjection;
      }
    } catch (error) {
      console.error('Failed to load cost projection:', error);
    }
    
    return null;
  }

  /**
   * Update tool pricing data in the database
   */
  async updateToolPricing(toolId: string, pricing: PricingInfo): Promise<void> {
    try {
      const toolsRef = collection(db, 'tools');
      const q = query(toolsRef, where('id', '==', toolId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await setDoc(docRef, { pricing }, { merge: true });
      }
    } catch (error) {
      console.error('Failed to update tool pricing:', error);
    }
  }
}

// Export interfaces for compatibility
export interface ProjectScale {
  complexity: 'simple' | 'medium' | 'complex';
  expectedUsers: number;
  expectedTraffic: 'low' | 'medium' | 'high';
  features: string[];
  timeline: 'prototype' | 'mvp' | 'production';
}

// Export singleton instance
export const costEstimator = new CostEstimator();
export default costEstimator;
