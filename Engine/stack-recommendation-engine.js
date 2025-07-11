"use strict";
/*
 * StackFast Recommendation Engine
 * Core logic for analyzing project requirements and recommending tech stacks
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackRecommendationEngine = void 0;
exports.generateBlueprint = generateBlueprint;
var cost_projection_engine_1 = require("./cost-projection-engine");
// Main recommendation engine
var StackRecommendationEngine = /** @class */ (function () {
    function StackRecommendationEngine(toolProfiles) {
        this.tools = [];
        this.tools = toolProfiles;
    }
    // Analyze project requirements from natural language input
    StackRecommendationEngine.prototype.analyzeProject = function (projectIdea, skillLevel) {
        var lowercaseIdea = projectIdea.toLowerCase();
        // Project type detection
        var projectType = 'web-app';
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
        var complexityIndicators = [
            'real-time', 'ai', 'ml', 'machine learning', 'analytics', 'payment',
            'multi-tenant', 'microservices', 'scale', 'enterprise'
        ];
        var complexityScore = complexityIndicators.filter(function (indicator) {
            return lowercaseIdea.includes(indicator);
        }).length;
        var complexity = 'simple';
        if (complexityScore > 3)
            complexity = 'complex';
        else if (complexityScore > 1)
            complexity = 'medium';
        // Feature detection
        var features = [];
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
            projectType: projectType,
            complexity: complexity,
            features: features,
            scalingRequirements: complexity === 'complex' ? 'high' : complexity === 'medium' ? 'medium' : 'low',
            realTimeNeeds: features.includes('real-time'),
            authNeeds: features.includes('authentication'),
            databaseNeeds: features.includes('search') ? 'vector' :
                features.includes('ai-ml') ? 'nosql' : 'relational',
            aiMlNeeds: features.includes('ai-ml')
        };
    };
    // Score tool compatibility
    StackRecommendationEngine.prototype.scoreToolCompatibility = function (tool, analysis, skillLevel) {
        var score = 0;
        // Base compatibility score
        score += tool.popularity_score * 30;
        // Skill level alignment
        var skillGap = Math.abs(tool.skills.setup - skillLevel.setup) +
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
    };
    // Generate stack recommendation
    StackRecommendationEngine.prototype.generateRecommendation = function (projectIdea, skillLevel, preferredToolIds) {
        var _this = this;
        var _a;
        if (preferredToolIds === void 0) { preferredToolIds = []; }
        var analysis = this.analyzeProject(projectIdea, skillLevel);
        // Filter and score tools
        var scoredTools = this.tools.map(function (tool) { return (__assign(__assign({}, tool), { compatibilityScore: _this.scoreToolCompatibility(tool, analysis, skillLevel) })); }).sort(function (a, b) { return b.compatibilityScore - a.compatibilityScore; });
        // Select best tools by category
        var recommendedStack = [];
        var usedCategories = new Set();
        var warnings = [];
        var _loop_1 = function (toolId) {
            var tool = scoredTools.find(function (t) { return t.id === toolId; });
            if (tool) {
                recommendedStack.push({
                    name: tool.name,
                    category: tool.category,
                    reason: 'User preference',
                    compatibilityScore: tool.compatibilityScore
                });
                usedCategories.add(tool.category);
            }
        };
        // Always include preferred tools first
        for (var _i = 0, preferredToolIds_1 = preferredToolIds; _i < preferredToolIds_1.length; _i++) {
            var toolId = preferredToolIds_1[_i];
            _loop_1(toolId);
        }
        // Add best tools from each category
        for (var _b = 0, scoredTools_1 = scoredTools; _b < scoredTools_1.length; _b++) {
            var tool = scoredTools_1[_b];
            if (recommendedStack.length >= 6)
                break;
            // Skip if category already covered or score too low
            if (usedCategories.has(tool.category) || tool.compatibilityScore < 50)
                continue;
            // Check for conflicts
            var hasConflict = (_a = tool.rules) === null || _a === void 0 ? void 0 : _a.some(function (rule) {
                return rule.kind === 'category' &&
                    recommendedStack.some(function (r) { return rule.targets.includes(r.category); });
            });
            if (hasConflict) {
                warnings.push({
                    type: 'Tool Conflict',
                    message: "".concat(tool.name, " conflicts with existing selections")
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
        // Generate cost estimate (legacy)
        var costBreakdown = recommendedStack.map(function (item) {
            var tool = scoredTools.find(function (t) { return t.name === item.name; });
            return {
                tool: item.name,
                cost: (tool === null || tool === void 0 ? void 0 : tool.baseline_cost) || 0
            };
        });
        var totalCost = costBreakdown.reduce(function (sum, item) { return sum + item.cost; }, 0);
        // Generate advanced cost projection
        var projectScale = (0, cost_projection_engine_1.analyzeProjectScale)(projectIdea, skillLevel);
        var costProjection = (0, cost_projection_engine_1.calculateCostProjection)(recommendedStack.map(function (item) {
            var tool = scoredTools.find(function (t) { return t.name === item.name; });
            return {
                name: item.name,
                category: item.category,
                costModel: tool === null || tool === void 0 ? void 0 : tool.costModel
            };
        }), projectScale);
        return {
            summary: this.generateSummary(analysis, recommendedStack),
            recommendedStack: recommendedStack,
            warnings: warnings,
            projectPrompt: this.generateProjectPrompt(projectIdea, recommendedStack),
            estimatedCost: {
                min: Math.max(0, totalCost * 0.8),
                max: totalCost * 1.5,
                breakdown: costBreakdown
            },
            costProjection: costProjection
        };
    };
    StackRecommendationEngine.prototype.generateReasonForTool = function (tool, analysis) {
        var reasons = [];
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
    };
    StackRecommendationEngine.prototype.generateSummary = function (analysis, stack) {
        var projectTypeMap = {
            'web-app': 'web application',
            'mobile-app': 'mobile application',
            'api': 'API service',
            'dashboard': 'dashboard application'
        };
        var projectType = projectTypeMap[analysis.projectType] || 'application';
        return "Generated a ".concat(analysis.complexity, " ").concat(projectType, " stack with ").concat(stack.length, " optimized tools. Focus on ").concat(analysis.features.join(', ') || 'core functionality', " with ").concat(analysis.scalingRequirements, " scaling requirements.");
    };
    StackRecommendationEngine.prototype.generateProjectPrompt = function (projectIdea, stack) {
        var tools = stack.map(function (s) { return s.name; }).join(', ');
        return "Create a ".concat(projectIdea, " using the following technology stack: ").concat(tools, ". \n\nKey requirements:\n- Set up the project structure\n- Configure all tools for optimal integration\n- Implement core functionality\n- Add proper error handling\n- Include basic testing setup\n- Deploy to production environment\n\nPlease provide step-by-step implementation with code examples for each major component.");
    };
    return StackRecommendationEngine;
}());
exports.StackRecommendationEngine = StackRecommendationEngine;
// Export the main function for the API
function generateBlueprint(input, toolProfiles) {
    var engine = new StackRecommendationEngine(toolProfiles);
    return engine.generateRecommendation(input.projectIdea, input.skillProfile, input.preferredToolIds);
}
