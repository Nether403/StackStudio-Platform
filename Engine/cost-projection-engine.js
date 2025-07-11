"use strict";
/*
 * Cost Projection Engine
 * Calculates monthly cost estimates for recommended technology stacks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCostProjection = calculateCostProjection;
exports.analyzeProjectScale = analyzeProjectScale;
/**
 * Main cost projection function
 */
function calculateCostProjection(recommendedTools, projectScale) {
    var breakdown = [];
    var notes = [];
    var totalMin = 0;
    var totalMax = 0;
    var totalEstimate = 0;
    var hasUncertainty = false;
    // Calculate costs for each tool
    for (var _i = 0, recommendedTools_1 = recommendedTools; _i < recommendedTools_1.length; _i++) {
        var tool = recommendedTools_1[_i];
        var toolCost = calculateToolCost(tool, projectScale);
        breakdown.push(toolCost);
        totalMin += toolCost.monthlyMin;
        totalMax += toolCost.monthlyMax;
        totalEstimate += toolCost.monthlyEstimate;
        if (toolCost.notes.includes('Variable') || toolCost.notes.includes('Contact')) {
            hasUncertainty = true;
        }
    }
    // Apply scaling factors based on project characteristics
    var scalingFactors = calculateScalingFactors(projectScale);
    // Adjust totals with scaling factors
    var scaledMin = totalMin * scalingFactors.development;
    var scaledMax = totalMax * scalingFactors.production * scalingFactors.scale;
    var scaledEstimate = totalEstimate * (scalingFactors.development + scalingFactors.production) / 2;
    // Add general notes
    if (projectScale.complexity === 'complex') {
        notes.push('Complex projects may require additional tools or higher tiers');
    }
    if (projectScale.expectedTraffic === 'high') {
        notes.push('High traffic may increase usage-based costs significantly');
    }
    if (hasUncertainty) {
        notes.push('Some costs are variable or require custom quotes');
    }
    // Determine confidence level
    var confidence = determineConfidence(breakdown, projectScale);
    return {
        totalMonthlyMin: Math.round(scaledMin * 100) / 100,
        totalMonthlyMax: Math.round(scaledMax * 100) / 100,
        totalMonthlyEstimate: Math.round(scaledEstimate * 100) / 100,
        breakdown: breakdown,
        scalingFactors: scalingFactors,
        confidence: confidence,
        notes: notes
    };
}
/**
 * Calculate cost for a single tool
 */
function calculateToolCost(tool, projectScale) {
    var costModel = tool.costModel;
    if (!costModel) {
        // Fallback for tools without structured cost model
        return {
            toolName: tool.name,
            category: tool.category,
            costType: 'Unknown',
            monthlyMin: 0,
            monthlyMax: 0,
            monthlyEstimate: 0,
            notes: 'Cost information not available'
        };
    }
    var monthlyMin = 0;
    var monthlyMax = 0;
    var monthlyEstimate = 0;
    var notes = '';
    switch (costModel.type) {
        case 'Free':
            monthlyMin = monthlyMax = monthlyEstimate = 0;
            notes = 'Free and open source';
            break;
        case 'Subscription':
            monthlyMin = costModel.base_cost_monthly;
            monthlyMax = costModel.base_cost_monthly;
            monthlyEstimate = costModel.base_cost_monthly;
            notes = costModel.free_tier_details ? 'Has free tier available' : 'Paid subscription required';
            break;
        case 'Pay-as-you-go':
            monthlyMin = costModel.base_cost_monthly;
            // Estimate usage-based costs
            var usageMultiplier = getUsageMultiplier(tool.category, projectScale);
            var estimatedUsageCost = (costModel.unit_cost || 0) * usageMultiplier;
            monthlyMax = costModel.base_cost_monthly + estimatedUsageCost * 3; // 3x for high usage
            monthlyEstimate = costModel.base_cost_monthly + estimatedUsageCost;
            notes = 'Variable cost based on usage';
            break;
        case 'Custom':
            monthlyMin = 0;
            monthlyMax = 500; // Rough estimate for enterprise pricing
            monthlyEstimate = 100;
            notes = 'Contact sales for pricing';
            break;
    }
    return {
        toolName: tool.name,
        category: tool.category,
        costType: costModel.type,
        monthlyMin: Math.round(monthlyMin * 100) / 100,
        monthlyMax: Math.round(monthlyMax * 100) / 100,
        monthlyEstimate: Math.round(monthlyEstimate * 100) / 100,
        notes: notes
    };
}
/**
 * Calculate scaling factors based on project characteristics
 */
