/*
 * AI-Powered Stack Recommendation Service
 * Integrates with Gemini, OpenAI, and xAI APIs to provide intelligent, context-aware recommendations
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ToolProfile } from './stack-recommendation-engine';

interface ProjectContext {
  projectType: string;
  complexity: 'simple' | 'medium' | 'complex';
  domain: string;
  features: string[];
  scalingRequirements: 'low' | 'medium' | 'high';
  realTimeNeeds: boolean;
  authNeeds: boolean;
  databaseNeeds: 'simple' | 'relational' | 'nosql' | 'vector';
  aiMlNeeds: boolean;
  deploymentPreference: 'cloud' | 'serverless' | 'traditional';
  budgetConstraints: 'startup' | 'enterprise' | 'personal';
}

interface AIRecommendation {
  recommendedTools: Array<{
    toolId: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    alternativeTools: string[];
  }>;
  architectureAdvice: string;
  roadmap: Array<{
    phase: string;
    duration: string;
    tasks: string[];
    tools: string[];
  }>;
  reasoning: string;
  potentialChallenges: string[];
  learningPath: string[];
}

export class AIStackRecommendationService {
  private openai?: OpenAI;
  private gemini?: GoogleGenerativeAI;
  private toolProfiles: ToolProfile[];
  private aiProvider: 'gemini' | 'openai' | 'xai';

  constructor(apiKey: string, toolProfiles: ToolProfile[]) {
    this.toolProfiles = toolProfiles;
    this.aiProvider = (process.env.AI_PROVIDER as 'gemini' | 'openai' | 'xai') || 'gemini';

    // Initialize the appropriate AI service based on provider
    switch (this.aiProvider) {
      case 'gemini':
        this.gemini = new GoogleGenerativeAI(apiKey);
        break;
      case 'openai':
        this.openai = new OpenAI({ apiKey });
        break;
      case 'xai':
        this.openai = new OpenAI({
          apiKey,
          baseURL: 'https://api.x.ai/v1',
        });
        break;
      default:
        // Default to Gemini
        this.gemini = new GoogleGenerativeAI(apiKey);
        this.aiProvider = 'gemini';
    }
  }

  /**
   * Parse project idea using AI to extract context and requirements
   */
  async parseProjectIdea(projectIdea: string): Promise<ProjectContext> {
    const systemPrompt = 'You are a senior technical architect who specializes in analyzing project requirements and recommending appropriate technology stacks. Always respond with valid JSON.';
    
    const userPrompt = `
Analyze this project idea and extract key technical requirements:

Project Idea: "${projectIdea}"

Please analyze and respond with a JSON object containing:
- projectType: (web-app, mobile-app, api, desktop-app, cli-tool, data-pipeline, ml-model, etc.)
- complexity: (simple, medium, complex)
- domain: (e-commerce, social-media, fintech, healthcare, education, entertainment, etc.)
- features: array of main features needed
- scalingRequirements: (low, medium, high)
- realTimeNeeds: boolean
- authNeeds: boolean
- databaseNeeds: (simple, relational, nosql, vector)
- aiMlNeeds: boolean
- deploymentPreference: (cloud, serverless, traditional)
- budgetConstraints: (startup, enterprise, personal)

Be specific and practical. Focus on technical requirements that would influence tool selection.
`;

    try {
      const content = await this.getAICompletion(systemPrompt, userPrompt, {
        temperature: 0.3,
        maxTokens: 1000,
        jsonMode: true
      });

      return JSON.parse(content) as ProjectContext;
    } catch (error) {
      console.error('Error parsing project idea:', error);
      // Fallback to basic analysis
      return this.fallbackProjectAnalysis(projectIdea);
    }
  }

  /**
   * Generate AI-powered tool recommendations based on project context
   */
  async generateAIRecommendations(
    projectContext: ProjectContext,
    skillProfile: { setup: number; daily: number },
    preferredToolIds: string[] = []
  ): Promise<AIRecommendation> {
    const toolsContext = this.createToolsContext();
    
    const prompt = `
You are a senior technical architect recommending tools for a project.

PROJECT CONTEXT:
${JSON.stringify(projectContext, null, 2)}

USER SKILLS:
- Setup complexity tolerance: ${skillProfile.setup}/5
- Daily usage complexity tolerance: ${skillProfile.daily}/5

PREFERRED TOOLS (if any): ${preferredToolIds.join(', ')}

AVAILABLE TOOLS:
${toolsContext}

Please recommend the best tools for this project and provide:

1. recommendedTools: Array of tools with:
   - toolId: exact ID from available tools
   - reason: specific reason why this tool fits
   - priority: high/medium/low
   - alternativeTools: array of alternative tool IDs

2. architectureAdvice: High-level architecture guidance

3. roadmap: Implementation phases with:
   - phase: name
   - duration: estimated time
   - tasks: specific tasks
   - tools: tool IDs for this phase

4. reasoning: Overall reasoning for the stack

5. potentialChallenges: Potential issues to watch out for

6. learningPath: Recommended learning order for unfamiliar tools

Consider:
- User's skill level (don't recommend overly complex tools)
- Project complexity and scale
- Budget constraints
- Tool compatibility
- Learning curve
- Community support
- Real-world performance

Respond with valid JSON only.
`;

    try {
      const systemPrompt = 'You are a senior technical architect with 15+ years of experience. You provide practical, real-world advice based on actual project requirements. Always respond with valid JSON.';
      
      const content = await this.getAICompletion(systemPrompt, prompt, {
        temperature: 0.4,
        maxTokens: 2000,
        jsonMode: true
      });

      return JSON.parse(content) as AIRecommendation;
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      throw error;
    }
  }

  /**
   * Create a concise context of available tools for the AI
   */
  private createToolsContext(): string {
    const toolsByCategory = this.toolProfiles.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push({
        id: tool.id,
        name: tool.name,
        pricing: tool.pricing_model,
        cost: tool.baseline_cost,
        compatibility: tool.compatible_with,
        popularity: tool.popularity_score,
        setupComplexity: tool.skills?.setup || 1,
        dailyComplexity: tool.skills?.daily || 1
      });
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(toolsByCategory)
      .map(([category, tools]) => {
        const toolList = tools.map(tool => 
          `${tool.id} (${tool.name}): ${tool.pricing}, $${tool.cost}/mo, setup:${tool.setupComplexity}/5, daily:${tool.dailyComplexity}/5`
        ).join('\n  ');
        return `${category.toUpperCase()}:\n  ${toolList}`;
      })
      .join('\n\n');
  }

  /**
   * Fallback analysis if AI fails
   */
  private fallbackProjectAnalysis(projectIdea: string): ProjectContext {
    const idea = projectIdea.toLowerCase();
    
    // Simple keyword-based analysis
    const projectType = idea.includes('api') ? 'api' : 
                       idea.includes('mobile') ? 'mobile-app' : 
                       idea.includes('desktop') ? 'desktop-app' : 'web-app';
    
    const complexity = idea.includes('complex') || idea.includes('enterprise') ? 'complex' :
                      idea.includes('simple') || idea.includes('basic') ? 'simple' : 'medium';
    
    const domain = idea.includes('ecommerce') || idea.includes('shop') ? 'e-commerce' :
                   idea.includes('social') ? 'social-media' :
                   idea.includes('finance') ? 'fintech' : 'general';

    return {
      projectType,
      complexity,
      domain,
      features: ['basic functionality'],
      scalingRequirements: 'medium',
      realTimeNeeds: idea.includes('real-time') || idea.includes('chat'),
      authNeeds: idea.includes('auth') || idea.includes('login') || idea.includes('user'),
      databaseNeeds: idea.includes('nosql') || idea.includes('mongo') ? 'nosql' : 'relational',
      aiMlNeeds: idea.includes('ai') || idea.includes('ml') || idea.includes('machine learning'),
      deploymentPreference: 'cloud',
      budgetConstraints: 'startup'
    };
  }

  /**
   * Universal AI completion method that works with both Gemini and OpenAI
   */
  private async getAICompletion(
    systemPrompt: string,
    userPrompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      jsonMode?: boolean;
    } = {}
  ): Promise<string> {
    const { temperature = 0.3, maxTokens = 1000, jsonMode = false } = options;

    if (this.aiProvider === 'gemini' && this.gemini) {
      // Gemini API
      const model = this.gemini.getGenerativeModel({
        model: process.env.AI_MODEL || 'gemini-1.5-flash',
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: jsonMode ? 'application/json' : 'text/plain',
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      const prompt = `${systemPrompt}\n\n${userPrompt}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } else if (this.openai) {
      // OpenAI/xAI API
      const response = await this.openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode && { response_format: { type: 'json_object' } })
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from AI');
      }
      return content;
    } else {
      throw new Error('No AI provider configured');
    }
  }
}

/**
 * Validate AI recommendation against available tools
 */
export function validateAIRecommendation(
  recommendation: AIRecommendation,
  availableTools: ToolProfile[]
): AIRecommendation {
  const availableToolIds = new Set(availableTools.map(tool => tool.id));
  
  // Filter out tools that don't exist in our database
  const validRecommendedTools = recommendation.recommendedTools.filter(tool => {
    const isValid = availableToolIds.has(tool.toolId);
    if (!isValid) {
      console.warn(`AI recommended non-existent tool: ${tool.toolId}`);
    }
    return isValid;
  });

  // Validate alternative tools
  const validatedTools = validRecommendedTools.map(tool => ({
    ...tool,
    alternativeTools: tool.alternativeTools.filter(altId => availableToolIds.has(altId))
  }));

  return {
    ...recommendation,
    recommendedTools: validatedTools
  };
}
