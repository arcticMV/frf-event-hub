import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getConfig } from '@/lib/config';

// Firebase App Hosting provides config as FIREBASE_WEBAPP_CONFIG during build
// Fall back to individual env vars for local development
const getFirebaseConfig = () => {
  // Check if running in Firebase App Hosting (build or runtime)
  if (process.env.FIREBASE_WEBAPP_CONFIG) {
    try {
      return JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
    } catch (e) {
      console.error('Failed to parse FIREBASE_WEBAPP_CONFIG:', e);
    }
  }

  // Fall back to individual environment variables for local development
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
};

const firebaseConfig = getFirebaseConfig();

// Only initialize Firebase if we have valid config
let app;
if (firebaseConfig.apiKey) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} else {
  console.warn('Firebase configuration is missing. Some features may not work.');
  // Create a dummy app for build time when config might not be available
  app = getApps()[0] || null;
}

export const auth = app ? getAuth(app) : null as any;
export const db = app ? getFirestore(app) : null as any;
export const storage = app ? getStorage(app) : null as any;

export const analytics = async () => {
  if (typeof window !== 'undefined' && app) {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  }
  return null;
};

export default app;