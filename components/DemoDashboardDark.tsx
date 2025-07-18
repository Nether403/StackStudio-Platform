// Demo Dashboard Component - Self-contained for demo recording (Dark Mode)
// This component provides the main project creation interface without external dependencies

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import PremiumIntro from './PremiumIntro';

interface ProjectData {
  name: string;
  description: string;
  skillLevel: string;
  features: string[];
}

const DemoDashboard: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    skillLevel: 'intermediate',
    features: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStack, setGeneratedStack] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Intro Video Modal Component
  const IntroVideoModal = () => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full">
        <button
          onClick={() => setShowIntroVideo(false)}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl font-bold z-10"
        >
          ✕ Close
        </button>
        <div className="glass-morphism rounded-xl p-6 neon-border">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-white neon-text-blue mb-2">Welcome to StackFast</h2>
            <p className="text-gray-300 neon-text">Powered by StackStudio - Your AI development companion</p>
          </div>
          <video
            ref={videoRef}
            className="w-full rounded-lg shadow-2xl"
            controls
            autoPlay
            muted
            onEnded={() => {
              setTimeout(() => setShowIntroVideo(false), 1000);
            }}
          >
            <source src="/assets/stackfast-intro.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );

  // Show premium intro if active
  if (showIntro) {
    return (
      <PremiumIntro 
        onContinue={() => setShowIntro(false)} 
      />
    );
  }

  // Show intro video modal if active
  if (showIntroVideo) {
    return <IntroVideoModal />;
  }

  if (generatedStack) {
    return (
      <div className="bg-gray-900 min-h-screen premium-gradient-bg neon-grid-bg floating-orbs-bg relative p-8">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          {/* Premium Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Image 
                src="/assets/stackfast-logo-actual.jpg" 
                alt="StackFast Logo" 
                width={200} 
                height={60} 
                className="neon-text pulse-glow logo-glow rounded-lg"
              />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 neon-text-blue">🎉 Your Tech Stack is Ready!</h1>
            <p className="text-lg text-gray-300 neon-text">AI-powered recommendations based on your requirements</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glow-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-900/50 rounded-lg flex items-center justify-center mr-3 neon-border-glow">⚛️</span>
                <span className="neon-text-blue">Frontend</span>
              </h3>
              <div className="space-y-2">
                {generatedStack.frontend.map((tech: string, i: number) => (
                  <div key={i} className="flex items-center p-3 glass-morphism rounded-lg neon-border">
                    <span className="font-medium text-blue-300 neon-text">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glow-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-green-900/50 rounded-lg flex items-center justify-center mr-3 neon-border-glow">🔧</span>
                <span className="neon-text-purple">Backend</span>
              </h3>
              <div className="space-y-2">
                {generatedStack.backend.map((tech: string, i: number) => (
                  <div key={i} className="flex items-center p-3 glass-morphism rounded-lg neon-border">
                    <span className="font-medium text-green-300 neon-text">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glow-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center mr-3 neon-border-glow">🚀</span>
                <span className="neon-text-pink">Deployment</span>
              </h3>
              <div className="space-y-2">
                {generatedStack.deployment.map((tech: string, i: number) => (
                  <div key={i} className="flex items-center p-3 glass-morphism rounded-lg neon-border">
                    <span className="font-medium text-purple-300 neon-text">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glow-card rounded-xl p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-orange-900/50 rounded-lg flex items-center justify-center mr-3 neon-border-glow">⚡</span>
                <span className="neon-text-blue">Project Estimate</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <span className="block text-gray-400 text-sm mb-1">Timeline</span>
                  <span className="block font-medium text-white neon-text">{generatedStack.estimate.timeWeeks}</span>
                </div>
                <div className="text-center">
                  <span className="block text-gray-400 text-sm mb-1">Difficulty</span>
                  <span className="block font-medium text-white neon-text">{generatedStack.estimate.difficulty}</span>
                </div>
                <div className="text-center">
                  <span className="block text-gray-400 text-sm mb-1">Monthly Cost</span>
                  <span className="block font-medium text-white neon-text">{generatedStack.estimate.cost}</span>
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
              className="px-8 py-3 text-gray-300 glass-morphism border border-gray-600 rounded-lg hover:bg-gray-700 transition-all duration-300 neon-border"
            >
              Create Another
            </button>
            <button className="px-8 py-3 text-white neon-button rounded-lg transition-all duration-300">
              Export Blueprint
            </button>
          </div>

          {/* StackStudio Footer Branding */}
          <div className="text-center mt-12 pt-8 border-t border-gray-700/50">
            <div className="flex items-center justify-center space-x-4">
              <span className="text-gray-400 neon-text">Powered by</span>
              <Image 
                src="/assets/stackstudio-logo.png" 
                alt="StackStudio Logo" 
                width={120} 
                height={30} 
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 neon-text">Your AI development companion</p>
          </div>
        </div>
      </div>
    );
  }

  if (showGenerator) {
    return (
      <div className="bg-gray-900 min-h-screen premium-gradient-bg neon-grid-bg floating-orbs-bg relative p-8">
        <div className="max-w-2xl mx-auto relative z-10">
          {/* Premium Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Image 
                src="/assets/stackfast-logo.svg" 
                alt="StackFast Logo" 
                width={200} 
                height={60} 
                className="neon-text pulse-glow logo-glow"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 neon-text-blue">🤖 AI Project Generator</h1>
            <p className="text-lg text-gray-300 neon-text">Tell us about your project and we'll recommend the perfect tech stack</p>
          </div>

          <div className="glow-card rounded-xl p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 neon-text">
                What are you building?
              </label>
              <input
                type="text"
                placeholder="e.g., AI-powered SaaS dashboard"
                className="w-full p-4 glass-morphism border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 neon-border transition-all duration-300"
                value={projectData.description}
                onChange={(e) => setProjectData({...projectData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 neon-text">
                Your skill level
              </label>
              <select
                title="Select your skill level"
                className="w-full p-4 glass-morphism border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white neon-border transition-all duration-300"
                value={projectData.skillLevel}
                onChange={(e) => setProjectData({...projectData, skillLevel: e.target.value})}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 neon-text">
                Key features (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['User Authentication', 'Real-time Updates', 'Data Visualization', 'Mobile App', 'AI/ML Features', 'Payment Processing'].map((feature) => (
                  <label key={feature} className="flex items-center space-x-3 p-3 glass-morphism border border-pink-500/20 rounded-lg hover:border-pink-500/40 cursor-pointer transition-all duration-300 neon-border">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-500 text-blue-600 focus:ring-blue-500 bg-gray-700 w-4 h-4"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProjectData({...projectData, features: [...projectData.features, feature]});
                        } else {
                          setProjectData({...projectData, features: projectData.features.filter(f => f !== feature)});
                        }
                      }}
                    />
                    <span className="text-sm text-gray-300 neon-text">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateStack}
              disabled={!projectData.description || isGenerating}
              className="w-full py-4 px-6 neon-button rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-lg font-semibold"
            >
              {isGenerating ? (
                <>
                  <svg className="w-6 h-6 mr-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="neon-text">AI is analyzing your requirements...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="neon-text">Generate My Tech Stack</span>
                </>
              )}
            </button>
          </div>

          {/* StackStudio Footer Branding */}
          <div className="text-center mt-8 pt-6 border-t border-gray-700/30">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-gray-400 text-sm neon-text">Powered by</span>
              <Image 
                src="/assets/stackstudio-logo.png" 
                alt="StackStudio Logo" 
                width={100} 
                height={25} 
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen premium-gradient-bg neon-grid-bg floating-orbs-bg relative p-8">
      <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
        {/* Premium Header with Dual Logo Branding */}
        <div>
          <div className="flex items-center justify-center mb-8 space-x-6">
            <Image 
              src="/assets/stackfast-logo-actual.jpg" 
              alt="StackFast Logo" 
              width={220} 
              height={66} 
              className="neon-text pulse-glow logo-glow rounded-lg"
            />
            <span className="text-4xl neon-text-blue">×</span>
            <Image 
              src="/assets/stackstudio-logo.png" 
              alt="StackStudio Logo" 
              width={180} 
              height={45} 
              className="neon-text pulse-glow logo-glow rounded-lg"
            />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 neon-text-blue">StackFast AI Platform</h1>
          <p className="text-2xl text-gray-300 neon-text">Powered by StackStudio - Get AI-powered tech stack recommendations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glow-card rounded-xl p-8">
            <div className="w-16 h-16 bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-6 neon-border-glow">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 neon-text-blue">AI-Powered</h3>
            <p className="text-gray-300 neon-text">Our AI analyzes your requirements and suggests the best technologies</p>
          </div>

          <div className="glow-card rounded-xl p-8">
            <div className="w-16 h-16 bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-6 neon-border-glow">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 neon-text-purple">Lightning Fast</h3>
            <p className="text-gray-300 neon-text">Get recommendations in seconds, not hours of research</p>
          </div>

          <div className="glow-card rounded-xl p-8">
            <div className="w-16 h-16 bg-purple-900/50 rounded-xl flex items-center justify-center mx-auto mb-6 neon-border-glow">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 neon-text-pink">Precise</h3>
            <p className="text-gray-300 neon-text">Tailored recommendations based on your skill level and project needs</p>
          </div>
        </div>

        <button
          onClick={() => setShowGenerator(true)}
          className="inline-flex items-center px-12 py-5 neon-button text-white text-xl font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl pulse-glow mr-4"
        >
          <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="neon-text">Start Building Now</span>
        </button>

        <button
          onClick={() => setShowIntroVideo(true)}
          className="inline-flex items-center px-8 py-4 glass-morphism border border-blue-500/30 text-white text-lg font-semibold rounded-xl transition-all duration-300 hover:border-blue-400/50 neon-border"
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="neon-text">Watch Intro</span>
        </button>

        {/* StackStudio Footer Branding */}
        <div className="mt-16 pt-8 border-t border-gray-700/30">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span className="text-gray-400 neon-text">Powered by</span>
            <Image 
              src="/assets/stackstudio-logo.png" 
              alt="StackStudio Logo" 
              width={150} 
              height={38} 
              className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => setShowIntroVideo(true)}
            />
          </div>
          <p className="text-gray-500 neon-text text-center">Your AI development companion - Building the future of development</p>
        </div>
      </div>
    </div>
  );
};

export default DemoDashboard;
