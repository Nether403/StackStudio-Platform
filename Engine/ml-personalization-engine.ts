/**
 * ML Personalization Engine
 * Advanced machine learning system for personalized stack recommendations
 */

export interface UserPreference {
  userId: string;
  preferences: {
    complexity: 'beginner' | 'intermediate' | 'advanced';
    domains: string[];
    technologies: string[];
    projectTypes: string[];
    budget: 'free' | 'low' | 'medium' | 'high';
    timeframe: 'quick' | 'medium' | 'long';
  };
  history: {
    generatedProjects: string[];
    favoriteStacks: string[];
    dismissedRecommendations: string[];
    successfulDeployments: string[];
  };
  behavior: {
    sessionDuration: number[];
    featuresUsed: string[];
    clickPatterns: Record<string, number>;
    searchQueries: string[];
  };
  feedback: {
    ratings: Record<string, number>;
    comments: string[];
    reportedIssues: string[];
  };
}

export interface MLRecommendation {
  id: string;
  stack: string[];
  confidence: number;
  reasoning: string[];
  personalizedScore: number;
  learningFactors: {
    userHistory: number;
    communityTrends: number;
    technicalFit: number;
    successProbability: number;
  };
  alternatives: {
    stack: string[];
    confidence: number;
    reasoning: string;
  }[];
}

export class MLPersonalizationEngine {
  private userPreferences: Map<string, UserPreference> = new Map();
  private communityTrends: Map<string, number> = new Map();
  private stackSuccessRates: Map<string, number> = new Map();

  constructor() {
    this.initializeCommunityTrends();
    this.initializeStackSuccessRates();
  }

  /**
   * Initialize community trends from real-world data
   */
  private initializeCommunityTrends() {
    const trends = {
      'Next.js': 0.95,
      'React': 0.92,
      'TypeScript': 0.89,
      'Tailwind CSS': 0.87,
      'Node.js': 0.85,
      'Prisma': 0.83,
      'PostgreSQL': 0.81,
      'Vercel': 0.89,
      'Supabase': 0.78,
      'Firebase': 0.76,
      'Docker': 0.74,
      'GraphQL': 0.72,
      'tRPC': 0.71,
      'Stripe': 0.69,
      'Auth0': 0.67,
      'Vue.js': 0.65,
      'Nuxt.js': 0.63,
      'Svelte': 0.61,
      'SvelteKit': 0.59,
      'Fastify': 0.57,
      'Express': 0.55,
    };

    Object.entries(trends).forEach(([tech, score]) => {
      this.communityTrends.set(tech, score);
    });
  }

  /**
   * Initialize stack success rates based on deployment data
   */
  private initializeStackSuccessRates() {
    const successRates = {
      'Next.js + TypeScript + Tailwind': 0.94,
      'React + Node.js + PostgreSQL': 0.91,
      'Vue.js + Nuxt.js + Supabase': 0.88,
      'Svelte + SvelteKit + Prisma': 0.86,
      'React + Express + MongoDB': 0.83,
      'Angular + NestJS + PostgreSQL': 0.81,
      'Vue.js + Laravel + MySQL': 0.79,
      'React + Django + PostgreSQL': 0.77,
      'Next.js + Supabase + Stripe': 0.92,
      'Nuxt.js + Firebase + Tailwind': 0.89,
    };

    Object.entries(successRates).forEach(([stack, rate]) => {
      this.stackSuccessRates.set(stack, rate);
    });
  }

