import React from 'react';
import { useRouter } from 'next/router';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useAnalytics } from '../services/analyticsService';

const AnalyticsDemo: React.FC = () => {
  const router = useRouter();
  const analytics = useAnalytics();

  React.useEffect(() => {
    // Track page view
    analytics.trackPageView('/analytics-demo', {
      referrer: document.referrer,
      userAgent: navigator.userAgent
    });
  }, [analytics]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← Back to Home
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                📊 Analytics Dashboard Demo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Real-time insights powered by StackStudio
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="bg-blue-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm font-medium">🚀 Demo Mode</span>
            <span className="text-sm">
              Explore comprehensive analytics for your StackStudio projects
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard />

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Analytics Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Real-time project tracking</li>
                <li>• Cost analysis & optimization</li>
                <li>• Tool performance insights</li>
                <li>• User engagement metrics</li>
                <li>• AI-powered recommendations</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎯 Key Metrics
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Project completion rates</li>
                <li>• Average response times</li>
                <li>• Tool success rates</li>
                <li>• Cost savings achieved</li>
                <li>• User satisfaction scores</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔧 Technical Details
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Real-time Firestore integration</li>
                <li>• Chart.js visualizations</li>
                <li>• TypeScript type safety</li>
                <li>• Responsive design</li>
                <li>• Performance optimized</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Built with ❤️ by StackStudio - Empowering developers with intelligent project insights
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AnalyticsDemo;
