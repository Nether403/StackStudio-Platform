// Firebase Configuration and Initialization
// This file sets up Firebase for the frontend application

import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  getDocs 
} from 'firebase/firestore';

// Firebase configuration - use fallback values if environment variables are missing
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Check if Firebase config is complete - for development use
const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                            process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && 
                            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Initialize Firebase - always initialize to prevent build errors
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export const isFirebaseAvailable = isFirebaseConfigured;

// Auth Providers - always create but warn if not configured
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const githubProvider = new GithubAuthProvider();
githubProvider.setCustomParameters({
  prompt: 'select_account'
});

// Authentication functions
export const signInWithGitHub = async () => {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not properly configured. Please set environment variables.');
    throw new Error('Firebase not configured. Please use NextAuth for authentication.');
  }
  
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;
    
    // Create or update user document in Firestore
    await createOrUpdateUserDocument(user, 'github');
    
    return user;
  } catch (error) {
    console.error('GitHub sign-in error:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not properly configured. Please set environment variables.');
    throw new Error('Firebase not configured. Please use NextAuth for authentication.');
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create or update user document in Firestore
    await createOrUpdateUserDocument(user, 'google');
    
    return user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not properly configured. Please set environment variables.');
    throw new Error('Firebase not configured. Please use NextAuth for authentication.');
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};

// User document management
const createOrUpdateUserDocument = async (user, provider) => {
  if (!user) return;
  
  if (!isFirebaseConfigured) {
    console.warn('Firebase not properly configured. User document management not available.');
    return;
  }

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const userData = {
    uid: user.uid,
    email: user.email,
    name: user.displayName || user.email.split('@')[0],
    avatarUrl: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&size=200`,
    provider: provider,
    lastLoginAt: serverTimestamp(),
  };

  if (!userSnap.exists()) {
    // Create new user document
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      preferences: {
        theme: 'light',
        notifications: true,
        defaultSkillLevel: 'intermediate'
      }
    });
  } else {
    // Update existing user document
    await setDoc(userRef, userData, { merge: true });
  }
};

// Blueprint management functions
export const saveBlueprint = async (userId, blueprintData) => {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not properly configured. Blueprint functionality not available.');
    throw new Error('Firebase not configured. Blueprint functionality requires Firebase setup.');
  }
  
  try {
    const blueprintRef = doc(collection(db, 'blueprints'));
    const blueprintDoc = {
      blueprintId: blueprintRef.id,
      userId: userId,
      projectName: blueprintData.projectName,
      projectIdea: blueprintData.projectIdea,
      blueprintData: blueprintData.blueprint,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublic: false,
      tags: blueprintData.tags || []
    };
    
    await setDoc(blueprintRef, blueprintDoc);
    return blueprintRef.id;
  } catch (error) {
    console.error('Error saving blueprint:', error);
    throw error;
  }
};

export const getUserBlueprints = async (userId) => {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not properly configured. Blueprint functionality not available.');
    throw new Error('Firebase not configured. Blueprint functionality requires Firebase setup.');
  }
  
  try {
    const blueprintsRef = collection(db, 'blueprints');
    const q = query(
      blueprintsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const blueprints = [];
    
    querySnapshot.forEach((doc) => {
      blueprints.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return blueprints;
  } catch (error) {
    console.error('Error fetching blueprints:', error);
    throw error;
  }
};

export const getBlueprint = async (blueprintId) => {
  try {
    const blueprintRef = doc(db, 'blueprints', blueprintId);
    const blueprintSnap = await getDoc(blueprintRef);
    
    if (blueprintSnap.exists()) {
      return {
        id: blueprintSnap.id,
        ...blueprintSnap.data()
      };
    } else {
      throw new Error('Blueprint not found');
    }
  } catch (error) {
    console.error('Error fetching blueprint:', error);
    throw error;
  }
};

// Export providers for testing
export { googleProvider, githubProvider };
