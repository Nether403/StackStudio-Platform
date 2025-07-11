import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface DraftTool {
  id: string;
  name: string;
  description: string;
  github_repo: string;
  stars: number;
  status: string;
  discovered_at: string;
  category?: string;
  language?: string;
  potential_category?: string;
}

interface ToolDiscoveryProps {
  className?: string;
}

const ToolDiscoveryManager: React.FC<ToolDiscoveryProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [draftTools, setDraftTools] = useState<DraftTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high-stars' | 'recent'>('all');
  const [sortBy, setSortBy] = useState<'stars' | 'date' | 'name'>('stars');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadDraftTools();
  }, []);

  const loadDraftTools = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'draft_tools'));
      const tools: DraftTool[] = [];
      
      querySnapshot.forEach((doc) => {
        tools.push({ id: doc.id, ...doc.data() } as DraftTool);
      });
      
      setDraftTools(tools);
    } catch (error) {
      console.error('Error loading draft tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveTool = async (tool: DraftTool) => {
    setProcessing(tool.id);
    try {
      // Move tool to appropriate collection
      const targetCollection = tool.potential_category || 'coding_tools';
      
      // Create the tool profile structure
      const toolProfile = {
        name: tool.name,
        description: tool.description,
        github_repo: tool.github_repo,
        category: tool.category || 'General',
        tags: [tool.language || 'General'].filter(Boolean),
        live_data: {
          stars: tool.stars,
          updated_at: new Date().toISOString()
        },
        popularity_score: Math.min(Math.log10(tool.stars + 1) / 5, 1),
        created_at: new Date().toISOString(),
        approved_by: user?.uid || 'system',
        discovered_via: 'discovery_engine'
      };

      // Add to the appropriate collection
      await updateDoc(doc(db, targetCollection, tool.id), toolProfile);
      
      // Update draft status
      await updateDoc(doc(db, 'draft_tools', tool.id), {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user?.uid || 'system'
      });
      
      // Refresh the list
      await loadDraftTools();
      
      console.log(`✅ Approved tool: ${tool.name}`);
    } catch (error) {
      console.error('Error approving tool:', error);
    } finally {
      setProcessing(null);
    }
  };

  const rejectTool = async (tool: DraftTool) => {
    setProcessing(tool.id);
    try {
      await updateDoc(doc(db, 'draft_tools', tool.id), {
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: user?.uid || 'system'
      });
      
      await loadDraftTools();
      console.log(`❌ Rejected tool: ${tool.name}`);
    } catch (error) {
      console.error('Error rejecting tool:', error);
    } finally {
      setProcessing(null);
    }
  };

  const deleteTool = async (tool: DraftTool) => {
    setProcessing(tool.id);
    try {
      await deleteDoc(doc(db, 'draft_tools', tool.id));
      await loadDraftTools();
      console.log(`🗑️ Deleted tool: ${tool.name}`);
    } catch (error) {
      console.error('Error deleting tool:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getFilteredAndSortedTools = () => {
    let filtered = [...draftTools];

    // Apply filters
    switch (filter) {
      case 'high-stars':
        filtered = filtered.filter(tool => tool.stars >= 1000);
        break;
      case 'recent':
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(tool => new Date(tool.discovered_at) > weekAgo);
        break;
      default:
        // Show only draft status tools
        filtered = filtered.filter(tool => tool.status === 'draft');
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'stars':
        filtered.sort((a, b) => b.stars - a.stars);
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.discovered_at).getTime() - new Date(a.discovered_at).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredTools = getFilteredAndSortedTools();

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🔍 Tool Discovery Manager</h1>
        <p className="text-gray-600">Review and approve tools discovered by the AI engine</p>
      </div>

      {/* Stats and Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{draftTools.filter(t => t.status === 'draft').length}</div>
          <div className="text-blue-800 text-sm">Pending Review</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{draftTools.filter(t => t.status === 'approved').length}</div>
          <div className="text-green-800 text-sm">Approved</div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{draftTools.filter(t => t.status === 'rejected').length}</div>
          <div className="text-red-800 text-sm">Rejected</div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">{draftTools.length}</div>
          <div className="text-gray-800 text-sm">Total Discovered</div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter tools by category"
          >
            <option value="all">All Drafts</option>
            <option value="high-stars">High Stars (1000+)</option>
            <option value="recent">Recent (7 days)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Sort tools by criteria"
          >
            <option value="stars">GitHub Stars</option>
            <option value="date">Discovery Date</option>
            <option value="name">Name</option>
          </select>
        </div>

        <button
          onClick={loadDraftTools}
          className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tools List */}
      <div className="space-y-4">
        {filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No draft tools found</h2>
            <p className="text-gray-600">The discovery engine will find new tools automatically</p>
          </div>
        ) : (
          filteredTools.map((tool) => (
            <div key={tool.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{tool.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        ⭐ {tool.stars.toLocaleString()}
                      </span>
                      {tool.language && (
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {tool.language}
                        </span>
                      )}
                      {tool.potential_category && (
                        <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {tool.potential_category}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{tool.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span>📅</span>
                      <span>Discovered: {new Date(tool.discovered_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>🔗</span>
                      <a
                        href={`https://github.com/${tool.github_repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        {tool.github_repo}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {tool.status === 'draft' && (
                    <>
                      <button
                        onClick={() => approveTool(tool)}
                        disabled={processing === tool.id}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === tool.id ? '⏳' : '✅'} Approve
                      </button>
                      <button
                        onClick={() => rejectTool(tool)}
                        disabled={processing === tool.id}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === tool.id ? '⏳' : '❌'} Reject
                      </button>
                    </>
                  )}
                  
                  {tool.status !== 'draft' && (
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      tool.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tool.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                    </div>
                  )}
                  
                  <button
                    onClick={() => deleteTool(tool)}
                    disabled={processing === tool.id}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing === tool.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ToolDiscoveryManager;
