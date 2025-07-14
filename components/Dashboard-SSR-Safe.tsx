// User Dashboard Component - SSR-Safe Version
// Main dashboard for managing saved projects and roadmaps

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SavedProject {
  id: string;
  name: string;
  description: string;
  stack: string[];
  createdAt: Date;
  updatedAt: Date;
  blueprint: any;
}

// Reusable UI Components
const SkeletonLoader = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 bg-gray-100 rounded-lg border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

interface EmptyStateProps {
  title: string;
  message: string;
  icon: React.ReactNode;
  onAction?: () => void;
  actionText?: string;
}

const EmptyState = ({ title, message, icon, onAction, actionText }: EmptyStateProps) => (
  <div className="text-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
    <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>
    <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{message}</p>
    {onAction && (
      <div className="mt-6">
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          {actionText}
        </button>
      </div>
    )}
  </div>
);

const LoginPrompt = ({ onLogin }: { onLogin: () => void }) => (
  <EmptyState
    title="Please log in"
    message="You need to be logged in to view your saved projects."
    actionText="Login with GitHub"
    onAction={onLogin}
    icon={
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1721.75 8.25z" />
      </svg>
    }
  />
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<SavedProject | null>(null);
  const [isClient, setIsClient] = useState(false);

  // SSR-safe useEffect - only runs on client side
  useEffect(() => {
    setIsClient(true);
    
    // Only load projects after we're on the client and have a user
    if (user) {
      loadUserProjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserProjects = async () => {
    if (!user || !user.email) return;

    try {
      const projectsRef = collection(db, 'user_projects');
      const q = query(projectsRef, where('userId', '==', user.email));
      const querySnapshot = await getDocs(q);
      
      const userProjects: SavedProject[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userProjects.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          stack: data.stack || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          blueprint: data.blueprint
        });
      });

      setProjects(userProjects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'user_projects', projectId));
      setProjects(projects.filter(p => p.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderContent = () => {
    // If we're not on the client yet, or we're loading and have a user, show skeletons
    if (!isClient || (loading && user)) {
      return <SkeletonLoader count={3} />;
    }

    // If we're on the client and there's no user, show the login prompt
    if (!user) {
      return <LoginPrompt onLogin={() => window.location.href = '/api/auth/signin'} />;
    }

    // If we have a user but no projects, show the empty state
    if (projects.length === 0) {
      return (
        <EmptyState
          title="No projects yet"
          message="Get started by creating your first project blueprint."
          actionText="Create Blueprint"
          onAction={() => window.location.href = '/'}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
        />
      );
    }

    // If we have a user and projects, show the list
    return (
      <div className="space-y-4">
        {projects.map(project => (
          <div
            key={project.id}
            className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.stack.slice(0, 3).map((tech, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {tech}
                    </span>
                  ))}
                  {project.stack.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{project.stack.length - 3} more
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Updated {formatDate(project.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(project.id);
                }}
                className="text-red-500 hover:text-red-700 p-1"
                title="Delete project"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          {user && isClient && (
            <div className="text-sm font-semibold text-gray-700">
              {user.name || user.email}
            </div>
          )}
        </header>
        <div className="space-y-4">
          {renderContent()}
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && isClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedProject.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Technology Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.stack.map((tech, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedProject.blueprint && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Blueprint</h3>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                      {JSON.stringify(selectedProject.blueprint, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
