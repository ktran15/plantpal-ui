import { Plant } from '../types/plant';

const STORAGE_KEY = 'plantpals_plants';

/**
 * Get all plants from localStorage
 */
export function getAllPlants(): Plant[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Plant[];
  } catch (error) {
    console.error('Failed to load plants from storage:', error);
    return [];
  }
}

/**
 * Save all plants to localStorage
 */
export function savePlants(plants: Plant[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
  } catch (error) {
    console.error('Failed to save plants to storage:', error);
    throw error;
  }
}

/**
 * Create a new plant
 */
export function createPlant(plant: Omit<Plant, 'id' | 'createdAt'>): Plant {
  const newPlant: Plant = {
    ...plant,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };

  const plants = getAllPlants();
  plants.push(newPlant);
  savePlants(plants);

  return newPlant;
}

/**
 * Get a plant by ID
 */
export function getPlantById(id: string): Plant | null {
  const plants = getAllPlants();
  return plants.find((p) => p.id === id) || null;
}

/**
 * Update a plant
 */
export function updatePlant(id: string, updates: Partial<Plant>): Plant | null {
  const plants = getAllPlants();
  const index = plants.findIndex((p) => p.id === id);

  if (index === -1) return null;

  plants[index] = { ...plants[index], ...updates };
  savePlants(plants);

  return plants[index];
}

/**
 * Delete a plant
 */
export function deletePlant(id: string): boolean {
  const plants = getAllPlants();
  const filtered = plants.filter((p) => p.id !== id);

  if (filtered.length === plants.length) return false;

  savePlants(filtered);
  return true;
}

