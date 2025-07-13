// Main entry point for StackFast application - SSR Enabled
// This page uses Server-Side Rendering to prevent blank page issues

import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import dynamic from 'next/dynamic';
import { Session } from 'next-auth';

// Import skeleton components for initial loading
const SkeletonLoader = ({ count = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
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

const LoginPrompt = ({ onLogin }: { onLogin: () => void }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center p-6 sm:p-8 bg-white rounded-xl border-2 border-dashed border-gray-200 max-w-md">
      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">Welcome to StackFast</h3>
      <p className="mt-1 text-sm text-gray-500">Please log in with your GitHub account to begin creating project blueprints.</p>
      <div className="mt-6">
        <button
          onClick={onLogin}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Login with GitHub
        </button>
      </div>
    </div>
  </div>
);

// Dynamically import the full app with SSR disabled for client-side features
const StackFastApp = dynamic(
  () => import('../components/StackFastApp'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gray-50 min-h-screen font-sans">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Loading your projects...</p>
          </header>
          <SkeletonLoader count={3} />
        </div>
      </div>
    )
  }
);

interface HomeProps {
  session: Session | null;
}

export default function Home({ session }: HomeProps) {
  // If no session on server, show login prompt immediately
  if (!session) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <LoginPrompt onLogin={() => window.location.href = '/api/auth/signin'} />
      </div>
    );
  }

  // If session exists, show loading skeleton then full app
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {session.user?.name || 'Developer'}.</p>
          </div>
          {session.user && (
            <div className="flex items-center self-end sm:self-center">
              <img 
                src={session.user.image || ''} 
                alt={session.user.name || 'User'} 
                className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm" 
              />
              <span className="text-sm font-medium text-gray-600">{session.user.name}</span>
            </div>
          )}
        </header>
        <StackFastApp />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  return {
    props: {
      session,
    },
  };
};
