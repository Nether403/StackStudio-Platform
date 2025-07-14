// Main entry point for StackFast application - SSR Enabled
// This page uses Server-Side Rendering to prevent blank page issues

import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { Session } from 'next-auth';
import SSRDashboard from '../components/SSRDashboard';

interface HomeProps {
  session: Session | null;
}

export default function Home({ session }: HomeProps) {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              StackFast Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              {session?.user?.name 
                ? `Welcome back, ${session.user.name}`
                : 'AI-powered project creation platform'
              }
            </p>
          </div>
          {session?.user && (
            <div className="flex items-center self-end sm:self-center">
              <img 
                src={session.user.image || ''} 
                alt={session.user.name || 'User'} 
                className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm" 
              />
              <div className="text-sm">
                <div className="font-medium text-gray-900">{session.user.name}</div>
                <div className="text-gray-500">Online</div>
              </div>
            </div>
          )}
        </header>
        
        <SSRDashboard initialSession={session} />
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
