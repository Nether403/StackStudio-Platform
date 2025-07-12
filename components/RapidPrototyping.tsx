import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rapidPrototypingEngine, type PrototypingRequest } from '../Engine/rapid-prototyping-engine';

interface RapidPrototypingProps {
  className?: string;
}

const RapidPrototyping: React.FC<RapidPrototypingProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<PrototypingRequest>({
    projectIdea: '',
    techStack: [],
    complexity: 'simple',
    features: [],
    timeline: 'hours',
    deployment: 'cloud'
  });
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'code' | 'deploy'>('setup');

  const availableFeatures = [
    'authentication',
    'real-time',
    'payment',
    'search',
    'analytics',
    'media',
    'social',
    'location'
  ];

  const availableTechStack = [
    'next',
    'react',
    'typescript',
    'tailwind',
    'firebase',
    'supabase',
    'stripe',
    'vercel'
  ];

  const handleGenerate = async () => {
    if (!user || !user.email || !request.projectIdea) return;

    setLoading(true);
    try {
      const generated = await rapidPrototypingEngine.generateProject(request, user.email);
      setResult(generated);
      setActiveTab('code');
    } catch (error) {
      console.error('Error generating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setRequest(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleTechStackToggle = (tech: string) => {
    setRequest(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const downloadCode = () => {
    if (!result) return;

    // Create a zip file with all the generated files
    const files = result.codeTemplate.files;
    const blob = new Blob([JSON.stringify(files, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.codeTemplate.name.toLowerCase().replace(/\s+/g, '-')}-code.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Rapid Prototyping Engine
        </h1>
        <p className="text-gray-600">
          Generate production-ready code from your project ideas in minutes
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'setup', label: '⚙️ Setup', description: 'Configure your project' },
          { id: 'code', label: '💻 Code', description: 'Generated code files' },
          { id: 'deploy', label: '🚀 Deploy', description: 'Deployment instructions' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-4 text-center border-b-2 font-medium ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-lg">{tab.label}</div>
            <div className="text-xs opacity-70">{tab.description}</div>
          </button>
        ))}
      </div>

      {/* Setup Tab */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          {/* Project Idea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Idea
            </label>
            <textarea
              value={request.projectIdea}
              onChange={(e) => setRequest(prev => ({ ...prev, projectIdea: e.target.value }))}
              placeholder="Describe your project idea in detail..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Complexity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Complexity
            </label>
            <div className="flex space-x-4">
              {[
                { value: 'simple', label: 'Simple', description: 'Basic features, quick setup' },
                { value: 'medium', label: 'Medium', description: 'Multiple features, moderate complexity' },
                { value: 'complex', label: 'Complex', description: 'Advanced features, enterprise-grade' }
              ].map(option => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="complexity"
                    value={option.value}
                    checked={request.complexity === option.value}
                    onChange={(e) => setRequest(prev => ({ ...prev, complexity: e.target.value as any }))}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features to Include
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableFeatures.map(feature => (
                <label key={feature} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={request.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="text-blue-600"
                  />
                  <span className="capitalize">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Tech Stack
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTechStack.map(tech => (
                <button
                  key={tech}
                  onClick={() => handleTechStackToggle(tech)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.techStack.includes(tech)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline & Deployment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline
              </label>
              <select
                value={request.timeline}
                onChange={(e) => setRequest(prev => ({ ...prev, timeline: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Project timeline selection"
              >
                <option value="hours">Hours (Quick prototype)</option>
                <option value="days">Days (Full MVP)</option>
                <option value="weeks">Weeks (Production ready)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deployment Target
              </label>
              <select
                value={request.deployment}
                onChange={(e) => setRequest(prev => ({ ...prev, deployment: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Deployment target selection"
              >
                <option value="local">Local Development</option>
                <option value="cloud">Cloud (Vercel/Netlify)</option>
                <option value="hybrid">Hybrid (Docker + Cloud)</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !request.projectIdea || !user}
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
          >
            {loading ? '🔄 Generating...' : '✨ Generate Project'}
          </button>
        </div>
      )}

      {/* Code Tab */}
      {activeTab === 'code' && result && (
        <div className="space-y-6">
          {/* Project Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-900">
                {result.codeTemplate.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-700">
                  Confidence: {Math.round(result.confidenceScore * 100)}%
                </span>
                <span className="text-sm text-blue-700">
                  Est. Time: {result.estimatedTime}
                </span>
              </div>
            </div>
            <p className="text-blue-800">{result.codeTemplate.description}</p>
          </div>

          {/* Generated Files */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Generated Files ({result.codeTemplate.files.length})
              </h3>
              <button
                onClick={downloadCode}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                💾 Download Code
              </button>
            </div>

            <div className="space-y-3">
              {result.codeTemplate.files.map((file: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        file.type === 'component' ? 'bg-blue-100 text-blue-800' :
                        file.type === 'api' ? 'bg-green-100 text-green-800' :
                        file.type === 'config' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {file.type}
                      </span>
                      <span className="font-mono text-sm">{file.path}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(file.content)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="p-3">
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                      <code>{file.content}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dependencies */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Dependencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.codeTemplate.dependencies.map((dep: string) => (
                <span key={dep} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {dep}
                </span>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Next Steps
            </h3>
            <ol className="list-decimal list-inside space-y-2">
              {result.nextSteps.map((step: string, index: number) => (
                <li key={index} className="text-gray-700">{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Deploy Tab */}
      {activeTab === 'deploy' && result && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              Deployment Instructions
            </h3>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-gray-900 text-gray-100 p-4 rounded">
                {result.deploymentInstructions}
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Quick Deploy</h4>
              <p className="text-blue-800 text-sm mb-3">
                Deploy to Vercel with one click
              </p>
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Deploy to Vercel
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">🐳 Docker Deploy</h4>
              <p className="text-purple-800 text-sm mb-3">
                Containerized deployment
              </p>
              <button className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                Generate Dockerfile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium">Generating your project...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RapidPrototyping;
