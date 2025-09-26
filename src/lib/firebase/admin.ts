import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getConfig } from '@/lib/config';
import { getRegion } from '@/lib/firebase/regions';

let adminApp: App | undefined;

function getAdminApp(): App {
  if (!adminApp && !getApps().length) {
    const config = getConfig();
    const region = getRegion();

    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      projectId: config.firebase.projectId,
      storageBucket: config.firebase.storageBucket,
      databaseURL: `https://${config.firebase.projectId}-default-rtdb.${region}.firebasedatabase.app`,
    });
  }

  return adminApp || getApps()[0];
}

export const adminAuth = () => getAuth(getAdminApp());

export const adminDb = () => {
  const db = getFirestore(getAdminApp());
  // Configure Firestore settings for Europe region
  db.settings({
    preferRest: false,
    ignoreUndefinedProperties: true,
  });
  return db;
};

export const adminStorage = () => getStorage(getAdminApp());

export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
}

export async function createCustomToken(uid: string, claims?: object) {
  try {
    const customToken = await adminAuth().createCustomToken(uid, claims);
    return customToken;
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw error;
  }
}

export async function setCustomUserClaims(uid: string, claims: object) {
  try {
    await adminAuth().setCustomUserClaims(uid, claims);
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw error;
  }
}