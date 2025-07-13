// SSR-Friendly Dashboard Component
// This component provides meaningful content on server-side render to prevent blank pages

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface SSRDashboardProps {
  initialSession?: any;
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="flex justify-end space-x-2">
          <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);

const CreateNewCard = ({ onClick }: { onClick: () => void }) => (
  <div className="group relative border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 transition-all duration-300 flex items-center justify-center p-6 min-h-[180px]">
    <button onClick={onClick} className="text-center">
      <div className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">Create New Blueprint</h3>
      <p className="mt-1 text-sm text-gray-500">Start building your project</p>
    </button>
  </div>
);

const BlueprintCard = ({ title, description, date }: { title: string; description: string; date: string }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div>
      <h3 className="font-bold text-lg text-gray-900 truncate">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
      <p className="text-xs text-gray-400 mt-2">{date}</p>
    </div>
    <div className="mt-4 flex justify-end space-x-3">
      <button className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        Share
      </button>
      <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
        View
      </button>
    </div>
  </div>
);

export default function SSRDashboard({ initialSession }: SSRDashboardProps) {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [showFullApp, setShowFullApp] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Delay showing full app to allow for smooth loading
    const timer = setTimeout(() => setShowFullApp(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const currentSession = session || initialSession;

  // Show loading state during SSR and initial client load
  if (!isClient || status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  // Show login prompt if no session
  if (!currentSession?.user) {
    return (
      <div className="text-center p-8">
        <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to StackFast</h3>
        <p className="text-gray-500 mb-6">Please log in to access your project dashboard</p>
        <button
          onClick={() => window.location.href = '/api/auth/signin'}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  // Show basic dashboard with option to load full app
  if (!showFullApp) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Start</h2>
          <p className="text-gray-600">Ready to create your next project? Let's build something amazing together.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <CreateNewCard onClick={() => setShowFullApp(true)} />
          
          <BlueprintCard 
            title="Sample Project"
            description="AI-powered web application"
            date="Created recently"
          />
          
          <BlueprintCard 
            title="Mobile App Starter"
            description="React Native project template"
            date="Last week"
          />
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setShowFullApp(true)}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Load Full Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Load the full StackFastApp dynamically
  const StackFastApp = React.lazy(() => import('./StackFastApp'));
  
  return (
    <React.Suspense fallback={<LoadingSkeleton />}>
      <StackFastApp />
    </React.Suspense>
  );
}
