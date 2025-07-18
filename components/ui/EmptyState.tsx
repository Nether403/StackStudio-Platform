import React from 'react';

export interface EmptyStateProps {
  title: string;
  message: string;
  icon: React.ReactNode;
  onAction?: () => void;
  actionText?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, icon, onAction, actionText }) => (
  <div className="text-center p-8 bg-white rounded-xl border-2 border-dashed border-gray-200" role="status" aria-live="polite">
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

export default EmptyState; 