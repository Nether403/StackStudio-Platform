"use strict";
/*
 * Test script for StackFast Recommendation Engine
 * Tests various project scenarios with expanded database
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const stack_recommendation_engine_1 = require("./Engine/stack-recommendation-engine");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Load all tool profiles from database
function loadToolProfiles() {
    const databasePath = path.join(__dirname, 'Database');
    const profiles = [];
    // Get all JSON files in the database directory
    const files = fs.readdirSync(databasePath).filter(file => file.endsWith('.json'));
    for (const file of files) {
        const filePath = path.join(databasePath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const tools = JSON.parse(content);
        profiles.push(...tools);
    }
    return profiles;
}
// Test scenarios
const testScenarios = [
    {
        name: "Simple Blog Website",
        projectIdea: "Create a simple blog website where users can read articles and comment",
        skillProfile: { setup: 2, daily: 2 },
        preferredToolIds: []
    },
    {
        name: "E-commerce Platform",
        projectIdea: "Build a full-featured e-commerce platform with user authentication, payment processing, and real-time inventory management",
        skillProfile: { setup: 3, daily: 3 },
        preferredToolIds: []
    },
    {
        name: "AI-Powered Chat App",
        projectIdea: "Create a real-time chat application with AI-powered responses and user authentication",
        skillProfile: { setup: 2, daily: 2 },
        preferredToolIds: []
    },
    {
        name: "Data Analytics Dashboard",
        projectIdea: "Build a dashboard for analytics with real-time data visualization and user management",
        skillProfile: { setup: 3, daily: 3 },
        preferredToolIds: []
    },
    {
        name: "Simple API Service",
        projectIdea: "Create a REST API for a task management system with authentication",
        skillProfile: { setup: 2, daily: 2 },
        preferredToolIds: []
    },
    {
        name: "Beginner Portfolio Site",
        projectIdea: "Build a personal portfolio website to showcase projects",
        skillProfile: { setup: 1, daily: 1 },
        preferredToolIds: []
    }
];
// Run tests
function runTests() {
    console.log('🚀 Testing StackFast Recommendation Engine with Expanded Database\n');
    // Load tool profiles
    const toolProfiles = loadToolProfiles();
    console.log(`📚 Loaded ${toolProfiles.length} tool profiles from ${fs.readdirSync(path.join(__dirname, 'Database')).filter(f => f.endsWith('.json')).length} categories\n`);
    // List available categories
    const categories = Array.from(new Set(toolProfiles.map(t => t.category)));
    console.log(`📂 Available categories: ${categories.join(', ')}\n`);
    // Test each scenario
    testScenarios.forEach((scenario, index) => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🧪 Test ${index + 1}: ${scenario.name}`);
        console.log(`${'='.repeat(60)}`);
        console.log(`📋 Project Idea: ${scenario.projectIdea}`);
        console.log(`👤 Skill Level: Setup ${scenario.skillProfile.setup}/5, Daily ${scenario.skillProfile.daily}/5`);
        try {
            const recommendation = (0, stack_recommendation_engine_1.generateBlueprint)(scenario, toolProfiles);
            console.log(`\n📊 Analysis Summary:`);
            console.log(`   ${recommendation.summary}`);
            console.log(`\n🛠️  Recommended Stack (${recommendation.recommendedStack.length} tools):`);
            recommendation.recommendedStack.forEach((tool, i) => {
                console.log(`   ${i + 1}. ${tool.name} (${tool.category})`);
                console.log(`      Reason: ${tool.reason}`);
                console.log(`      Compatibility Score: ${tool.compatibilityScore.toFixed(1)}/100`);
            });
            console.log(`\n💰 Cost Estimate:`);
            console.log(`   Range: $${recommendation.estimatedCost.min.toFixed(2)} - $${recommendation.estimatedCost.max.toFixed(2)}/month`);
            if (recommendation.estimatedCost.breakdown.length > 0) {
                console.log(`   Breakdown:`);
                recommendation.estimatedCost.breakdown.forEach(item => {
                    console.log(`     - ${item.tool}: $${item.cost.toFixed(2)}`);
                });
            }
            if (recommendation.warnings.length > 0) {
                console.log(`\n⚠️  Warnings:`);
                recommendation.warnings.forEach(warning => {
                    console.log(`   - ${warning.type}: ${warning.message}`);
                });
            }
            console.log(`\n✅ Test completed successfully`);
        }
        catch (error) {
            console.log(`\n❌ Test failed: ${error.message}`);
            console.log(`   Error details: ${error.stack}`);
        }
    });
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎉 All tests completed!`);
    console.log(`${'='.repeat(60)}`);
}
// Run the tests
runTests();
