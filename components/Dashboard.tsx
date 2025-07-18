import React, { useState, useEffect } from 'react';
import SkeletonLoader from './ui/SkeletonLoader';
import EmptyState from './ui/EmptyState';
import LoginPrompt from './ui/LoginPrompt';

interface MockUser {
  name: string;
  avatarUrl?: string;
}

interface SavedBlueprint {
  blueprintId: string;
  projectName: string;
  createdAt: string;
  toolCount: number;
}

const fallbackAvatar = '/default-avatar.png'; // Place a default avatar image in the public folder

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [savedBlueprints, setSavedBlueprints] = useState<SavedBlueprint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [avatarSrc, setAvatarSrc] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
    // Mock session data - replace with actual authentication
    const session = { user: { name: "Mia Samura", avatarUrl: "https://avatars.githubusercontent.com/u/10986?v=4" } };
    if (session.user) {
      setUser(session.user);
      setAvatarSrc(session.user.avatarUrl || fallbackAvatar);
      // Fetch blueprints from API
      const fetchBlueprints = async () => {
        setIsLoading(true);
        setError("");
        try {
          const res = await fetch('/api/blueprints');
          if (!res.ok) {
            throw new Error(`Failed to fetch blueprints: ${res.statusText}`);
          }
          const data = await res.json();
          // Map API data to SavedBlueprint[]
          const blueprints: SavedBlueprint[] = (data as any[]).map(bp => ({
            blueprintId: bp.id || bp.blueprintId,
            projectName: bp.projectName,
            createdAt: bp.createdAt,
            toolCount: bp.blueprintData?.tools?.length || 0,
          }));
          setSavedBlueprints(blueprints);
        } catch (err: any) {
          setError(err.message || 'Unknown error fetching blueprints.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchBlueprints();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleCreateBlueprint = () => {
    window.location.href = '/create-blueprint';
  };

  const handleViewBlueprint = (blueprintId: string) => {
    window.location.href = `/blueprint/${blueprintId}`;
  };

  const handleShareBlueprint = (blueprintId: string) => {
    const shareUrl = `${window.location.origin}/blueprint/${blueprintId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Blueprint URL copied to clipboard!');
  };

  const handleLogin = () => {
    window.location.href = '/api/auth/signin';
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/signout';
  };

  const handleAvatarError = () => {
    setAvatarSrc(fallbackAvatar);
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
    if (error) {
      return <EmptyState title="Error" message={error} icon={<span>❌</span>} onAction={() => window.location.reload()} actionText="Retry" />;
    }
    if (savedBlueprints.length === 0) {
      return <EmptyState title="No Blueprints" message="You haven't created any blueprints yet." icon={<span>📄</span>} onAction={handleCreateBlueprint} actionText="Create Blueprint" />;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <img
                src={avatarSrc || fallbackAvatar}
                alt={user.name}
                className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm"
                onError={handleAvatarError}
              />
              <button onClick={handleLogout} className="text-sm font-medium text-gray-600 hover:text-gray-900">Logout</button>
            </div>
          )}
        </header>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
