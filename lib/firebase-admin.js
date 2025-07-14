// Firebase Admin SDK Configuration
// This file sets up Firebase Admin for server-side operations

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
};

let app = null;
let db = null;

// Only initialize Firebase if properly configured
if (isFirebaseConfigured()) {
  try {
    // Initialize Firebase Admin
    const firebaseAdminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    };

    // Initialize the app if it hasn't been initialized already
    app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

    // Initialize Firestore
    db = getFirestore(app);
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.warn('⚠️ Firebase Admin initialization failed:', error.message);
    console.warn('🔧 Running in development mode without Firebase');
  }
} else {
  console.warn('⚠️ Firebase environment variables not configured');
  console.warn('🔧 Running in development mode without Firebase');
  console.warn('💡 To enable Firebase, copy .env.example to .env.local and configure');
}

// Export with fallback for development
export { app, db };
