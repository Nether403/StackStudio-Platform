// Premium Intro Component with StackFast + StackStudio Branding
import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface PremiumIntroProps {
  onContinue: () => void;
}

const PremiumIntro: React.FC<PremiumIntroProps> = ({ onContinue }) => {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const VideoModal = () => (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-5xl w-full">
        <button
          onClick={() => setShowVideo(false)}
          className="absolute -top-16 right-0 text-white hover:text-gray-300 text-2xl font-bold z-10 neon-text pulse-glow"
        >
          ✕ Close
        </button>
        <div className="glass-morphism rounded-2xl p-8 neon-border glow-card">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-6 mb-4">
              <Image 
                src="/assets/stackfast-logo-actual.jpg" 
                alt="StackFast Logo" 
                width={200} 
                height={60} 
                className="rounded-lg neon-border pulse-glow"
              />
              <span className="text-4xl neon-text-blue">×</span>
              <Image 
                src="/assets/stackstudio-logo.png" 
                alt="StackStudio Logo" 
                width={180} 
                height={45} 
                className="rounded-lg neon-border pulse-glow"
              />
            </div>
            <h2 className="text-3xl font-bold text-white neon-text-blue mb-2">Welcome to the Future of Development</h2>
            <p className="text-xl text-gray-300 neon-text">StackFast powered by StackStudio</p>
          </div>
          <video
            ref={videoRef}
            className="w-full rounded-xl shadow-2xl neon-border"
            controls
            autoPlay
            muted
            onEnded={() => {
              setTimeout(() => {
                setShowVideo(false);
                onContinue();
              }, 1500);
            }}
          >
            <source src="/assets/stackfast-intro.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setShowVideo(false);
                onContinue();
              }}
              className="px-8 py-3 neon-button rounded-lg transition-all duration-300"
            >
              Skip to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (showVideo) {
    return <VideoModal />;
  }

  return (
    <div className="bg-gray-900 min-h-screen premium-gradient-bg neon-grid-bg floating-orbs-bg relative p-8">
      <div className="max-w-6xl mx-auto text-center space-y-16 relative z-10 pt-16">
        {/* Dual Logo Header */}
        <div className="space-y-8">
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <Image 
                src="/assets/stackfast-logo-actual.jpg" 
                alt="StackFast Logo" 
                width={250} 
                height={75} 
                className="rounded-xl neon-border glow-card pulse-glow"
              />
            </div>
            <div className="text-6xl neon-text-blue animate-pulse">×</div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <Image 
                src="/assets/stackstudio-logo.png" 
                alt="StackStudio Logo" 
                width={220} 
                height={55} 
                className="rounded-xl neon-border glow-card pulse-glow"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white mb-6 neon-text-blue animate-pulse">
              Welcome to the Future
            </h1>
            <p className="text-3xl text-gray-300 neon-text-purple font-light">
              AI-Powered Development Stack Recommendations
            </p>
            <p className="text-xl text-gray-400 neon-text">
              StackFast powered by StackStudio - Your ultimate AI development companion
            </p>
          </div>
        </div>

        {/* Premium Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
          <div className="glow-card rounded-2xl p-8 transform hover:scale-105 transition-all duration-300">
            <div className="w-20 h-20 bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 neon-border-glow">
              <span className="text-4xl">🤖</span>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4 neon-text-blue">AI-Powered Intelligence</h3>
            <p className="text-gray-300 neon-text text-lg">Advanced machine learning algorithms analyze your requirements and suggest the perfect technology stack</p>
          </div>

          <div className="glow-card rounded-2xl p-8 transform hover:scale-105 transition-all duration-300">
            <div className="w-20 h-20 bg-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 neon-border-glow">
              <span className="text-4xl">⚡</span>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4 neon-text-purple">Lightning Fast Results</h3>
            <p className="text-gray-300 neon-text text-lg">Get comprehensive technology recommendations in seconds, not hours of manual research</p>
          </div>

          <div className="glow-card rounded-2xl p-8 transform hover:scale-105 transition-all duration-300">
            <div className="w-20 h-20 bg-pink-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 neon-border-glow">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4 neon-text-pink">Precision Targeting</h3>
            <p className="text-gray-300 neon-text text-lg">Personalized recommendations based on your skill level, project requirements, and industry best practices</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-8">
          <button
            onClick={() => setShowVideo(true)}
            className="inline-flex items-center px-16 py-6 neon-button text-white text-2xl font-bold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl pulse-glow mr-6 transform hover:scale-105"
          >
            <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="neon-text">Watch Introduction</span>
          </button>

          <button
            onClick={onContinue}
            className="inline-flex items-center px-12 py-5 glass-morphism border border-blue-500/30 text-white text-xl font-semibold rounded-xl transition-all duration-300 hover:border-blue-400/50 neon-border transform hover:scale-105"
          >
            <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="neon-text">Skip to Dashboard</span>
          </button>
        </div>

        {/* Footer Branding */}
        <div className="mt-24 pt-8 border-t border-gray-700/30">
          <p className="text-gray-500 neon-text text-lg">
            © 2024 StackFast × StackStudio - Revolutionizing Development Workflows
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumIntro;
