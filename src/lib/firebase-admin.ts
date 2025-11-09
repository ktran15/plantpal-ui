import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Use service account JSON file directly (most reliable)
    const serviceAccountPath = path.resolve(__dirname, '../../keys/firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
      });
      
      console.log('✅ Firebase Admin initialized successfully');
      console.log(`   Project: ${serviceAccount.project_id}`);
      console.log(`   Storage: ${serviceAccount.project_id}.appspot.com`);
    } else {
      throw new Error(`Service account file not found at: ${serviceAccountPath}`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    console.error('   Make sure keys/firebase-service-account.json exists');
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

