import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase-client';
import { Plant } from '../types/plant';
import { PlantDocument } from '../types/plant';
import { getAllPlants } from '../services/plants';

/**
 * Migrate plants from localStorage to Firestore
 */
export async function migrateLocalStoragePlantsToFirestore(
  userId: string = 'local-user'
): Promise<{ success: number; failed: number; errors: string[] }> {
  if (!db) {
    throw new Error('Firestore not configured');
  }

  const localPlants = getAllPlants();
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  console.log(`Starting migration of ${localPlants.length} plants...`);

  for (const plant of localPlants) {
    try {
      // Create Firestore document with full structure
      const now = Timestamp.now();
      const createdAt = plant.createdAt 
        ? Timestamp.fromDate(new Date(plant.createdAt))
        : now;

      const plantDoc: PlantDocument = {
        name: plant.name,
        species: plant.species,
        happiness: plant.xp || 75, // Use XP as initial happiness, default to 75
        daysInCare: 0, // Will be calculated from createdAt
        wateringIntervalDays: 7, // Default watering interval
        fertilizingIntervalDays: 14, // Default fertilizing interval
        lastWatered: null,
        lastFertilized: null,
        nextWatering: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days from now
        nextFertilizing: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)), // 14 days from now
        photoUrls: [],
        createdAt,
        updatedAt: now,
        userId,
      };

      // Use the same ID from localStorage
      const plantRef = doc(db, 'plants', plant.id);
      await setDoc(plantRef, plantDoc);

      console.log(`✅ Migrated: ${plant.name} (ID: ${plant.id})`);
      results.success++;
    } catch (error) {
      console.error(`❌ Failed to migrate ${plant.name}:`, error);
      results.failed++;
      results.errors.push(`${plant.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log(`\n📊 Migration complete: ${results.success} success, ${results.failed} failed`);
  return results;
}

/**
 * Check if a plant exists in Firestore
 */
export async function checkPlantInFirestore(plantId: string): Promise<boolean> {
  if (!db) return false;
  
  try {
    const plantRef = doc(db, 'plants', plantId);
    const plantSnap = await (await import('firebase/firestore')).getDoc(plantRef);
    return plantSnap.exists();
  } catch (error) {
    console.error('Error checking Firestore:', error);
    return false;
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus(): Promise<{
  localCount: number;
  firestoreCount: number;
  needsMigration: boolean;
}> {
  const localPlants = getAllPlants();
  
  if (!db) {
    return {
      localCount: localPlants.length,
      firestoreCount: 0,
      needsMigration: true,
    };
  }

  try {
    // Check how many plants exist in Firestore
    let firestoreCount = 0;
    for (const plant of localPlants) {
      const exists = await checkPlantInFirestore(plant.id);
      if (exists) firestoreCount++;
    }

    return {
      localCount: localPlants.length,
      firestoreCount,
      needsMigration: firestoreCount < localPlants.length,
    };
  } catch (error) {
    console.error('Error getting migration status:', error);
    return {
      localCount: localPlants.length,
      firestoreCount: 0,
      needsMigration: true,
    };
  }
}

