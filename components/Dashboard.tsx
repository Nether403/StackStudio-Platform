import React, { useState, useEffect } from 'react';

// --- Reusable UI Components ---

const SkeletonLoader = ({ count = 1 }: { count?: number }) => (
  Array.from({ length: count }).map((_, i) => (
    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="flex justify-end space-x-2">
        <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
        <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  ))
);

interface EmptyStateProps {
  title: string;
  message: string;
  icon: React.ReactNode;
  onAction?: () => void;
  actionText?: string;
}

const EmptyState = ({ title, message, icon, onAction, actionText }: EmptyStateProps) => (
    <div className="text-center p-8 bg-white rounded-xl border-2 border-dashed border-gray-200">
        <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{message}</p>
        {onAction && (
            <div className="mt-6">
                <button
                    type="button"
                    onClick={onAction}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    {actionText}
                </button>
            </div>
        )}
    </div>
);

const LoginPrompt = ({ onLogin }: { onLogin: () => void }) => (
    <div className="flex items-center justify-center h-full">
        <EmptyState
            title="Welcome to StackFast"
            message="Please log in with your GitHub account to begin creating project blueprints."
            actionText="Login with GitHub"
            onAction={onLogin}
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
            }
        />
    </div>
);

// Types for mock data
interface MockUser {
  name: string;
  avatarUrl: string;
}

interface SavedBlueprint {
  blueprintId: string;
  projectName: string;
  createdAt: string;
  toolCount: number;
}

// --- Main Dashboard Component ---
export default function Dashboard() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [savedBlueprints, setSavedBlueprints] = useState<SavedBlueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Mock session data - replace with actual authentication
    const session = { user: { name: "Mia Samura", avatarUrl: "https://avatars.githubusercontent.com/u/10986?v=4" } };
    
    if (session.user) {
      setUser(session.user);
      setTimeout(() => {
        setSavedBlueprints([
          { blueprintId: 'bp1', projectName: 'AI Marketing App', createdAt: '2025-07-10T10:00:00Z', toolCount: 5 },
          { blueprintId: 'bp2', projectName: 'Internal Admin Dashboard', createdAt: '2025-07-09T14:30:00Z', toolCount: 7 },
          { blueprintId: 'bp3', projectName: 'SaaS Boilerplate', createdAt: '2025-07-08T18:45:00Z', toolCount: 6 },
        ]);
        setIsLoading(false);
      }, 1500);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleCreateBlueprint = () => {
    // Navigate to blueprint creation
    window.location.href = '/create-blueprint';
  };

  const handleViewBlueprint = (blueprintId: string) => {
    // Navigate to blueprint view
    window.location.href = `/blueprint/${blueprintId}`;
  };

  const handleShareBlueprint = (blueprintId: string) => {
    // Share functionality
    const shareUrl = `${window.location.origin}/blueprint/${blueprintId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Blueprint URL copied to clipboard!');
  };

  const handleLogin = () => {
    // Trigger GitHub OAuth
    window.location.href = '/api/auth/signin';
  };

  const handleLogout = () => {
    // Trigger logout
    window.location.href = '/api/auth/signout';
  };

  const renderContent = () => {
    if (!isClient) {
      return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><SkeletonLoader count={3} /></div>;
    }
    if (!user) {
      return <LoginPrompt onLogin={handleLogin} />;
    }
    if (isLoading) {
      return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><SkeletonLoader count={3} /></div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Blueprint Card */}
            <div className="group relative border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 transition-all duration-300 flex items-center justify-center p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <button onClick={handleCreateBlueprint} className="text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Create New Blueprint</h3>
                </button>
            </div>

            {/* Saved Blueprint Cards */}
            {savedBlueprints.map((bp, index) => (
                <div key={bp.blueprintId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${(index + 1) * 100 + 100}ms` }}>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 truncate">{bp.projectName}</h3>
                        <p className="text-sm text-gray-500">
                            {bp.toolCount} tools • Saved {new Date(bp.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button 
                            onClick={() => handleShareBlueprint(bp.blueprintId)}
                            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Share
                        </button>
                        <button 
                            onClick={() => handleViewBlueprint(bp.blueprintId)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            View
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="w-full max-w-7xl mx-auto p-8">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user ? user.name : 'Guest'}.</p>
          </div>
          {user && (
            <div className="flex items-center">
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm" />
                <button onClick={handleLogout} className="text-sm font-medium text-gray-600 hover:text-gray-900">Logout</button>
            </div>
          )}
        </header>
        {renderContent()}
      </div>
    </div>
  );
}
