/*
 * Hybrid AI + Rule-Based Stack Recommendation Engine
 * Combines AI intelligence with rule-based validation for optimal recommendations
 */

import { 
  calculateCostProjection, 
  analyzeProjectScale, 
  CostProjection,
  CostModel 
} from './cost-projection-engine';

import { 
  AIStackRecommendationService, 
  validateAIRecommendation 
} from './ai-stack-recommendation-service';

import { ToolProfile } from './stack-recommendation-engine';

interface EnhancedStackRecommendation {
  summary: string;
  aiAnalysis: {
    projectContext: any;
    reasoning: string;
    architectureAdvice: string;
    potentialChallenges: string[];
    learningPath: string[];
  };
  recommendedStack: Array<{
    name: string;
    category: string;
    reason: string;
    aiReason: string;
    compatibilityScore: number;
    priority: 'high' | 'medium' | 'low';
    alternativeTools: string[];
  }>;
  roadmap: Array<{
    phase: string;
    duration: string;
    tasks: string[];
    tools: string[];
  }>;
  costProjection: CostProjection;
  confidence: number;
}

export class HybridStackRecommendationEngine {
  private aiService?: AIStackRecommendationService;
  private toolProfiles: ToolProfile[];

  constructor(toolProfiles: ToolProfile[], aiApiKey?: string) {
    this.toolProfiles = toolProfiles;
    
    // Initialize AI service if API key is provided
    if (aiApiKey) {
      this.aiService = new AIStackRecommendationService(aiApiKey, toolProfiles);
    } else {
      // Try to get API key from environment based on provider
      const provider = process.env.AI_PROVIDER || 'gemini';
      let apiKey: string | undefined;
      
      switch (provider) {
        case 'gemini':
          apiKey = process.env.GEMINI_API_KEY;
          break;
        case 'openai':
          apiKey = process.env.OPENAI_API_KEY;
          break;
        case 'xai':
          apiKey = process.env.XAI_API_KEY;
          break;
      }

      if (apiKey) {
        this.aiService = new AIStackRecommendationService(apiKey, toolProfiles);
      }
    }
  }

  /**
   * Generate enhanced recommendations using AI + rule-based approach
   */
  async generateEnhancedRecommendation(
    projectIdea: string,
    skillProfile: { setup: number; daily: number },
    preferredToolIds: string[] = []
  ): Promise<EnhancedStackRecommendation> {
    try {
      // Try AI-powered recommendation first
      if (this.aiService) {
        return await this.generateAIEnhancedRecommendation(
          projectIdea,
          skillProfile,
          preferredToolIds
        );
      }
    } catch (error) {
      console.warn('AI recommendation failed, falling back to rule-based:', error);
    }

    // Fallback to rule-based recommendation
    return this.generateRuleBasedRecommendation(
      projectIdea,
      skillProfile,
      preferredToolIds
    );
  }

