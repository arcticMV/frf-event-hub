const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Clear emulator environment variables to connect to production
delete process.env.FIRESTORE_EMULATOR_HOST;
delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
delete process.env.FIREBASE_STORAGE_EMULATOR_HOST;

// Check for required environment variables
if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error('Missing required environment variables. Please check .env.local file');
  console.error('Required: FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

// Initialize admin SDK with service account credentials
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'frf-event-hub',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID || 'frf-event-hub',
  });
}

const db = admin.firestore();

async function readStagingEvents() {
  try {
    console.log('Fetching analysis_queue collection...\n');

    const snapshot = await db.collection('analysis_queue').limit(5).get();

    if (snapshot.empty) {
      console.log('No documents found in analysis_queue collection');
      return;
    }

    console.log(`Found ${snapshot.size} documents (showing first 5):\n`);

    snapshot.forEach((doc) => {
      console.log('Document ID:', doc.id);
      console.log('Data:', JSON.stringify(doc.data(), null, 2));
      console.log('-------------------\n');
    });

    // Get total count
    const allDocs = await db.collection('analysis_queue').get();
    console.log(`Total documents in collection: ${allDocs.size}`);

  } catch (error) {
    console.error('Error reading analysis_queue:', error);
  }
}

readStagingEvents().then(() => process.exit(0));