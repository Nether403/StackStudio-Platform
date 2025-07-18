import React from 'react';
import EmptyState from './EmptyState';

interface LoginPromptProps {
  onLogin: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onLogin }) => (
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

export default LoginPrompt; 