function calculateScalingFactors(projectScale) {
    var development = 1.0;
    var production = 1.0;
    var scale = 1.0;
    // Development phase typically uses free tiers
    if (projectScale.timeline === 'prototype') {
        development = 0.5;
    }
    else if (projectScale.timeline === 'mvp') {
        development = 0.8;
    }
    // Production scaling based on complexity
    switch (projectScale.complexity) {
        case 'simple':
            production = 1.0;
            break;
        case 'medium':
            production = 1.5;
            break;
        case 'complex':
            production = 2.0;
            break;
    }
    // Scale based on expected usage
    if (projectScale.expectedUsers > 10000) {
        scale = 2.0;
    }
    else if (projectScale.expectedUsers > 1000) {
        scale = 1.5;
    }
    if (projectScale.expectedTraffic === 'high') {
        scale *= 1.5;
    }
    else if (projectScale.expectedTraffic === 'medium') {
        scale *= 1.2;
    }
    return { development: development, production: production, scale: scale };
}
/**
 * Estimate usage multiplier for pay-as-you-go services
 */
function getUsageMultiplier(category, projectScale) {
    var baseMultipliers = {
        'AI/ML API': 1000, // API calls
        'Database': 100, // GB storage
        'CDN': 1000, // GB bandwidth
        'Cloud Storage': 10, // GB storage
        'Analytics': 10000, // Events
        'Email Service': 1000, // Emails
        'SMS Service': 100, // SMS messages
        'Search Service': 1000, // Search queries
        'default': 100
    };
    var baseMultiplier = baseMultipliers[category] || baseMultipliers.default;
    // Adjust based on project scale
    var multiplier = baseMultiplier;
    if (projectScale.complexity === 'complex') {
        multiplier *= 2;
    }
    else if (projectScale.complexity === 'medium') {
        multiplier *= 1.5;
    }
    if (projectScale.expectedTraffic === 'high') {
        multiplier *= 3;
    }
    else if (projectScale.expectedTraffic === 'medium') {
        multiplier *= 1.5;
    }
    return multiplier;
}
/**
 * Determine confidence level for cost projection
 */
function determineConfidence(breakdown, projectScale) {
    var hasVariableCosts = breakdown.some(function (item) {
        return item.costType === 'Pay-as-you-go' || item.costType === 'Custom';
    });
    var hasComplexProject = projectScale.complexity === 'complex';
    var hasHighTraffic = projectScale.expectedTraffic === 'high';
    if (hasVariableCosts && (hasComplexProject || hasHighTraffic)) {
        return 'low';
    }
    else if (hasVariableCosts || hasComplexProject) {
        return 'medium';
    }
    else {
        return 'high';
    }
}
/**
 * Helper function to analyze project and determine scale
 */
function analyzeProjectScale(projectIdea, skillProfile) {
    var lowercaseIdea = projectIdea.toLowerCase();
    // Complexity analysis
    var complexityIndicators = [
        'real-time', 'ai', 'ml', 'machine learning', 'analytics', 'payment',
        'multi-tenant', 'microservices', 'scale', 'enterprise', 'distributed'
    ];
    var complexityScore = complexityIndicators.filter(function (indicator) {
        return lowercaseIdea.includes(indicator);
    }).length;
    var complexity = 'simple';
    if (complexityScore > 3)
        complexity = 'complex';
    else if (complexityScore > 1)
        complexity = 'medium';
    // Expected users estimation
    var expectedUsers = 100; // Default for simple projects
    if (lowercaseIdea.includes('enterprise') || lowercaseIdea.includes('scale')) {
        expectedUsers = 10000;
    }
    else if (lowercaseIdea.includes('startup') || lowercaseIdea.includes('business')) {
        expectedUsers = 1000;
    }
    // Traffic estimation
    var expectedTraffic = 'low';
    if (lowercaseIdea.includes('real-time') || lowercaseIdea.includes('streaming')) {
        expectedTraffic = 'high';
    }
    else if (lowercaseIdea.includes('social') || lowercaseIdea.includes('marketplace')) {
        expectedTraffic = 'medium';
    }
    // Features detection
    var features = [];
    if (lowercaseIdea.includes('auth') || lowercaseIdea.includes('login')) {
        features.push('authentication');
    }
    if (lowercaseIdea.includes('payment') || lowercaseIdea.includes('billing')) {
        features.push('payments');
    }
    if (lowercaseIdea.includes('ai') || lowercaseIdea.includes('ml')) {
        features.push('ai-ml');
    }
    if (lowercaseIdea.includes('real-time') || lowercaseIdea.includes('chat')) {
        features.push('real-time');
    }
    // Timeline estimation based on skill level
    var timeline = 'mvp';
    if (skillProfile.setup <= 2 && skillProfile.daily <= 2) {
        timeline = 'prototype';
    }
    else if (skillProfile.setup >= 4 && skillProfile.daily >= 4) {
        timeline = 'production';
    }
    return {
        complexity: complexity,
        expectedUsers: expectedUsers,
        expectedTraffic: expectedTraffic,
        features: features,
        timeline: timeline
    };
}