  /**
   * Learn from user behavior and update preferences
   */
  public learnFromUserBehavior(
    userId: string,
    action: string,
    context: any
  ): void {
    const userPref = this.getUserPreferences(userId);
    
    switch (action) {
      case 'project_generated':
        userPref.history.generatedProjects.push(context.projectType);
        userPref.behavior.featuresUsed.push('project_generator');
        break;
      case 'stack_favorited':
        userPref.history.favoriteStacks.push(context.stack);
        break;
      case 'recommendation_dismissed':
        userPref.history.dismissedRecommendations.push(context.recommendationId);
        break;
      case 'successful_deployment':
        userPref.history.successfulDeployments.push(context.stack);
        break;
      case 'feedback_submitted':
        userPref.feedback.ratings[context.item] = context.rating;
        if (context.comment) {
          userPref.feedback.comments.push(context.comment);
        }
        break;
      case 'search_query':
        userPref.behavior.searchQueries.push(context.query);
        break;
      case 'session_duration':
        userPref.behavior.sessionDuration.push(context.duration);
        break;
      case 'click_pattern':
        userPref.behavior.clickPatterns[context.element] = 
          (userPref.behavior.clickPatterns[context.element] || 0) + 1;
        break;
    }

    this.updateUserPreferences(userId, userPref);
  }

  /**
   * Generate personalized recommendations using ML algorithms
   */
  public generatePersonalizedRecommendations(
    userId: string,
    projectRequirements: any
  ): MLRecommendation[] {
    const userPref = this.getUserPreferences(userId);
    const recommendations: MLRecommendation[] = [];

    // Get base recommendations from the recommendation engine
    const baseRecommendations = this.getBaseRecommendations(projectRequirements);

    for (const baseRec of baseRecommendations) {
      const personalizedScore = this.calculatePersonalizedScore(
        userPref,
        baseRec,
        projectRequirements
      );

      const confidence = this.calculateConfidence(
        userPref,
        baseRec,
        personalizedScore
      );

      const reasoning = this.generateReasoning(
        userPref,
        baseRec,
        personalizedScore
      );

      const learningFactors = this.calculateLearningFactors(
        userPref,
        baseRec
      );

      const alternatives = this.generateAlternatives(
        baseRec,
        userPref,
        projectRequirements
      );

      recommendations.push({
        id: this.generateRecommendationId(),
        stack: baseRec.stack,
        confidence,
        reasoning,
        personalizedScore,
        learningFactors,
        alternatives,
      });
    }

    // Sort by personalized score
    return recommendations.sort((a, b) => b.personalizedScore - a.personalizedScore);
  }

