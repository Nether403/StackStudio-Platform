// Demo-Friendly Authentication Status Component
// Shows authentication state clearly for demo purposes

import React from 'react';

const DemoAuthStatus: React.FC = () => {
  return (
    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div>
          <h3 className="text-sm font-medium text-blue-300">Demo Mode Active</h3>
          <div className="mt-1 text-sm text-blue-200">
            <p>✨ All features are available without authentication!</p>
            <p className="mt-1">
              <span className="font-medium">What works:</span> Tech stack recommendations, 
              AI-powered suggestions, responsive dashboard, and all core features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoAuthStatus;
