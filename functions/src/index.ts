import * as functions from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onObjectFinalized } from 'firebase-functions/v2/storage';

// Set the region for all functions
const REGION = 'europe-west4';

// Example HTTP function
export const api = onRequest(
  {
    region: REGION,
    cors: true,
    maxInstances: 10,
  },
  async (request, response) => {
    response.json({
      message: 'Hello from Firebase Functions in Europe!',
      region: REGION
    });
  }
);

// Example Firestore trigger - when a new event is created
export const onEventCreated = onDocumentCreated(
  {
    region: REGION,
    document: 'events/{eventId}',
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }

    const data = snapshot.data();
    console.log('New event created:', data);

    // Add your logic here (e.g., send notifications, update counters, etc.)
  }
);

// Example Firestore trigger - when a registration is updated
export const onRegistrationUpdated = onDocumentUpdated(
  {
    region: REGION,
    document: 'registrations/{registrationId}',
  },
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (beforeData?.status !== afterData?.status) {
      console.log(`Registration status changed from ${beforeData?.status} to ${afterData?.status}`);
      // Add logic for status change (e.g., send email notification)
    }
  }
);

// Example Storage trigger - when an image is uploaded
export const processUploadedImage = onObjectFinalized(
  {
    region: REGION,
    bucket: 'event-images',
  },
  async (event) => {
    const filePath = event.data.name;
    const contentType = event.data.contentType;

    // Only process images
    if (!contentType?.startsWith('image/')) {
      return;
    }

    console.log('Processing uploaded image:', filePath);

    // Add your image processing logic here
    // (e.g., generate thumbnails, extract metadata, etc.)
  }
);

// Scheduled function example (runs every day at midnight Europe/Amsterdam time)
export const dailyCleanup = functions.scheduler.onSchedule({
  schedule: 'every day 00:00',
  timeZone: 'Europe/Amsterdam',
  region: REGION,
}, async (context) => {
  console.log('Running daily cleanup task');

  // Add your cleanup logic here
  // (e.g., delete old registrations, archive completed events, etc.)
});