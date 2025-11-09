import { PlantAgentRequest, PlantAgentResponse } from '../types/plant';
import { auth } from '../lib/firebase-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Get Firebase auth token
 */
async function getAuthToken(): Promise<string | null> {
  if (!auth) {
    console.warn('Firebase Auth not initialized');
    return null;
  }
  
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}

/**
 * Call the plant agent API
 */
export async function callPlantAgent(
  request: PlantAgentRequest
): Promise<PlantAgentResponse> {
  try {
    const token = await getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/vertex/plant-agent`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `API error: ${response.status} ${response.statusText}`
      );
    }

    const data: PlantAgentResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Plant agent API call failed:', error);
    throw error;
  }
}

/**
 * Generate schedule for a plant
 */
export async function generateSchedule(
  userId: string,
  plantId: string,
  species?: string,
  currentIntervals?: { watering?: number; fertilizing?: number }
): Promise<PlantAgentResponse> {
  return callPlantAgent({
    userId,
    plantId,
    action: 'generate_schedule',
    data: {
      species,
      currentIntervals,
    },
  });
}

/**
 * Update plant status (happiness) based on task completion
 */
export async function updatePlantStatus(
  userId: string,
  plantId: string,
  taskType: 'watering' | 'fertilizing',
  completed: boolean
): Promise<PlantAgentResponse> {
  return callPlantAgent({
    userId,
    plantId,
    action: 'update_status',
    data: {
      taskType,
      completed,
    },
  });
}

/**
 * Analyze plant photo and set baseline happiness
 */
export async function analyzePlantPhoto(
  userId: string,
  plantId: string,
  imageUrl: string
): Promise<PlantAgentResponse> {
  return callPlantAgent({
    userId,
    plantId,
    action: 'analyze_photo',
    data: {
      imageUrl,
    },
  });
}

