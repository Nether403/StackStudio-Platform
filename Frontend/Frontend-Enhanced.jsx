// StackFast Frontend - Phase 3 Enhanced Version
// Modern React application with authentication, dashboard, and project generation

import React, { useState } from 'react';
import AuthProvider from '../contexts/AuthContext';
import AuthButton from '../components/AuthButton';
import Dashboard from '../components/Dashboard';
import ProjectGenerator from '../components/ProjectGenerator';

const Navigation = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'generator', label: 'Generate Project', icon: '🚀' },
    { id: 'dashboard', label: 'My Projects', icon: '📊' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">StackFast</h1>
              <p className="text-xs text-gray-500">powered by StackStudio</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Auth Button */}
          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                currentView === item.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About StackFast</h1>
        <p className="text-xl text-gray-600">
          Eliminate analysis paralysis and go from idea to execution with confidence
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎯 Our Mission</h2>
          <p className="text-gray-600 mb-4">
            StackFast eliminates the "research slog" that plagues modern development. We transform 
            your project idea into a complete, validated technology stack and step-by-step roadmap.
          </p>
          <p className="text-gray-600">
            Stop spending weeks researching and debating the "perfect" tech stack. Start building 
            your idea today with confidence.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">⚡ Key Features</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              AI-powered stack recommendations
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              Compatibility scoring system
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              Detailed project roadmaps
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              Ready-to-use AI coding prompts
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              Project saving and management
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">🚀 How It Works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Describe Your Idea</h3>
            <p className="text-sm text-gray-600">
              Tell us about your project in plain English
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Get Recommendations</h3>
            <p className="text-sm text-gray-600">
              Receive a curated tech stack with compatibility scores
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Start Building</h3>
            <p className="text-sm text-gray-600">
              Follow the roadmap with actionable tasks and AI prompts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StackFastApp = () => {
  const [currentView, setCurrentView] = useState('generator');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'generator':
        return <ProjectGenerator />;
      case 'dashboard':
        return <Dashboard />;
      case 'about':
        return <AboutPage />;
      default:
        return <ProjectGenerator />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation currentView={currentView} setCurrentView={setCurrentView} />
        <main>
          {renderCurrentView()}
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-500">
                © 2025 StackFast (powered by StackStudio). Built with modern, secure, keyless authentication.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Version 3.0 - Phase 3 Enhanced with Authentication & User Management
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default StackFastApp;