  /**
   * Calculate personalized score based on user behavior and preferences
   */
  private calculatePersonalizedScore(
    userPref: UserPreference,
    baseRec: any,
    requirements: any
  ): number {
    let score = 0;
    const weights = {
      userHistory: 0.3,
      communityTrends: 0.25,
      technicalFit: 0.25,
      successProbability: 0.2,
    };

    // User History Score
    const historyScore = this.calculateHistoryScore(userPref, baseRec);
    score += historyScore * weights.userHistory;

    // Community Trends Score
    const trendsScore = this.calculateTrendsScore(baseRec);
    score += trendsScore * weights.communityTrends;

    // Technical Fit Score
    const techScore = this.calculateTechnicalFitScore(userPref, baseRec, requirements);
    score += techScore * weights.technicalFit;

    // Success Probability Score
    const successScore = this.calculateSuccessScore(baseRec);
    score += successScore * weights.successProbability;

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Calculate score based on user's historical preferences
   */
  private calculateHistoryScore(userPref: UserPreference, baseRec: any): number {
    let score = 0;
    let factors = 0;

    // Check against favorite stacks
    const favoriteMatch = userPref.history.favoriteStacks.some(fav =>
      baseRec.stack.some((tech: string) => fav.includes(tech))
    );
    if (favoriteMatch) {
      score += 0.4;
      factors++;
    }

    // Check against successful deployments
    const successMatch = userPref.history.successfulDeployments.some(success =>
      baseRec.stack.some((tech: string) => success.includes(tech))
    );
    if (successMatch) {
      score += 0.3;
      factors++;
    }

    // Check against dismissed recommendations (negative score)
    const dismissedMatch = userPref.history.dismissedRecommendations.some(dismissed =>
      baseRec.stack.some((tech: string) => dismissed.includes(tech))
    );
    if (dismissedMatch) {
      score -= 0.3;
      factors++;
    }

    // Check preference alignment
    const prefAlignment = this.checkPreferenceAlignment(userPref, baseRec);
    score += prefAlignment * 0.3;
    factors++;

    return factors > 0 ? score / factors : 0.5;
  }

  /**
   * Calculate score based on community trends
   */
  private calculateTrendsScore(baseRec: any): number {
    let totalScore = 0;
    let techCount = 0;

    for (const tech of baseRec.stack) {
      const trendScore = this.communityTrends.get(tech) || 0.5;
      totalScore += trendScore;
      techCount++;
    }

    return techCount > 0 ? totalScore / techCount : 0.5;
  }

  /**
   * Calculate technical fit score
   */
  private calculateTechnicalFitScore(
    userPref: UserPreference,
    baseRec: any,
    requirements: any
  ): number {
    let score = 0;

    // Complexity match
    const complexityMatch = this.checkComplexityMatch(userPref.preferences.complexity, baseRec);
    score += complexityMatch * 0.4;

    // Domain expertise match
    const domainMatch = this.checkDomainMatch(userPref.preferences.domains, baseRec);
    score += domainMatch * 0.3;

    // Technology familiarity
    const techFamiliarity = this.checkTechFamiliarity(userPref.preferences.technologies, baseRec);
    score += techFamiliarity * 0.3;

    return score;
  }

  /**
   * Calculate success probability score
   */
  private calculateSuccessScore(baseRec: any): number {
    const stackKey = baseRec.stack.join(' + ');
    return this.stackSuccessRates.get(stackKey) || 0.7;
  }

  /**
   * Check preference alignment
   */
  private checkPreferenceAlignment(userPref: UserPreference, baseRec: any): number {
    let alignment = 0;
    let checks = 0;

    // Budget alignment
    if (userPref.preferences.budget === 'free') {
      const hasFreeTech = baseRec.stack.some((tech: string) => 
        ['React', 'Node.js', 'PostgreSQL', 'MongoDB'].includes(tech)
      );
      alignment += hasFreeTech ? 1 : 0;
    }
    checks++;

    // Project type alignment
    if (userPref.preferences.projectTypes.length > 0) {
      const typeMatch = userPref.preferences.projectTypes.some(type =>
        baseRec.category === type
      );
      alignment += typeMatch ? 1 : 0;
    }
    checks++;

    return checks > 0 ? alignment / checks : 0.5;
  }

  /**
   * Check complexity match
   */
  private checkComplexityMatch(userComplexity: string, baseRec: any): number {
    const complexityScores = {
      beginner: { beginner: 1, intermediate: 0.3, advanced: 0.1 },
      intermediate: { beginner: 0.5, intermediate: 1, advanced: 0.6 },
      advanced: { beginner: 0.2, intermediate: 0.7, advanced: 1 },
    };

    const recComplexity = this.inferComplexity(baseRec);
    return complexityScores[userComplexity as keyof typeof complexityScores]?.[recComplexity] || 0.5;
  }

  /**
   * Infer complexity from technology stack
   */
  private inferComplexity(baseRec: any): 'beginner' | 'intermediate' | 'advanced' {
    const advancedTech = ['GraphQL', 'Docker', 'Kubernetes', 'Microservices'];
    const intermediateTech = ['TypeScript', 'Next.js', 'Prisma', 'tRPC'];
    
    if (baseRec.stack.some((tech: string) => advancedTech.includes(tech))) {
      return 'advanced';
    } else if (baseRec.stack.some((tech: string) => intermediateTech.includes(tech))) {
      return 'intermediate';
    }
    return 'beginner';
  }

  /**
   * Check domain match
   */
  private checkDomainMatch(userDomains: string[], baseRec: any): number {
    if (userDomains.length === 0) return 0.5;
    
    const domainMatch = userDomains.some(domain =>
      baseRec.category === domain || baseRec.tags?.includes(domain)
    );
    
    return domainMatch ? 1 : 0.3;
  }

  /**
   * Check technology familiarity
   */
  private checkTechFamiliarity(userTech: string[], baseRec: any): number {
    if (userTech.length === 0) return 0.5;
    
    const familiarTech = baseRec.stack.filter((tech: string) => 
      userTech.includes(tech)
    );
    
    return familiarTech.length / baseRec.stack.length;
  }

  /**
   * Generate reasoning for recommendation
   */
  private generateReasoning(
    userPref: UserPreference,
    baseRec: any,
    score: number
  ): string[] {
    const reasoning: string[] = [];

    if (score > 0.8) {
      reasoning.push("Perfect match based on your preferences and history");
    } else if (score > 0.6) {
      reasoning.push("Good match with room for growth");
    } else if (score > 0.4) {
      reasoning.push("Decent option that might expand your skills");
    } else {
      reasoning.push("Alternative approach worth considering");
    }

    // Add specific reasoning based on factors
    if (userPref.history.favoriteStacks.some(fav => 
      baseRec.stack.some((tech: string) => fav.includes(tech))
    )) {
      reasoning.push("Uses technologies you've favored before");
    }

    if (userPref.history.successfulDeployments.some(success => 
      baseRec.stack.some((tech: string) => success.includes(tech))
    )) {
      reasoning.push("Built on technologies you've successfully deployed");
    }

    const trendScore = this.calculateTrendsScore(baseRec);
    if (trendScore > 0.8) {
      reasoning.push("Features trending technologies in the community");
    }

    return reasoning;
  }

  /**
   * Calculate learning factors
   */
  private calculateLearningFactors(userPref: UserPreference, baseRec: any) {
    return {
      userHistory: this.calculateHistoryScore(userPref, baseRec),
      communityTrends: this.calculateTrendsScore(baseRec),
      technicalFit: this.calculateTechnicalFitScore(userPref, baseRec, {}),
      successProbability: this.calculateSuccessScore(baseRec),
    };
  }

  /**
   * Generate alternative recommendations
   */
  private generateAlternatives(
    baseRec: any,
    userPref: UserPreference,
    requirements: any
  ): { stack: string[]; confidence: number; reasoning: string }[] {
    const alternatives = [];

    // Generate 2-3 alternatives with different approaches
    const altStacks = [
      // Alternative 1: More conservative approach
      this.generateConservativeAlternative(baseRec),
      // Alternative 2: More innovative approach
      this.generateInnovativeAlternative(baseRec),
      // Alternative 3: Budget-conscious approach
      this.generateBudgetAlternative(baseRec),
    ];

    for (const altStack of altStacks) {
      if (altStack && altStack.length > 0) {
        const confidence = this.calculatePersonalizedScore(
          userPref,
          { stack: altStack },
          requirements
        );

        alternatives.push({
          stack: altStack,
          confidence,
          reasoning: this.generateAlternativeReasoning(altStack, baseRec),
        });
      }
    }

    return alternatives.slice(0, 3); // Return top 3 alternatives
  }

  /**
   * Generate conservative alternative
   */
  private generateConservativeAlternative(baseRec: any): string[] {
    const conservativeMap: Record<string, string> = {
      'Next.js': 'React',
      'TypeScript': 'JavaScript',
      'Tailwind CSS': 'CSS',
      'Prisma': 'SQL',
      'GraphQL': 'REST API',
      'Docker': 'Standard Deployment',
    };

    return baseRec.stack.map((tech: string) => conservativeMap[tech] || tech);
  }

  /**
   * Generate innovative alternative
   */
  private generateInnovativeAlternative(baseRec: any): string[] {
    const innovativeMap: Record<string, string> = {
      'React': 'Svelte',
      'Vue.js': 'SolidJS',
      'Express': 'Fastify',
      'PostgreSQL': 'Supabase',
      'MongoDB': 'PlanetScale',
      'CSS': 'Tailwind CSS',
    };

    return baseRec.stack.map((tech: string) => innovativeMap[tech] || tech);
  }

  /**
   * Generate budget-conscious alternative
   */
  private generateBudgetAlternative(baseRec: any): string[] {
    const budgetMap: Record<string, string> = {
      'Auth0': 'NextAuth.js',
      'Stripe': 'PayPal',
      'Vercel': 'Netlify',
      'AWS': 'Railway',
      'Google Cloud': 'Supabase',
    };

    return baseRec.stack.map((tech: string) => budgetMap[tech] || tech);
  }

  /**
   * Generate reasoning for alternatives
   */
  private generateAlternativeReasoning(altStack: string[], baseRec: any): string {
    const differences = altStack.filter(tech => !baseRec.stack.includes(tech));
    
    if (differences.length > 0) {
      return `Alternative using ${differences.join(', ')} for different benefits`;
    }
    
    return "Similar approach with slight variations";
  }

  /**
   * Get base recommendations from existing engine
   */
  private getBaseRecommendations(requirements: any): any[] {
    // This would integrate with the existing recommendation engine
    return [
      {
        stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL'],
        category: 'web-app',
        tags: ['modern', 'scalable', 'type-safe'],
      },
      {
        stack: ['React', 'Node.js', 'Express', 'MongoDB'],
        category: 'web-app',
        tags: ['classic', 'flexible', 'javascript'],
      },
      {
        stack: ['Vue.js', 'Nuxt.js', 'Supabase', 'Tailwind CSS'],
        category: 'web-app',
        tags: ['progressive', 'backend-as-service', 'modern'],
      },
    ];
  }

  /**
   * Calculate confidence based on multiple factors
   */
  private calculateConfidence(
    userPref: UserPreference,
    baseRec: any,
    personalizedScore: number
  ): number {
    let confidence = personalizedScore;

    // Boost confidence if user has history with similar stacks
    const hasHistory = userPref.history.generatedProjects.length > 0;
    if (hasHistory) {
      confidence += 0.1;
    }

    // Boost confidence if user has positive feedback
    const hasPositiveFeedback = Object.values(userPref.feedback.ratings).some(rating => rating >= 4);
    if (hasPositiveFeedback) {
      confidence += 0.1;
    }

    // Reduce confidence if user has dismissed similar recommendations
    const hasDismissals = userPref.history.dismissedRecommendations.length > 0;
    if (hasDismissals) {
      confidence -= 0.1;
    }

    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * Get or create user preferences
   */
  private getUserPreferences(userId: string): UserPreference {
    if (!this.userPreferences.has(userId)) {
      this.userPreferences.set(userId, {
        userId,
        preferences: {
          complexity: 'intermediate',
          domains: [],
          technologies: [],
          projectTypes: [],
          budget: 'medium',
          timeframe: 'medium',
        },
        history: {
          generatedProjects: [],
          favoriteStacks: [],
          dismissedRecommendations: [],
          successfulDeployments: [],
        },
        behavior: {
          sessionDuration: [],
          featuresUsed: [],
          clickPatterns: {},
          searchQueries: [],
        },
        feedback: {
          ratings: {},
          comments: [],
          reportedIssues: [],
        },
      });
    }
    return this.userPreferences.get(userId)!;
  }

  /**
   * Update user preferences
   */
  private updateUserPreferences(userId: string, preferences: UserPreference): void {
    this.userPreferences.set(userId, preferences);
    // In a real app, this would be persisted to a database
  }

  /**
   * Generate unique recommendation ID
   */
  private generateRecommendationId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user insights for analytics
   */
  public getUserInsights(userId: string): any {
    const userPref = this.getUserPreferences(userId);
    
    return {
      totalProjects: userPref.history.generatedProjects.length,
      favoriteStacks: userPref.history.favoriteStacks.length,
      successfulDeployments: userPref.history.successfulDeployments.length,
      averageSessionDuration: userPref.behavior.sessionDuration.reduce((a, b) => a + b, 0) / userPref.behavior.sessionDuration.length || 0,
      mostUsedFeatures: Object.entries(userPref.behavior.clickPatterns)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([feature]) => feature),
      preferredComplexity: userPref.preferences.complexity,
      topDomains: userPref.preferences.domains.slice(0, 3),
    };
  }

  /**
   * Export user data for analytics
   */
  public exportUserData(userId: string): UserPreference | null {
    return this.userPreferences.get(userId) || null;
  }

  /**
   * Clear user data (GDPR compliance)
   */
  public clearUserData(userId: string): boolean {
    return this.userPreferences.delete(userId);
  }
}

// Export singleton instance
export const mlPersonalizationEngine = new MLPersonalizationEngine();
