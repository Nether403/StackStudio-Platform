// Simple Demo Page - Direct implementation for demo recording
// This bypasses complex SSR logic and loads the demo dashboard directly

import React, { useState } from 'react';
import Image from 'next/image';
import DemoDashboard from '../components/DemoDashboardDark';
import DemoAuthStatus from '../components/DemoAuthStatus';

const SimpleDemoPage: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <DemoDashboard />;
  }

  return (
    <div className="bg-gray-900 min-h-screen font-sans premium-gradient-bg neon-grid-bg floating-orbs-bg relative">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <header className="mb-12 sm:mb-16 text-center">
          <div className="flex items-center justify-center mb-8">
            <Image 
              src="/assets/stackfast-logo.svg" 
              alt="StackFast Logo" 
              width={250} 
              height={75} 
              className="neon-text pulse-glow"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 neon-text-blue">
            StackFast AI
          </h1>
          <p className="text-gray-300 text-xl neon-text">
            AI-powered tech stack recommendations for your next project
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          <DemoAuthStatus />
          
          <div className="text-center p-8">
            <div className="mx-auto h-20 w-20 text-blue-400 mb-8 neon-border-glow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full neon-text">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.091zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-6 neon-text-blue">
              Welcome to StackFast AI
            </h2>
            <p className="text-gray-300 mb-12 text-xl neon-text">
              Get AI-powered tech stack recommendations in seconds
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="glow-card rounded-xl p-8">
                <div className="w-16 h-16 bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-6 neon-border-glow">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 neon-text-blue">AI-Powered</h3>
                <p className="text-gray-300 neon-text">Smart recommendations based on your project requirements</p>
              </div>

              <div className="glow-card rounded-xl p-8">
                <div className="w-16 h-16 bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-6 neon-border-glow">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 neon-text-purple">Lightning Fast</h3>
                <p className="text-gray-300 neon-text">Get recommendations in seconds, not hours</p>
              </div>

              <div className="glow-card rounded-xl p-8">
                <div className="w-16 h-16 bg-purple-900/50 rounded-xl flex items-center justify-center mx-auto mb-6 neon-border-glow">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 neon-text-pink">Precise</h3>
                <p className="text-gray-300 neon-text">Tailored to your skill level and project needs</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                console.log('🚀 Start Creating button clicked!');
                setShowDashboard(true);
              }}
              className="inline-flex items-center px-12 py-5 neon-button text-white text-xl font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl pulse-glow"
            >
              <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="neon-text">Start Creating Now</span>
            </button>
            
            <p className="text-sm text-gray-400 mt-6 neon-text">
              No signup required • Works immediately
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDemoPage;