  /**
   * AI-powered recommendation with rule-based validation
   */
  private async generateAIEnhancedRecommendation(
    projectIdea: string,
    skillProfile: { setup: number; daily: number },
    preferredToolIds: string[]
  ): Promise<EnhancedStackRecommendation> {
    if (!this.aiService) {
      throw new Error('AI service not initialized');
    }

    // Step 1: Parse project idea with AI
    const projectContext = await this.aiService.parseProjectIdea(projectIdea);
    
    // Step 2: Get AI recommendations
    const aiRecommendation = await this.aiService.generateAIRecommendations(
      projectContext,
      skillProfile,
      preferredToolIds
    );

    // Step 3: Validate AI recommendations against available tools
    const validatedRecommendation = validateAIRecommendation(
      aiRecommendation,
      this.toolProfiles
    );

    // Step 4: Apply rule-based scoring for compatibility validation
    const enhancedTools = validatedRecommendation.recommendedTools
      .map(aiTool => {
        const toolProfile = this.toolProfiles.find(t => t.id === aiTool.toolId);
        
        if (!toolProfile) {
          return null;
        }

        // Calculate compatibility score using rule-based system
        const compatibilityScore = this.calculateCompatibilityScore(
          toolProfile,
          skillProfile,
          projectContext
        );

        return {
          name: toolProfile.name,
          category: toolProfile.category,
          reason: this.generateRuleBasedReason(toolProfile, projectContext),
          aiReason: aiTool.reason,
          compatibilityScore,
          priority: aiTool.priority,
          alternativeTools: aiTool.alternativeTools
        };
      })
      .filter((tool): tool is NonNullable<typeof tool> => tool !== null);

    // Step 5: Calculate cost projection
    const recommendedTools = enhancedTools.map(tool => 
      this.toolProfiles.find(t => t.name === tool.name)!
    );
    
    const costProjection = calculateCostProjection(
      recommendedTools,
      analyzeProjectScale(projectIdea, skillProfile)
    );

    // Step 6: Calculate confidence score
    const confidence = this.calculateConfidenceScore(
      enhancedTools,
      validatedRecommendation,
      projectContext
    );

    return {
      summary: this.generateSummary(enhancedTools, projectContext),
      aiAnalysis: {
        projectContext,
        reasoning: validatedRecommendation.reasoning,
        architectureAdvice: validatedRecommendation.architectureAdvice,
        potentialChallenges: validatedRecommendation.potentialChallenges,
        learningPath: validatedRecommendation.learningPath
      },
      recommendedStack: enhancedTools,
      roadmap: validatedRecommendation.roadmap,
      costProjection,
      confidence
    };
  }

