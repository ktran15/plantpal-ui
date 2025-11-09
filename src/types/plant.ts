import { Timestamp } from 'firebase/firestore';

// Frontend Plant interface (for existing UI)
export interface Plant {
  id: string;
  name: string;
  species: string;
  spriteUrl: string; // single PNG data URL with alpha
  xp: number;
  state: 'happy' | 'neutral' | 'sad' | 'sick' | 'evolving';
  createdAt: string;
}

// Firestore Plant Document interface (for backend/AI system)
export interface PlantDocument {
  name: string;
  species: string;
  happiness: number; // 0-100
  daysInCare: number;
  wateringIntervalDays: number;
  fertilizingIntervalDays: number;
  lastWatered: Timestamp | null;
  lastFertilized: Timestamp | null;
  nextWatering: Timestamp | null;
  nextFertilizing: Timestamp | null;
  photoUrls: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

// Happiness level status
export type HappinessStatus = 'healthy' | 'needs_attention' | 'neglected' | 'emergency';

// Plant care task
export interface PlantTask {
  id: string;
  plantId: string;
  plantName: string;
  type: 'watering' | 'fertilizing';
  scheduledDate: Timestamp;
  completed: boolean;
  completedAt?: Timestamp;
  userId: string;
}

// API request/response types
export interface PlantAgentRequest {
  userId: string;
  plantId: string;
  action: 'update_status' | 'generate_schedule' | 'analyze_photo';
  data: {
    taskType?: 'watering' | 'fertilizing';
    completed?: boolean;
    imageUrl?: string;
    species?: string;
    currentIntervals?: {
      watering?: number;
      fertilizing?: number;
    };
  };
}

export interface PlantAgentResponse {
  plantId: string;
  status: 'updated' | 'created' | 'error';
  happiness?: number;
  watering_interval_days?: number;
  fertilizing_interval_days?: number;
  recommendations?: string;
  healthStatus?: HappinessStatus;
  error?: string;
}

// Care recommendations from AI
export interface CareRecommendations {
  watering: string;
  sunlight: string;
  humidity: string;
  temperature?: string;
  fertilizing?: string;
}

