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
  createdAt: string;
  tags: string[];
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

  useEffect(() => {
    if (user) {
      fetchBlueprints();
    }
  }, [user]);

  const fetchBlueprints = async () => {
    try {
      // For now, we'll use mock data
      // In a real app, this would fetch from your API
      const mockBlueprints: Blueprint[] = [
        {
          id: 'blueprint-1',
          projectName: 'AI Marketing App',
          projectIdea: 'A web app that uses AI to generate marketing copy',
          createdAt: new Date('2025-07-10').toISOString(),
          tags: ['ai', 'marketing', 'web-app']
        },
        {
          id: 'blueprint-2',
          projectName: 'E-commerce Dashboard',
          projectIdea: 'Analytics dashboard for online store',
          createdAt: new Date('2025-07-09').toISOString(),
          tags: ['analytics', 'dashboard', 'e-commerce']
        }
      ];
      
      setBlueprints(mockBlueprints);
    } catch (error) {
      console.error('Error fetching blueprints:', error);
    } finally {
      setLoading(false);
    }
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
      {blueprints.map((blueprint) => (
        <div
          key={blueprint.id}
          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
        >
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
            {blueprint.projectName}
          </h3>
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {blueprint.projectIdea}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {blueprint.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {new Date(blueprint.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};
