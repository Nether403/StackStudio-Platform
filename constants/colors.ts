// Color constants for consistent theming across the application
export const categoryColors = {
  'Database': 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200',
  'Frontend': 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-600 dark:text-green-200',
  'Backend': 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900 dark:border-purple-600 dark:text-purple-200',
  'API': 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900 dark:border-orange-600 dark:text-orange-200',
  'DevOps': 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900 dark:border-red-600 dark:text-red-200',
  'Testing': 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-200',
  'Design': 'bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-900 dark:border-pink-600 dark:text-pink-200',
  'Security': 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200',
  'General': 'bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-200'
} as const;

export const priorityColors = {
  'High': 'bg-red-500 dark:bg-red-600',
  'Medium': 'bg-yellow-500 dark:bg-yellow-600',
  'Low': 'bg-green-500 dark:bg-green-600'
} as const;

export const columnColors = {
  'planning': '#6366f1',
  'setup': '#8b5cf6',
  'development': '#06b6d4',
  'testing': '#f59e0b',
  'deployment': '#10b981',
  'done': '#6b7280'
} as const;

export type CategoryKey = keyof typeof categoryColors;
export type PriorityKey = keyof typeof priorityColors;
export type ColumnKey = keyof typeof columnColors;
