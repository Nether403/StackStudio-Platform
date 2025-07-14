// Authentication Component - SSR-Safe Version
// Modern, accessible sign-in/sign-out interface

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthButton: React.FC = () => {
  const { user, loading, signInWithGitHub, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showDemoMessage, setShowDemoMessage] = useState(false);

  // Check if GitHub OAuth is configured
  const isGitHubConfigured = () => {
    return typeof window !== 'undefined' && 
           window.location.hostname === 'localhost' && 
           !process.env.NEXT_PUBLIC_GITHUB_CONFIGURED;
  };

  // SSR-safe useEffect - only runs on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignIn = async () => {
    // In demo mode, show a message instead of trying to authenticate
    if (isGitHubConfigured()) {
      setShowDemoMessage(true);
      setTimeout(() => setShowDemoMessage(false), 3000);
      return;
    }

    setIsSigningIn(true);
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('Sign in failed:', error);
      // Show demo message on error too
      setShowDemoMessage(true);
      setTimeout(() => setShowDemoMessage(false), 3000);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // Don't render anything until we're on the client
  if (!isClient) {
    return (
      <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <img 
            src={user.image || '/default-avatar.png'} 
            alt={user.name || 'User'} 
            className="w-8 h-8 rounded-full border-2 border-gray-200"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSigningIn ? (
          <>
            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            Connect with GitHub
          </>
        )}
      </button>
      
      {showDemoMessage && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md shadow-lg z-10 w-80">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Demo Mode</p>
              <p className="text-yellow-700">GitHub authentication not configured. The app works fully without login!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthButton;
