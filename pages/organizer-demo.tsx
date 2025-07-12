import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with Firebase
const StackStudioOrganizer = dynamic(
  () => import('../components/StackStudioOrganizer'),
  { ssr: false }
);

export default function OrganizerDemo() {
  const { data: session } = useSession();
  const [boardId, setBoardId] = useState('');
  const [showOrganizer, setShowOrganizer] = useState(false);

  const handleCreateDemoBoard = async () => {
    if (!session) {
      alert('Please log in to create a demo board');
      return;
    }

    try {
      // Create a demo board
      const response = await fetch('/api/organizer/create-from-blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectName: 'Demo Project',
          recommendations: [
            { name: 'Next.js', category: 'Frontend', reason: 'React framework for production' },
            { name: 'Tailwind CSS', category: 'Frontend', reason: 'Utility-first CSS framework' },
            { name: 'Firebase', category: 'Backend', reason: 'Backend as a service' },
            { name: 'TypeScript', category: 'Language', reason: 'Type safety for JavaScript' }
          ]
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setBoardId(data.boardId);
        setShowOrganizer(true);
      } else {
        alert(`Error creating demo board: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating demo board:', error);
      alert('Error creating demo board. Please try again.');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">StackStudio Organizer Demo</h2>
          <p className="text-gray-600 mb-8">Please log in to try the organizer feature.</p>
          <button
            onClick={() => window.location.href = '/api/auth/signin'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (showOrganizer && boardId) {
    return (
      <StackStudioOrganizer
        boardId={boardId}
        projectName="Demo Project"
        onClose={() => setShowOrganizer(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">StackStudio Organizer Demo</h1>
        
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome to the StackStudio Organizer!</h2>
          <p className="text-gray-600 mb-6">
            Transform AI-generated blueprints into actionable project boards with our Kanban-style organizer. 
            This demo will create a sample project board with tasks based on common web development tools.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="text-lg font-medium">Kanban Board Interface</span>
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-lg font-medium">Real-time Updates</span>
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-lg font-medium">Task Categorization</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreateDemoBoard}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
        >
          Create Demo Board
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          This will create a sample project board with tasks for Next.js, Tailwind CSS, Firebase, and TypeScript.
        </p>
      </div>
    </div>
  );
}
