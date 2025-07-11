// Firebase Admin SDK Configuration
// This file sets up Firebase Admin for server-side operations

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

// Initialize Firestore
export const db = getFirestore(app);

export { app };
