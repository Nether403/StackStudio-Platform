import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Task, 
  Column, 
  Board, 
  organizerService 
} from '../services/organizerService';
import { categoryColors, priorityColors, CategoryKey, PriorityKey } from '../constants/colors';

interface StackStudioOrganizerProps {
  boardId: string;
  projectName?: string;
  onClose?: () => void;
}

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
  const [darkMode, setDarkMode] = useState(false);

  // Dark mode detection
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

  // Persist board state to Firestore
  const saveBoard = useCallback(async (boardData: Board) => {
    try {
      await organizerService.updateBoard(boardData.boardId, boardData);
    } catch (error) {
      console.error('Error saving board:', error);
      setError('Failed to save board changes');
    }
  }, []);

  const handleDragEnd = useCallback(async (newColumnId: string, taskId: string) => {
    // Use current state to avoid stale data
    const currentTask = tasks.find(t => t.taskId === taskId);
    if (!currentTask) {
      console.warn('Task not found:', taskId);
      return;
    }

    // If same column, ignore drop or append to end
    if (currentTask.columnId === newColumnId) {
      console.log('Task dropped in same column, ignoring');
      return;
    }

    // Update task's column using fresh state
    const updatedTask = { ...currentTask, columnId: newColumnId };

    try {
      // Optimistic update
      setTasks(prevTasks => 
        prevTasks.map(t => t.taskId === taskId ? updatedTask : t)
      );

      // Persist immediately to Firestore
      await organizerService.updateTask(taskId, updatedTask);
      
      // Update board state if needed
      if (board) {
        await saveBoard(board);
      }
    } catch (error) {
      console.error('Error moving task:', error);
      setError('Failed to move task. Please try again.');
      
      // Revert optimistic update on error
      setTasks(prevTasks => 
        prevTasks.map(t => t.taskId === taskId ? currentTask : t)
      );
    }
  }, [tasks, board, saveBoard]);

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
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`shadow-sm border-b transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {board?.title || projectName}
              </h1>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {board?.description || 'AI-generated project organizer'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
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
      </div>

      {/* Kanban Board */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {columns.map(column => (
            <div
              key={column.id}
              className={`flex-shrink-0 w-80 rounded-lg shadow-sm border transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Column Header */}
              <div className={`p-4 border-b transition-colors duration-200 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className={`font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {column.title}
                    </h3>
                  </div>
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {getTasksByColumn(column.columnId).length}
                  </span>
                </div>
              </div>

              {/* Column Tasks */}
              <div 
                className={`p-4 min-h-[200px] space-y-3 transition-colors duration-200 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}
                role="list"
                aria-label={`Tasks in ${column.title}`}
              >
                {getTasksByColumn(column.columnId).map((task) => (
                  <div
                    key={task.taskId}
                    className={`border rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    role="listitem"
                    aria-grabbed="false"
                  >
                    {/* Task Content */}
                    <div className="mb-3">
                      {editingTask === task.id ? (
                        <div>
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className={`w-full p-2 border rounded resize-none transition-colors duration-200 ${
                              darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
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
                            aria-label="Edit task content"
                          />
                        </div>
                      ) : (
                        <div
                          className={`cursor-pointer transition-colors duration-200 ${
                            darkMode 
                              ? 'text-gray-100 hover:text-blue-400' 
                              : 'text-gray-900 hover:text-blue-600'
                          }`}
                          onClick={() => {
                            setEditingTask(task.id);
                            setEditingContent(task.content);
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label="Click to edit task"
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
                          <span className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Category */}
                        <span className={`px-2 py-1 rounded-full text-xs border ${
                          categoryColors[task.category as CategoryKey] || 
                          categoryColors['General']
                        }`}>
                          {task.category}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        {task.estimatedHours && (
                          <span className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {task.estimatedHours}h
                          </span>
                        )}
                        
                        {/* Move Task Dropdown */}
                        <select
                          value={task.columnId}
                          onChange={(e) => handleDragEnd(e.target.value, task.taskId)}
                          className={`text-xs border rounded px-1 py-0.5 mr-1 transition-colors duration-200 ${
                            darkMode 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          title="Move to column"
                          aria-label="Move task to different column"
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
                          className={`p-1 rounded transition-colors duration-200 ${
                            darkMode 
                              ? 'text-gray-400 hover:text-red-400' 
                              : 'text-gray-400 hover:text-red-600'
                          }`}
                          title="Delete task"
                          aria-label="Delete task"
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
                            className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                              darkMode 
                                ? 'bg-gray-600 text-gray-300' 
                                : 'bg-gray-100 text-gray-600'
                            }`}
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
