// User Dashboard Component
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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<SavedProject | null>(null);

  useEffect(() => {
    if (user) {
      loadUserProjects();
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to StackFast</h2>
        <p className="text-gray-600 mt-2">Sign in to save and manage your project roadmaps</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading your projects...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
        <p className="text-gray-600 mt-2">
          {projects.length > 0 
            ? `Manage your ${projects.length} saved project${projects.length !== 1 ? 's' : ''}`
            : 'No projects yet. Create your first project to get started!'
          }
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
          <p className="text-gray-600 mb-4">Create your first project to start building with StackFast</p>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Project
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                </div>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete project"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tech Stack:</h4>
                <div className="flex flex-wrap gap-1">
                  {project.stack.slice(0, 3).map((tech, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tech}
                    </span>
                  ))}
                  {project.stack.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{project.stack.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Created {formatDate(project.createdAt)}</span>
                <span>Updated {formatDate(project.updatedAt)}</span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close modal"
                  aria-label="Close project details"
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
