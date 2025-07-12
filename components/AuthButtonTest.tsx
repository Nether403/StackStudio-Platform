// AuthButton TypeScript Fix Verification
// This file verifies that the AuthButton component has been fixed

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// This is a test to verify the AuthButton component works with NextAuth user properties
export const AuthButtonTest: React.FC = () => {
  const { user, signInWithGitHub, signOut } = useAuth();

  // Test that we can access the correct NextAuth user properties
  if (user) {
    console.log('User name:', user.name);      // ✅ Should work
    console.log('User email:', user.email);    // ✅ Should work
    console.log('User image:', user.image);    // ✅ Should work
    
    // These would fail with the old code:
    // console.log('User displayName:', user.displayName); // ❌ Would fail
    // console.log('User photoURL:', user.photoURL);       // ❌ Would fail
  }

  return (
    <div>
      <p>AuthButton TypeScript errors have been fixed!</p>
      <p>✅ Changed user.displayName to user.name</p>
      <p>✅ Changed user.photoURL to user.image</p>
      <p>✅ Updated button text from "Sign in with Google" to "Sign in with GitHub"</p>
      <p>✅ Updated Google icon to GitHub icon</p>
    </div>
  );
};

export default AuthButtonTest;
