import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Task, 
  Column, 
  Board, 
  organizerService 
} from '../services/organizerService';

interface StackStudioOrganizerProps {
  boardId: string;
  projectName?: string;
  onClose?: () => void;
}

const categoryColors = {
  'Database': 'bg-blue-100 border-blue-300 text-blue-800',
  'Frontend': 'bg-green-100 border-green-300 text-green-800',
  'Backend': 'bg-purple-100 border-purple-300 text-purple-800',
  'API': 'bg-orange-100 border-orange-300 text-orange-800',
  'DevOps': 'bg-red-100 border-red-300 text-red-800',
  'Testing': 'bg-yellow-100 border-yellow-300 text-yellow-800',
  'Design': 'bg-pink-100 border-pink-300 text-pink-800',
  'Security': 'bg-gray-100 border-gray-300 text-gray-800'
};

const priorityColors = {
  'High': 'bg-red-500',
  'Medium': 'bg-yellow-500',
  'Low': 'bg-green-500'
};

export default function StackStudioOrganizer({ 
  boardId, 
  projectName = 'Project Board',
  onClose 
}: StackStudioOrganizerProps) {
  const { data: session } = useSession();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null);
  const [newTaskContent, setNewTaskContent] = useState('');

  // Subscribe to real-time updates
  useEffect(() => {
    if (!boardId || !session) return;

    setLoading(true);
    
    const unsubscribes: (() => void)[] = [];

    // Subscribe to board
    const boardUnsub = organizerService.subscribeToBoard(boardId, (boardData: Board | null) => {
      setBoard(boardData);
      setLoading(false);
    });
    unsubscribes.push(boardUnsub);

    // Subscribe to columns
    const columnsUnsub = organizerService.subscribeToColumns(boardId, (columnsData: Column[]) => {
      setColumns(columnsData.sort((a, b) => a.position - b.position));
    });
    unsubscribes.push(columnsUnsub);

    // Subscribe to tasks
    const tasksUnsub = organizerService.subscribeToTasks(boardId, (tasksData: Task[]) => {
      setTasks(tasksData);
    });
    unsubscribes.push(tasksUnsub);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [boardId, session]);

  const handleDragEnd = useCallback(async (columnId: string, taskId: string) => {
    // Find the task being moved
    const task = tasks.find(t => t.taskId === taskId);
    if (!task) return;

    // If already in the same column, do nothing
    if (task.columnId === columnId) return;

    // Update task's column
    const updatedTask = { ...task, columnId };

    try {
      await organizerService.updateTask(taskId, updatedTask);
      
      // Update local state optimistically
      setTasks(prevTasks => 
        prevTasks.map(t => t.taskId === taskId ? updatedTask : t)
      );
    } catch (error) {
      console.error('Error moving task:', error);
      setError('Failed to move task. Please try again.');
    }
  }, [tasks]);

  const handleTaskEdit = async (taskId: string, content: string) => {
    try {
      const task = tasks.find(t => t.taskId === taskId);
      if (!task) return;

      const updatedTask = { ...task, content };
      await organizerService.updateTask(taskId, updatedTask);
      
      setEditingTask(null);
      setEditingContent('');
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleAddTask = async (columnId: string) => {
    if (!newTaskContent.trim()) return;

    try {
      const newTask = {
        taskId: `task_${Date.now()}`,
        boardId,
        columnId,
        content: newTaskContent,
        category: 'General',
        priority: 'Medium' as const,
        estimatedHours: 1,
        toolName: 'Manual',
        dependencies: [],
        tags: []
      };

      await organizerService.createTask(newTask);
      setIsAddingTask(null);
      setNewTaskContent('');
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await organizerService.deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  const getTasksByColumn = (columnId: string) => {
    return tasks.filter(task => task.columnId === columnId);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the project organizer.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your project board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {board?.title || projectName}
              </h1>
              <p className="text-sm text-gray-600">
                {board?.description || 'AI-generated project organizer'}
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close organizer"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 overflow-x-auto pb-6">
          {columns.map(column => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm border"
            >
              {/* Column Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {getTasksByColumn(column.columnId).length}
                  </span>
                </div>
              </div>

              {/* Column Tasks */}
              <div className="p-4 min-h-[200px] space-y-3">
                {getTasksByColumn(column.columnId).map((task) => (
                  <div
                    key={task.id}
                    className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Task Content */}
                    <div className="mb-3">
                      {editingTask === task.id ? (
                        <div>
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full p-2 border rounded resize-none"
                            rows={2}
                            onBlur={() => handleTaskEdit(task.taskId, editingContent)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleTaskEdit(task.taskId, editingContent);
                              } else if (e.key === 'Escape') {
                                setEditingTask(null);
                                setEditingContent('');
                              }
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div
                          className="text-gray-900 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setEditingTask(task.id);
                            setEditingContent(task.content);
                          }}
                        >
                          {task.content}
                        </div>
                      )}
                    </div>

                    {/* Task Metadata */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {/* Priority */}
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-1 ${priorityColors[task.priority]}`}
                          />
                          <span className="text-xs text-gray-500">{task.priority}</span>
                        </div>

                        {/* Category */}
                        <span className={`px-2 py-1 rounded-full text-xs border ${
                          categoryColors[task.category as keyof typeof categoryColors] || 
                          'bg-gray-100 border-gray-300 text-gray-800'
                        }`}>
                          {task.category}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        {task.estimatedHours && (
                          <span className="text-xs text-gray-500">
                            {task.estimatedHours}h
                          </span>
                        )}
                        
                        {/* Move Task Buttons */}
                        <select
                          value={task.columnId}
                          onChange={(e) => handleDragEnd(e.target.value, task.taskId)}
                          className="text-xs border rounded px-1 py-0.5 mr-1"
                          title="Move to column"
                        >
                          {columns.map(col => (
                            <option key={col.columnId} value={col.columnId}>
                              {col.title}
                            </option>
                          ))}
                        </select>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.taskId);
                          }}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete task"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Task */}
                <div className="mt-3">
                  {isAddingTask === column.columnId ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3">
                      <textarea
                        value={newTaskContent}
                        onChange={(e) => setNewTaskContent(e.target.value)}
                        placeholder="Enter task description..."
                        className="w-full p-2 border rounded resize-none"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddTask(column.columnId);
                          } else if (e.key === 'Escape') {
                            setIsAddingTask(null);
                            setNewTaskContent('');
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => {
                            setIsAddingTask(null);
                            setNewTaskContent('');
                          }}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddTask(column.columnId)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Add Task
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingTask(column.columnId)}
                      className="w-full p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg transition-colors"
                    >
                      + Add a task
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
