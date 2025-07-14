// Demo Dashboard Component - Self-contained for demo recording
// This component provides the main project creation interface without external dependencies

import React, { useState } from 'react';

interface ProjectData {
  name: string;
  description: string;
  skillLevel: string;
  features: string[];
}

const DemoDashboard: React.FC = () => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    skillLevel: 'intermediate',
    features: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStack, setGeneratedStack] = useState<any>(null);

  const handleGenerateStack = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock generated stack for demo
    const mockStack = {
      frontend: ['React', 'Tailwind CSS', 'TypeScript'],
      backend: ['Node.js', 'Express', 'PostgreSQL'],
      deployment: ['Vercel', 'Railway'],
      tools: ['VS Code', 'Git', 'GitHub'],
      estimate: {
        timeWeeks: '4-6 weeks',
        difficulty: 'Intermediate',
        cost: '$50-100/month'
      }
    };
    
    setGeneratedStack(mockStack);
    setIsGenerating(false);
  };

  if (generatedStack) {
    return (
      <div className="bg-gray-900 min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">🎉 Your Tech Stack is Ready!</h1>
            <p className="text-gray-300">AI-powered recommendations based on your requirements</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-900/50 rounded-lg flex items-center justify-center mr-3">⚛️</span>
                Frontend
              </h3>
              <div className="space-y-2">
                {generatedStack.frontend.map((tech: string, i: number) => (
                  <div key={i} className="flex items-center p-2 bg-blue-900/30 rounded-lg">
                    <span className="font-medium text-blue-300">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">🔧</span>
              Backend
            </h3>
            <div className="space-y-2">
              {generatedStack.backend.map((tech: string, i: number) => (
                <div key={i} className="flex items-center p-2 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">{tech}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">🚀</span>
              Deployment
            </h3>
            <div className="space-y-2">
              {generatedStack.deployment.map((tech: string, i: number) => (
                <div key={i} className="flex items-center p-2 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-800">{tech}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">⚡</span>
              Project Estimate
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Timeline:</span>
                <span className="font-medium">{generatedStack.estimate.timeWeeks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <span className="font-medium">{generatedStack.estimate.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Cost:</span>
                <span className="font-medium">{generatedStack.estimate.cost}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-x-4">
          <button
            onClick={() => {
              setGeneratedStack(null);
              setShowGenerator(false);
            }}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Create Another
          </button>
          <button className="px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            Export Blueprint
          </button>
        </div>
        </div>
      </div>
    );
  }

  if (showGenerator) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Project Generator</h1>
          <p className="text-gray-600">Tell us about your project and we'll recommend the perfect tech stack</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you building?
            </label>
            <input
              type="text"
              placeholder="e.g., AI-powered SaaS dashboard"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={projectData.description}
              onChange={(e) => setProjectData({...projectData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your skill level
            </label>
            <select
              title="Select your skill level"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={projectData.skillLevel}
              onChange={(e) => setProjectData({...projectData, skillLevel: e.target.value})}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key features (select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['User Authentication', 'Real-time Updates', 'Data Visualization', 'Mobile App', 'AI/ML Features', 'Payment Processing'].map((feature) => (
                <label key={feature} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProjectData({...projectData, features: [...projectData.features, feature]});
                      } else {
                        setProjectData({...projectData, features: projectData.features.filter(f => f !== feature)});
                      }
                    }}
                  />
                  <span className="text-sm">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateStack}
            disabled={!projectData.description || isGenerating}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                AI is analyzing your requirements...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate My Tech Stack
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to StackFast AI</h1>
        <p className="text-xl text-gray-600">Get AI-powered tech stack recommendations for your next project</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
          <p className="text-gray-600">Our AI analyzes your requirements and suggests the best technologies</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
          <p className="text-gray-600">Get recommendations in seconds, not hours of research</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Precise</h3>
          <p className="text-gray-600">Tailored recommendations based on your skill level and project needs</p>
        </div>
      </div>

      <button
        onClick={() => setShowGenerator(true)}
        className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
      >
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Start Building Now
      </button>
    </div>
  );
};

export default DemoDashboard;
