// Authentication UI Components for NextAuth.js
// This file contains reusable UI components for authentication

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from 'next-auth/react';

// Type definitions
interface Blueprint {
  id: string;
  projectName: string;
  projectIdea: string;
  blueprintData: any;
  createdAt: string;
  updatedAt: string;
  userId: string;
  githubRepo?: {
    id: number;
    name: string;
    fullName: string;
    htmlUrl: string;
    cloneUrl: string;
    sshUrl: string;
    createdAt: string;
  };
}

// User Profile Component
export const UserProfile: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-3">
        <img 
          src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email || 'User')}&size=80`}
          alt={user.name || 'User'}
          className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
        <div className="hidden md:block">
          <p className="font-semibold text-gray-900 text-sm">
            {user.name || user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Toggle user menu"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="font-semibold text-gray-900 text-sm">
                {user.name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                // Add profile navigation here
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                // Add settings navigation here
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            <hr className="my-1" />
            <button
              onClick={async () => {
                setIsMenuOpen(false);
                await signOut();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Login Button Component
export const LoginButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { signInWithGitHub, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGitHubLogin}
      disabled={isLoading || loading}
      className={`flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isLoading || loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
      ) : (
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      )}
      {isLoading || loading ? 'Signing in...' : 'Login with GitHub'}
    </button>
  );
};

// Auth Guard Component
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access this page.</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Saved Blueprints Component
export const SavedBlueprints: React.FC = () => {
  const { user } = useAuth();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingRepo, setCreatingRepo] = useState<string | null>(null); // Track which blueprint is creating repo

  useEffect(() => {
    if (user) {
      fetchBlueprints();
    }
  }, [user]);

  const fetchBlueprints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/blueprints', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blueprints: ${response.statusText}`);
      }

      const data = await response.json();
      setBlueprints(data);
    } catch (error) {
      console.error('Error fetching blueprints:', error);
      setError(error instanceof Error ? error.message : 'Failed to load blueprints');
    } finally {
      setLoading(false);
    }
  };

  const deleteBlueprint = async (blueprintId: string) => {
    try {
      const response = await fetch(`/api/blueprints?blueprintId=${blueprintId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete blueprint');
      }

      // Remove the deleted blueprint from the local state
      setBlueprints(prev => prev.filter(bp => bp.id !== blueprintId));
    } catch (error) {
      console.error('Error deleting blueprint:', error);
      alert('Failed to delete blueprint');
    }
  };

  const createGitHubRepo = async (blueprint: Blueprint) => {
    try {
      setCreatingRepo(blueprint.id);
      
      // Generate a repository name from the project name
      const repoName = blueprint.projectName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50);

      const response = await fetch('/api/github/create-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blueprintId: blueprint.id,
          repoName: repoName,
          isPrivate: false // You could make this configurable
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error cases
        if (errorData.requiresAuth) {
          throw new Error(`${errorData.error}\n\nPlease sign out and sign in again to refresh your GitHub permissions.`);
        }
        
        if (errorData.suggestion) {
          throw new Error(`${errorData.error}\n\nSuggestion: ${errorData.suggestion}`);
        }
        
        throw new Error(errorData.error || 'Failed to create repository');
      }

      const result = await response.json();
      
      // Show success message and open the new repository
      const message = `🎉 GitHub Repository Created Successfully!\n\n` +
                     `Repository: ${result.repository.name}\n` +
                     `Files created: ${result.repository.filesCreated}\n` +
                     `URL: ${result.repository.url}\n\n` +
                     `Opening repository in new tab...`;
      
      alert(message);
      
      // Open the new repository in a new tab
      window.open(result.repository.url, '_blank');
      
      // Refresh blueprints to show the GitHub repo link
      fetchBlueprints();
      
    } catch (error) {
      console.error('Error creating GitHub repository:', error);
      alert(`Failed to create GitHub repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingRepo(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const extractTags = (blueprintData: any): string[] => {
    if (!blueprintData) return [];
    
    const tags: string[] = [];
    
    // Extract technology names from the recommended stack
    if (blueprintData.recommendedStack) {
      blueprintData.recommendedStack.forEach((item: any) => {
        if (item.name) {
          tags.push(item.name.toLowerCase());
        }
      });
    }
    
    // Add category-based tags
    if (blueprintData.summary) {
      const summary = blueprintData.summary.toLowerCase();
      if (summary.includes('web')) tags.push('web');
      if (summary.includes('mobile')) tags.push('mobile');
      if (summary.includes('ai') || summary.includes('machine learning')) tags.push('ai');
      if (summary.includes('dashboard')) tags.push('dashboard');
      if (summary.includes('api')) tags.push('api');
    }
    
    return Array.from(new Set(tags)).slice(0, 3); // Remove duplicates and limit to 3
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <svg className="w-12 h-12 mx-auto mb-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchBlueprints}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (blueprints.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-sm">No saved blueprints yet</p>
        <p className="text-xs mt-1">Create your first project to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blueprints.map((blueprint) => {
        const tags = extractTags(blueprint.blueprintData);
        
        return (
          <div
            key={blueprint.id}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 group"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 flex-1">
                {blueprint.projectName}
              </h3>
              <div className="flex items-center gap-1 ml-2">
                {blueprint.githubRepo ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(blueprint.githubRepo!.htmlUrl, '_blank');
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-blue-600 hover:text-blue-800"
                    aria-label="View GitHub repository"
                    title="View GitHub Repository"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      createGitHubRepo(blueprint);
                    }}
                    disabled={creatingRepo === blueprint.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                    aria-label="Create GitHub repository"
                    title="Create GitHub Repository"
                  >
                    {creatingRepo === blueprint.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    )}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this blueprint?')) {
                      deleteBlueprint(blueprint.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700"
                  aria-label="Delete blueprint"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            {blueprint.projectIdea && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {blueprint.projectIdea}
              </p>
            )}
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {blueprint.githubRepo && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </span>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              {formatDate(blueprint.createdAt)}
            </p>
          </div>
        );
      })}
    </div>
  );
};
