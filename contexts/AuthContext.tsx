// Authentication Context Provider using NextAuth.js
// This context manages user authentication state across the app

import React, { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Session } from 'next-auth';

interface AuthContextType {
  user: Session['user'] | null;
  loading: boolean;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();

  const handleSignInWithGitHub = async () => {
    try {
      await signIn('github');
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user: session?.user || null,
    loading: status === 'loading',
    signInWithGitHub: handleSignInWithGitHub,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
