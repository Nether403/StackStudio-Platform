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

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth Providers
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
