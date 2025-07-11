// Enhanced Project Generator Component
// Advanced project creation with saving and AI integration

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ProjectIdea {
  description: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferences: {
    frontend?: string;
    backend?: string;
    database?: string;
    hosting?: string;
  };
  projectType: 'web-app' | 'mobile-app' | 'desktop-app' | 'api' | 'other';
  timeline: '1-week' | '2-4-weeks' | '1-3-months' | '3-6-months' | 'long-term';
}

interface GeneratedBlueprint {
  summary: string;
  recommendedStack: Array<{
    name: string;
    category: string;
    reason: string;
  }>;
  compatibilityScore: number;
  phases: Array<{
    title: string;
    description: string;
    tasks: string[];
    estimatedTime: string;
  }>;
  prompts: Array<{
    phase: string;
    task: string;
    prompt: string;
  }>;
}

const ProjectGenerator: React.FC = () => {
  const { user } = useAuth();
  const [projectIdea, setProjectIdea] = useState<ProjectIdea>({
    description: '',
    skillLevel: 'intermediate',
    preferences: {},
    projectType: 'web-app',
    timeline: '2-4-weeks'
  });
  const [blueprint, setBlueprint] = useState<GeneratedBlueprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState('');

  const generateBlueprint = async () => {
    if (!projectIdea.description.trim()) {
      alert('Please describe your project idea');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectIdea: projectIdea.description,
          skillProfile: {
            level: projectIdea.skillLevel,
            preferences: projectIdea.preferences,
            projectType: projectIdea.projectType,
            timeline: projectIdea.timeline
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate blueprint');
      }

      const generatedBlueprint = await response.json();
      setBlueprint(generatedBlueprint);
      setProjectName(extractProjectName(projectIdea.description));
    } catch (error) {
      console.error('Error generating blueprint:', error);
      alert('Failed to generate blueprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractProjectName = (description: string): string => {
    const words = description.split(' ').slice(0, 3);
    return words.join(' ').replace(/[^a-zA-Z0-9 ]/g, '');
  };

  const saveProject = async () => {
    if (!user || !blueprint) return;

    setSaving(true);
    try {
      const projectData = {
        userId: user.uid,
        name: projectName || 'Untitled Project',
        description: projectIdea.description,
        skillLevel: projectIdea.skillLevel,
        preferences: projectIdea.preferences,
        projectType: projectIdea.projectType,
        timeline: projectIdea.timeline,
        blueprint: blueprint,
        stack: blueprint.recommendedStack.map(item => item.name),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'user_projects'), projectData);
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Generator</h1>
        <p className="text-gray-600">
          Describe your project idea and get a complete tech stack recommendation and roadmap
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="space-y-6">
          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              value={projectIdea.description}
              onChange={(e) => setProjectIdea({...projectIdea, description: e.target.value})}
              placeholder="Describe your project idea in detail... (e.g., 'A social media platform for pet owners with photo sharing, vet appointment booking, and community features')"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>

          {/* Skill Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Skill Level
            </label>
            <select
              value={projectIdea.skillLevel}
              onChange={(e) => setProjectIdea({...projectIdea, skillLevel: e.target.value as ProjectIdea['skillLevel']})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select your skill level"
            >
              <option value="beginner">Beginner - New to development</option>
              <option value="intermediate">Intermediate - Some experience</option>
              <option value="advanced">Advanced - Experienced developer</option>
            </select>
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Type
            </label>
            <select
              value={projectIdea.projectType}
              onChange={(e) => setProjectIdea({...projectIdea, projectType: e.target.value as ProjectIdea['projectType']})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select project type"
            >
              <option value="web-app">Web Application</option>
              <option value="mobile-app">Mobile App</option>
              <option value="desktop-app">Desktop Application</option>
              <option value="api">API/Backend Service</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Timeline
            </label>
            <select
              value={projectIdea.timeline}
              onChange={(e) => setProjectIdea({...projectIdea, timeline: e.target.value as ProjectIdea['timeline']})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select expected timeline"
            >
              <option value="1-week">1 Week (MVP/Prototype)</option>
              <option value="2-4-weeks">2-4 Weeks (Basic Features)</option>
              <option value="1-3-months">1-3 Months (Full Features)</option>
              <option value="3-6-months">3-6 Months (Complex Project)</option>
              <option value="long-term">Long-term (6+ Months)</option>
            </select>
          </div>

          {/* Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technology Preferences (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Frontend</label>
                <input
                  type="text"
                  value={projectIdea.preferences.frontend || ''}
                  onChange={(e) => setProjectIdea({
                    ...projectIdea,
                    preferences: {...projectIdea.preferences, frontend: e.target.value}
                  })}
                  placeholder="e.g., React, Vue, Angular"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Backend</label>
                <input
                  type="text"
                  value={projectIdea.preferences.backend || ''}
                  onChange={(e) => setProjectIdea({
                    ...projectIdea,
                    preferences: {...projectIdea.preferences, backend: e.target.value}
                  })}
                  placeholder="e.g., Node.js, Python, Java"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateBlueprint}
            disabled={loading || !projectIdea.description.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating Blueprint...
              </div>
            ) : (
              'Generate Project Blueprint'
            )}
          </button>
        </div>
      </div>

      {/* Blueprint Results */}
      {blueprint && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Project Blueprint</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Compatibility Score:</span>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                {blueprint.compatibilityScore}%
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
            <p className="text-gray-600">{blueprint.summary}</p>
          </div>

          {/* Recommended Stack */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Tech Stack</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {blueprint.recommendedStack.map((tech, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{tech.name}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {tech.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{tech.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Project Phases */}
          {blueprint.phases && blueprint.phases.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Phases</h3>
              <div className="space-y-4">
                {blueprint.phases.map((phase, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{phase.title}</h4>
                      <span className="text-xs text-gray-500">{phase.estimatedTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {phase.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Project */}
          {user && (
            <div className="border-t pt-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter a name for your project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={saveProject}
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectGenerator;