  /**
   * Rule-based recommendation as fallback
   */
  private generateRuleBasedRecommendation(
    projectIdea: string,
    skillProfile: { setup: number; daily: number },
    preferredToolIds: string[]
  ): EnhancedStackRecommendation {
    // Simplified project analysis
    const projectContext = this.analyzeProjectSimple(projectIdea);
    
    // Score all tools
    const scoredTools = this.toolProfiles.map(tool => ({
      tool,
      score: this.calculateCompatibilityScore(tool, skillProfile, projectContext)
    }));

    // Sort by score and take top recommendations
    const topTools = scoredTools
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ tool, score }) => ({
        name: tool.name,
        category: tool.category,
        reason: this.generateRuleBasedReason(tool, projectContext),
        aiReason: 'Rule-based recommendation',
        compatibilityScore: score,
        priority: (score > 0.8 ? 'high' : score > 0.6 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
        alternativeTools: []
      }));

    // Calculate cost projection
    const costProjection = calculateCostProjection(
      topTools.map(t => this.toolProfiles.find(tool => tool.name === t.name)!),
      analyzeProjectScale(projectIdea, skillProfile)
    );

    return {
      summary: this.generateSummary(topTools, projectContext),
      aiAnalysis: {
        projectContext,
        reasoning: 'Rule-based analysis without AI enhancement',
        architectureAdvice: 'Consider implementing in phases, starting with core features',
        potentialChallenges: ['Tool compatibility', 'Learning curve', 'Scaling considerations'],
        learningPath: ['Start with most familiar tools', 'Learn incrementally', 'Practice with small projects']
      },
      recommendedStack: topTools,
      roadmap: this.generateBasicRoadmap(topTools),
      costProjection,
      confidence: 0.7
    };
  }

  /**
   * Calculate compatibility score using rule-based logic
   */
  private calculateCompatibilityScore(
    tool: ToolProfile,
    skillProfile: { setup: number; daily: number },
    projectContext: any
  ): number {
    let score = 0;

    // Base popularity score
    score += tool.popularity_score * 0.3;

    // Skill compatibility
    const skillSetup = tool.skills?.setup || 1;
    const skillDaily = tool.skills?.daily || 1;
    
    const skillCompatibility = Math.min(
      skillProfile.setup / skillSetup,
      skillProfile.daily / skillDaily
    );
    score += skillCompatibility * 0.3;

    // Community sentiment
    const sentimentScore = tool.community_sentiment === 'highly_positive' ? 0.2 :
                          tool.community_sentiment === 'positive' ? 0.15 : 0.1;
    score += sentimentScore;

    // Project type compatibility
    if (projectContext.projectType && tool.category) {
      const categoryMatch = this.getCategoryMatch(tool.category, projectContext.projectType);
      score += categoryMatch * 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Get category match score
   */
  private getCategoryMatch(toolCategory: string, projectType: string): number {
    const matches: Record<string, string[]> = {
      'frontend': ['web-app', 'mobile-app'],
      'backend': ['web-app', 'api', 'mobile-app'],
      'database': ['web-app', 'api', 'mobile-app', 'data-pipeline'],
      'deployment': ['web-app', 'api', 'mobile-app'],
      'ai_development': ['web-app', 'api'],
      'no_code': ['web-app', 'mobile-app'],
      'development_tools': ['web-app', 'api', 'mobile-app', 'desktop-app']
    };

    return matches[toolCategory]?.includes(projectType) ? 1.0 : 0.3;
  }

  /**
   * Generate rule-based reason
   */
  private generateRuleBasedReason(tool: ToolProfile, projectContext: any): string {
    const reasons = [];
    
    if (tool.popularity_score > 0.8) {
      reasons.push('highly popular in the community');
    }
    
    if (tool.pricing_model === 'freemium') {
      reasons.push('offers free tier for getting started');
    }
    
    if (tool.skills?.setup <= 2) {
      reasons.push('easy to set up');
    }
    
    if (tool.community_sentiment === 'highly_positive') {
      reasons.push('strong community support');
    }

    return reasons.length > 0 ? 
      `Recommended because it's ${reasons.join(', ')}.` :
      'Good fit for your project requirements.';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidenceScore(
    tools: any[],
    aiRecommendation: any,
    projectContext: any
  ): number {
    let confidence = 0.5; // Base confidence

    // More tools = higher confidence
    confidence += Math.min(tools.length * 0.05, 0.2);

    // AI recommendation quality
    if (aiRecommendation.reasoning.length > 100) {
      confidence += 0.1;
    }

    // Project context completeness
    if (projectContext.features && projectContext.features.length > 0) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate summary
   */
  private generateSummary(tools: any[], projectContext: any): string {
    const toolNames = tools.slice(0, 5).map(t => t.name).join(', ');
    const projectType = projectContext.projectType || 'application';
    
    return `Recommended tech stack for your ${projectType}: ${toolNames}. This combination provides a good balance of functionality, ease of use, and community support.`;
  }

  /**
   * Simple project analysis fallback
   */
  private analyzeProjectSimple(projectIdea: string): any {
    const idea = projectIdea.toLowerCase();
    
    return {
      projectType: idea.includes('api') ? 'api' : 
                   idea.includes('mobile') ? 'mobile-app' : 'web-app',
      complexity: idea.includes('complex') ? 'complex' : 'medium',
      features: ['basic functionality'],
      authNeeds: idea.includes('auth') || idea.includes('login')
    };
  }

  /**
   * Generate basic roadmap
   */
  private generateBasicRoadmap(tools: any[]): any[] {
    return [
      {
        phase: 'Setup & Planning',
        duration: '1-2 weeks',
        tasks: ['Set up development environment', 'Plan architecture', 'Create project structure'],
        tools: tools.filter(t => t.category === 'development_tools').map(t => t.name)
      },
      {
        phase: 'Core Development',
        duration: '4-6 weeks',
        tasks: ['Implement core features', 'Set up database', 'Create API endpoints'],
        tools: tools.filter(t => ['frontend', 'backend', 'database'].includes(t.category)).map(t => t.name)
      },
      {
        phase: 'Deployment & Testing',
        duration: '1-2 weeks',
        tasks: ['Deploy to production', 'Set up monitoring', 'Perform testing'],
        tools: tools.filter(t => t.category === 'deployment').map(t => t.name)
      }
    ];
  }
}

/**
 * Main function for the API (maintains backward compatibility)
 */
export async function generateEnhancedBlueprint(
  input: {
    projectIdea: string;
    skillProfile: { setup: number; daily: number };
    preferredToolIds: string[];
  },
  toolProfiles: ToolProfile[]
): Promise<EnhancedStackRecommendation> {
  const engine = new HybridStackRecommendationEngine(
    toolProfiles,
    process.env.OPENAI_API_KEY || process.env.AI_API_KEY
  );
  
  return await engine.generateEnhancedRecommendation(
    input.projectIdea,
    input.skillProfile,
    input.preferredToolIds
  );
}
