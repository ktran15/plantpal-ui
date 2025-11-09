import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if we have environment variables for Firebase Admin
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (projectId && privateKey && clientEmail) {
      // Initialize with service account credentials from environment
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Initialize with service account key file
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // Fallback: try to use default credentials (for local development with gcloud auth)
      console.warn('Firebase Admin: Using default credentials. Make sure GOOGLE_APPLICATION_CREDENTIALS is set or use environment variables.');
      admin.initializeApp({
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

// Export Firestore instance
export const db = getFirestore();

// Export Storage instance
export const storage = getStorage();

// Export admin for other uses
export { admin };

// Helper function to convert Firestore Timestamp to Date
export function timestampToDate(timestamp: admin.firestore.Timestamp | null): Date | null {
  return timestamp ? timestamp.toDate() : null;
}

// Helper function to convert Date to Firestore Timestamp
export function dateToTimestamp(date: Date | null): admin.firestore.Timestamp | null {
  return date ? admin.firestore.Timestamp.fromDate(date) : null;
}

// Helper function to get current timestamp
export function getCurrentTimestamp(): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.now();
}

