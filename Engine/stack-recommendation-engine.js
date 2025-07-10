"use strict";
/*
 * StackFast Recommendation Engine
 * Core logic for analyzing project requirements and recommending tech stacks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackRecommendationEngine = void 0;
exports.generateBlueprint = generateBlueprint;
// Main recommendation engine
class StackRecommendationEngine {
    constructor(toolProfiles) {
        this.tools = [];
        this.tools = toolProfiles;
    }
    // Analyze project requirements from natural language input
    analyzeProject(projectIdea, skillLevel) {
        const lowercaseIdea = projectIdea.toLowerCase();
        // Project type detection
        let projectType = 'web-app';
        if (lowercaseIdea.includes('mobile') || lowercaseIdea.includes('app')) {
            projectType = 'mobile-app';
        }
        else if (lowercaseIdea.includes('api') || lowercaseIdea.includes('backend')) {
            projectType = 'api';
        }
        else if (lowercaseIdea.includes('dashboard') || lowercaseIdea.includes('admin')) {
            projectType = 'dashboard';
        }
        // Complexity assessment
        const complexityIndicators = [
            'real-time', 'ai', 'ml', 'machine learning', 'analytics', 'payment',
            'multi-tenant', 'microservices', 'scale', 'enterprise'
        ];
        const complexityScore = complexityIndicators.filter(indicator => lowercaseIdea.includes(indicator)).length;
        let complexity = 'simple';
        if (complexityScore > 3)
            complexity = 'complex';
        else if (complexityScore > 1)
            complexity = 'medium';
        // Feature detection
        const features = [];
        if (lowercaseIdea.includes('auth') || lowercaseIdea.includes('login') || lowercaseIdea.includes('user')) {
            features.push('authentication');
        }
        if (lowercaseIdea.includes('real-time') || lowercaseIdea.includes('live') || lowercaseIdea.includes('chat')) {
            features.push('real-time');
        }
        if (lowercaseIdea.includes('ai') || lowercaseIdea.includes('ml') || lowercaseIdea.includes('machine learning')) {
            features.push('ai-ml');
        }
        if (lowercaseIdea.includes('payment') || lowercaseIdea.includes('billing') || lowercaseIdea.includes('subscription')) {
            features.push('payments');
        }
        if (lowercaseIdea.includes('search') || lowercaseIdea.includes('recommendation')) {
            features.push('search');
        }
        return {
            projectType,
            complexity,
            features,
            scalingRequirements: complexity === 'complex' ? 'high' : complexity === 'medium' ? 'medium' : 'low',
            realTimeNeeds: features.includes('real-time'),
            authNeeds: features.includes('authentication'),
            databaseNeeds: features.includes('search') ? 'vector' :
                features.includes('ai-ml') ? 'nosql' : 'relational',
            aiMlNeeds: features.includes('ai-ml')
        };
    }
    // Score tool compatibility
    scoreToolCompatibility(tool, analysis, skillLevel) {
        let score = 0;
        // Base compatibility score
        score += tool.popularity_score * 30;
        // Skill level alignment
        const skillGap = Math.abs(tool.skills.setup - skillLevel.setup) +
            Math.abs(tool.skills.daily - skillLevel.daily);
        score += Math.max(0, 20 - skillGap * 5);
        // Community sentiment bonus
        if (tool.community_sentiment === 'highly_positive')
            score += 15;
        else if (tool.community_sentiment === 'positive')
            score += 10;
        // Cost consideration (free tools get bonus)
        if (tool.pricing_model === 'free-tier')
            score += 10;
        else if (tool.baseline_cost === 0)
            score += 5;
        // Complexity alignment
        if (analysis.complexity === 'simple' && tool.skills.setup <= 2)
            score += 10;
        else if (analysis.complexity === 'complex' && tool.skills.setup >= 3)
            score += 10;
        return Math.min(100, Math.max(0, score));
    }
    // Generate stack recommendation
    generateRecommendation(projectIdea, skillLevel, preferredToolIds = []) {
        const analysis = this.analyzeProject(projectIdea, skillLevel);
        // Filter and score tools
        const scoredTools = this.tools.map(tool => ({
            ...tool,
            compatibilityScore: this.scoreToolCompatibility(tool, analysis, skillLevel)
        })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        // Select best tools by category
        const recommendedStack = [];
        const usedCategories = new Set();
        const warnings = [];
        // Always include preferred tools first
        for (const toolId of preferredToolIds) {
            const tool = scoredTools.find(t => t.id === toolId);
            if (tool) {
                recommendedStack.push({
                    name: tool.name,
                    category: tool.category,
                    reason: 'User preference',
                    compatibilityScore: tool.compatibilityScore
                });
                usedCategories.add(tool.category);
            }
        }
        // Add best tools from each category
        for (const tool of scoredTools) {
            if (recommendedStack.length >= 6)
                break;
            // Skip if category already covered or score too low
            if (usedCategories.has(tool.category) || tool.compatibilityScore < 50)
                continue;
            // Check for conflicts
            const hasConflict = tool.rules?.some(rule => rule.kind === 'category' &&
                recommendedStack.some(r => rule.targets.includes(r.category)));
            if (hasConflict) {
                warnings.push({
                    type: 'Tool Conflict',
                    message: `${tool.name} conflicts with existing selections`
                });
                continue;
            }
            recommendedStack.push({
                name: tool.name,
                category: tool.category,
                reason: this.generateReasonForTool(tool, analysis),
                compatibilityScore: tool.compatibilityScore
            });
            usedCategories.add(tool.category);
        }
        // Generate cost estimate
        const costBreakdown = recommendedStack.map(item => {
            const tool = scoredTools.find(t => t.name === item.name);
            return {
                tool: item.name,
                cost: tool?.baseline_cost || 0
            };
        });
        const totalCost = costBreakdown.reduce((sum, item) => sum + item.cost, 0);
        return {
            summary: this.generateSummary(analysis, recommendedStack),
            recommendedStack,
            warnings,
            projectPrompt: this.generateProjectPrompt(projectIdea, recommendedStack),
            estimatedCost: {
                min: Math.max(0, totalCost * 0.8),
                max: totalCost * 1.5,
                breakdown: costBreakdown
            }
        };
    }
    generateReasonForTool(tool, analysis) {
        const reasons = [];
        if (tool.popularity_score > 0.8)
            reasons.push('highly popular');
        if (tool.pricing_model === 'free-tier')
            reasons.push('free tier available');
        if (tool.community_sentiment === 'highly_positive')
            reasons.push('excellent community support');
        if (analysis.complexity === 'simple' && tool.skills.setup <= 2)
            reasons.push('beginner-friendly');
        if (analysis.complexity === 'complex' && tool.skills.setup >= 3)
            reasons.push('enterprise-ready');
        return reasons.slice(0, 2).join(', ') || 'good fit for your project';
    }
    generateSummary(analysis, stack) {
        const projectTypeMap = {
            'web-app': 'web application',
            'mobile-app': 'mobile application',
            'api': 'API service',
            'dashboard': 'dashboard application'
        };
        return `Generated a ${analysis.complexity} ${projectTypeMap[analysis.projectType]} stack with ${stack.length} optimized tools. Focus on ${analysis.features.join(', ') || 'core functionality'} with ${analysis.scalingRequirements} scaling requirements.`;
    }
    generateProjectPrompt(projectIdea, stack) {
        const tools = stack.map(s => s.name).join(', ');
        return `Create a ${projectIdea} using the following technology stack: ${tools}. 

Key requirements:
- Set up the project structure
- Configure all tools for optimal integration
- Implement core functionality
- Add proper error handling
- Include basic testing setup
- Deploy to production environment

Please provide step-by-step implementation with code examples for each major component.`;
    }
}
exports.StackRecommendationEngine = StackRecommendationEngine;
// Export the main function for the API
function generateBlueprint(input, toolProfiles) {
    const engine = new StackRecommendationEngine(toolProfiles);
    return engine.generateRecommendation(input.projectIdea, input.skillProfile, input.preferredToolIds);
}
