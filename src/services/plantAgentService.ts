import { PlantAgentRequest, PlantAgentResponse } from '../types/plant';
import { auth } from '../lib/firebase-client';

// Dynamic API URL - uses same host as frontend, just different port
const getApiBaseUrl = () => {
  // If env variable is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Otherwise, use current hostname with port 3001
  const hostname = window.location.hostname;
  return `http://${hostname}:3001`;
};

const API_BASE_URL = getApiBaseUrl();

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

    console.log('Calling Plant Agent API:', {
      url: `${API_BASE_URL}/api/vertex/plant-agent`,
      action: request.action,
      plantId: request.plantId,
    });

    const response = await fetch(`${API_BASE_URL}/api/vertex/plant-agent`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error || errorData.message || `API error: ${response.status} ${response.statusText}`;
      console.error('API error response:', errorData);
      throw new Error(errorMsg);
    }

    const data: PlantAgentResponse = await response.json();
    console.log('API response:', data);
    return data;
  } catch (error) {
    console.error('Plant agent API call failed:', error);
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('API server not responding. Make sure "npm run server" is running on port 3001.');
    }
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

