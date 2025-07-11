// Enhanced StackFast Application with Authentication and Cost Projection
// This component integrates the authentication system with the blueprint generator

import React, { useState, useMemo, useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { UserProfile, LoginButton, AuthGuard, SavedBlueprints } from '../components/Auth';
import BlueprintResults from '../Frontend/BlueprintResults';
import { CostProjection } from '../Engine/cost-projection-engine';
import { apiClient } from '../lib/api-client';
import { ToolProfile } from '../Database/types';

// Type definitions
interface Tool {
  id: string;
  name: string;
  category: string;
}

interface RecommendedTool {
  name: string;
  category: string;
  reason: string;
  compatibilityScore: number;
  cost?: {
    min: number;
    max: number;
  };
}

interface BlueprintResult {
  summary: string;
  recommendedStack: RecommendedTool[];
  warnings: Array<{
    type: string;
    message: string;
  }>;
  projectPrompt: string;
  estimatedCost: {
    min: number;
    max: number;
  };
  costProjection?: CostProjection;
}

interface GitHubRepoResponse {
  html_url: string;
  [key: string]: any;
}

// --- Helper UI Components ---
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex justify-center items-center mb-8">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <React.Fragment key={index}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep > index ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
          {index + 1}
        </div>
        {index < totalSteps - 1 && (
          <div className={`flex-auto h-1 mx-2 ${currentStep > index + 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
        )}
      </React.Fragment>
    ))}
  </div>
);

const ToolPill = ({ tool, onRemove }: { tool: Tool; onRemove: (tool: Tool) => void }) => (
  <div className="bg-indigo-100 text-indigo-800 text-sm font-medium me-2 px-3 py-1.5 rounded-full flex items-center animate-fade-in-fast">
    {tool.name}
    <button 
      onClick={() => onRemove(tool)} 
      className="ml-2 text-indigo-500 hover:text-indigo-800 focus:outline-none"
      aria-label={`Remove ${tool.name}`}
    >
      &#x2715;
    </button>
  </div>
);

const WarningIcon = () => (
  <svg className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// --- Blueprint Generator Component ---
const BlueprintGenerator = () => {
  const { user } = useAuth();
  
  // --- State Management ---
  const [step, setStep] = useState<number>(1);
  const [projectIdea, setProjectIdea] = useState<string>('');
  const [skillSelection, setSkillSelection] = useState<string>('');
  const [preferredTools, setPreferredTools] = useState<Tool[]>([]);
  const [toolSearch, setToolSearch] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [blueprint, setBlueprint] = useState<BlueprintResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState<boolean>(false);
  const [savedBlueprints, setSavedBlueprints] = useState<any[]>([]);

  // --- Mock Data for UI ---
  const MOCK_TOOL_PROFILES_FOR_SEARCH = [
    { id: "openai_gpt-4", name: "OpenAI GPT-4", category: "Language Model" },
    { id: "anthropic_claude-3", name: "Anthropic Claude 3", category: "Language Model" },
    { id: "replit_ghostwriter", name: "Replit Ghostwriter", category: "Code Generation" },
    { id: "github_copilot", name: "GitHub Copilot", category: "Code Generation" },
    { id: "pinecone", name: "Pinecone", category: "Database" },
    { id: "supabase", name: "Supabase", category: "Database" },
    { id: "netlify", name: "Netlify", category: "Deployment Platform" },
    { id: "vercel", name: "Vercel", category: "Deployment Platform" },
  ];
  
  // --- Mappers & Derived State ---
  const skillMap: { [key: string]: { setup: number; daily: number } } = {
    'Beginner': { setup: 1, daily: 1 },
    'Intermediate': { setup: 2, daily: 2 },
    'Expert': { setup: 3, daily: 3 },
  };

  const filteredTools = useMemo(() => {
    if (!toolSearch) return [];
    return MOCK_TOOL_PROFILES_FOR_SEARCH.filter(tool => 
      tool.name.toLowerCase().includes(toolSearch.toLowerCase()) &&
      !preferredTools.some(pt => pt.id === tool.id)
    );
  }, [toolSearch, preferredTools]);

  // --- Event Handlers ---
  const handleNextStep = () => setStep(s => s + 1);
  const handlePrevStep = () => setStep(s => s - 1);
  
  const addTool = (tool: Tool) => {
    setPreferredTools(prev => [...prev, tool]);
    setToolSearch('');
  };

  const removeTool = (toolToRemove: Tool) => {
    setPreferredTools(prev => prev.filter(tool => tool.id !== toolToRemove.id));
  };
  
  const handleGenerateBlueprint = async () => {
    setIsGenerating(true);
    setApiError(null);
    
    const input = {
      projectIdea,
      skillProfile: skillMap[skillSelection],
      preferredToolIds: preferredTools.map(t => t.id)
    };
    
    try {
      const response = await apiClient.post<BlueprintResult>('/api/generate-blueprint', input);
      setBlueprint(response.data);
      setStep(4);
    } catch (error) {
      console.error('Blueprint generation failed:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to generate blueprint. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveBlueprint = async () => {
    if (!user || !blueprint) return;
    
    setIsSaving(true);
    try {
      const projectName = projectIdea.slice(0, 50) || 'Untitled Project';
      
      const response = await apiClient.post('/api/blueprints', {
        projectName,
        projectIdea,
        blueprintData: blueprint,
      });

      console.log('Blueprint saved:', response.data);
      alert('Blueprint saved successfully!');
    } catch (error) {
      console.error('Error saving blueprint:', error);
      alert('Failed to save blueprint. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRepository = async () => {
    if (!user || !blueprint) return;
    
    setIsCreatingRepo(true);
    try {
      const projectName = projectIdea.slice(0, 50).replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-') || 'stackfast-project';
      
      const response = await apiClient.post<GitHubRepoResponse>('/api/github/create-repo', {
        name: projectName,
        description: projectIdea,
        blueprint: blueprint,
      });

      console.log('Repository created:', response.data);
      alert(`Repository created successfully! Check it out at: ${response.data.html_url}`);
      
      // Open the repository in a new tab
      window.open(response.data.html_url, '_blank');
    } catch (error) {
      console.error('Error creating repository:', error);
      alert(error instanceof Error ? error.message : 'Failed to create repository. Please try again.');
    } finally {
      setIsCreatingRepo(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setProjectIdea('');
    setSkillSelection('');
    setPreferredTools([]);
    setBlueprint(null);
    setApiError(null);
  };

  // --- Render Functions ---
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="project-idea" className="block text-lg font-semibold text-gray-700 mb-3">
                What do you want to build?
              </label>
              <textarea
                id="project-idea"
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                placeholder="Describe your project idea in detail..."
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={6}
              />
            </div>
            <button
              onClick={handleNextStep}
              disabled={!projectIdea.trim()}
              className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next Step
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                What's your skill level?
              </label>
              <div className="space-y-3">
                {['Beginner', 'Intermediate', 'Expert'].map((skill) => (
                  <label key={skill} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="skill"
                      value={skill}
                      checked={skillSelection === skill}
                      onChange={(e) => setSkillSelection(e.target.value)}
                      className="mr-3 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{skill}</div>
                      <div className="text-sm text-gray-500">
                        {skill === 'Beginner' && 'I prefer simple, well-documented solutions'}
                        {skill === 'Intermediate' && 'I can handle moderate complexity and setup'}
                        {skill === 'Expert' && 'I welcome advanced tools and complex configurations'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrevStep}
                className="flex-1 py-3 px-6 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={!skillSelection}
                className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="tool-search" className="block text-lg font-semibold text-gray-700 mb-3">
                Any preferred tools? (Optional)
              </label>
              <input
                id="tool-search"
                type="text"
                value={toolSearch}
                onChange={(e) => setToolSearch(e.target.value)}
                placeholder="Search for tools..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              
              {/* Tool suggestions */}
              {filteredTools.length > 0 && (
                <div className="mt-3 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {filteredTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => addTool(tool)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 border-gray-100"
                    >
                      <div className="font-medium text-gray-900">{tool.name}</div>
                      <div className="text-sm text-gray-500">{tool.category}</div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Selected tools */}
              {preferredTools.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Selected tools:</div>
                  <div className="flex flex-wrap gap-2">
                    {preferredTools.map((tool) => (
                      <ToolPill key={tool.id} tool={tool} onRemove={removeTool} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handlePrevStep}
                className="flex-1 py-3 px-6 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleGenerateBlueprint}
                disabled={isGenerating}
                className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? 'Generating...' : 'Generate Blueprint'}
              </button>
            </div>
          </div>
        );

      case 4:
        if (apiError) {
          return (
            <div className="text-center py-8">
              <ErrorIcon />
              <h3 className="text-xl font-semibold text-red-600 mb-2">Generation Failed</h3>
              <p className="text-gray-600 mb-6">{apiError}</p>
              <button
                onClick={() => setStep(3)}
                className="py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          );
        }

        if (!blueprint) {
          return (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating your blueprint...</p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Your Blueprint is Ready!</h3>
            </div>
            
            {/* Use the new BlueprintResults component */}
            <BlueprintResults 
              blueprint={blueprint}
              onCreateRepository={handleCreateRepository}
              isCreatingRepo={isCreatingRepo}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={resetForm}
                className="flex-1 py-3 px-6 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Create Another
              </button>
              {user && (
                <button
                  onClick={handleSaveBlueprint}
                  disabled={isSaving}
                  className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Blueprint'}
                </button>
              )}
            </div>
            
            {!user && (
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 mb-2">Sign in to save your blueprints!</p>
                <LoginButton className="justify-center" />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <StepIndicator currentStep={step} totalSteps={4} />
      {renderStepContent()}
    </div>
  );
};

// --- Main Application Component ---
const StackFastApp = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gray-50 min-h-screen font-sans p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-4xl font-bold text-gray-900">StackFast</h1>
            <p className="text-lg text-gray-600">AI-powered tech stack recommendations</p>
          </div>
          {user ? (
            <UserProfile />
          ) : (
            <LoginButton />
          )}
        </header>
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar: Saved Blueprints (only for logged-in users) */}
          {user && (
            <aside className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Blueprints</h2>
                <SavedBlueprints />
              </div>
            </aside>
          )}

          {/* Main Content: Blueprint Generator */}
          <div className={user ? "lg:col-span-3" : "lg:col-span-4"}>
            <BlueprintGenerator />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by StackStudio</p>
        </footer>
      </div>
    </div>
  );
};

// --- Root App with Auth Provider ---
export default function App() {
  return (
    <AuthProvider>
      <StackFastApp />
    </AuthProvider>
  );
}
