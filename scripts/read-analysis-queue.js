const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Clear emulator environment variables to connect to production
delete process.env.FIRESTORE_EMULATOR_HOST;
delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
delete process.env.FIREBASE_STORAGE_EMULATOR_HOST;

// Initialize admin SDK - trying different approach
try {
  if (!admin.apps.length) {
    // Check if we have service account credentials
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@frf-event-hub.iam.gserviceaccount.com';

    if (process.env.FIREBASE_PRIVATE_KEY) {
      console.log('Using service account credentials');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'frf-event-hub',
          clientEmail: clientEmail,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.FIREBASE_PROJECT_ID || 'frf-event-hub',
      });
    } else {
      console.log('Service account credentials not complete. Missing FIREBASE_PRIVATE_KEY.');
      console.log('Trying application default credentials...');
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'frf-event-hub',
      });
    }
  }

  const db = admin.firestore();

  async function readAnalysisQueue() {
    try {
      console.log('Fetching verified_events collection...\n');

      const snapshot = await db.collection('verified_events').limit(3).get();

      if (snapshot.empty) {
        console.log('No documents found in verified_events collection');
        return;
      }

      console.log(`Found ${snapshot.size} documents (showing first 3):\n`);

      snapshot.forEach((doc) => {
        console.log('Document ID:', doc.id);
        const data = doc.data();

        // Pretty print with selective fields to avoid too much output
        console.log('Key fields:');
        console.log('  - Event ID:', data.eventId);
        console.log('  - Status:', data.reviewStatus);
        console.log('  - Reviewed By:', data.reviewedBy);
        console.log('  - Reviewed At:', data.reviewedAt ? new Date(data.reviewedAt._seconds * 1000).toLocaleString() : 'N/A');

        if (data.analysis) {
          console.log('  - Analysis Status:', data.analysis.status || 'N/A');
          console.log('  - Risk Score:', data.analysis.riskScore || 'N/A');
          if (data.analysis.keyFindings) {
            console.log('  - Key Findings:', data.analysis.keyFindings.slice(0, 2).join(', '), '...');
          }
        }

        console.log('\nFull Data:', JSON.stringify(data, null, 2).substring(0, 1000), '...\n');
        console.log('-------------------\n');
      });

      // Get total count
      const allDocs = await db.collection('verified_events').get();
      console.log(`Total documents in verified_events collection: ${allDocs.size}`);

    } catch (error) {
      console.error('Error reading analysis_queue:', error.message);
      console.error('Full error:', error);
    }
  }

  readAnalysisQueue().then(() => process.exit(0));

} catch (error) {
  console.error('Initialization error:', error.message);
  process.exit(1);
}