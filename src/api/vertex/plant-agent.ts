import express, { Request, Response } from 'express';
import { db, getCurrentTimestamp, dateToTimestamp } from '../../lib/firebase-admin';
import { runVertexAgent, getHappinessStatus } from '../../lib/vertex-ai';
import { PlantAgentRequest, PlantAgentResponse, PlantDocument, PlantTask } from '../../types/plant';
import admin from 'firebase-admin';

const router = express.Router();

/**
 * Middleware to verify Firebase authentication token
 */
async function verifyAuth(req: Request, res: Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).userId = decodedToken.uid;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * POST /api/vertex/plant-agent
 * Main endpoint for plant agent actions
 */
router.post('/', verifyAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const request: PlantAgentRequest = req.body;

    // Validate request
    if (!request.plantId || !request.action) {
      return res.status(400).json({ error: 'Missing required fields: plantId, action' });
    }

    // Verify user owns the plant
    const plantRef = db.collection('plants').doc(request.plantId);
    const plantDoc = await plantRef.get();

    if (!plantDoc.exists) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const plantData = plantDoc.data() as PlantDocument;
    if (plantData.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized: Plant belongs to different user' });
    }

    // Route to appropriate action handler
    let response: PlantAgentResponse;
    switch (request.action) {
      case 'generate_schedule':
        response = await handleGenerateSchedule(plantRef, plantData, request);
        break;
      case 'update_status':
        response = await handleUpdateStatus(plantRef, plantData, request);
        break;
      case 'analyze_photo':
        response = await handleAnalyzePhoto(plantRef, plantData, request);
        break;
      default:
        return res.status(400).json({ error: `Unknown action: ${request.action}` });
    }

    res.json(response);
  } catch (error) {
    console.error('Plant agent API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Handle generate_schedule action
 */
async function handleGenerateSchedule(
  plantRef: admin.firestore.DocumentReference,
  plantData: PlantDocument,
  request: PlantAgentRequest
): Promise<PlantAgentResponse> {
  const payload = {
    species: plantData.species,
    currentIntervals: {
      watering: plantData.wateringIntervalDays,
      fertilizing: plantData.fertilizingIntervalDays,
    },
  };

  const aiResponse = await runVertexAgent('generate_schedule', payload);

  // Update plant document with new schedule
  const now = getCurrentTimestamp();
  const wateringInterval = aiResponse.watering_interval_days || plantData.wateringIntervalDays;
  const fertilizingInterval = aiResponse.fertilizing_interval_days || plantData.fertilizingIntervalDays;

  const nextWatering = dateToTimestamp(
    new Date(Date.now() + wateringInterval * 24 * 60 * 60 * 1000)
  );
  const nextFertilizing = dateToTimestamp(
    new Date(Date.now() + fertilizingInterval * 24 * 60 * 60 * 1000)
  );

  await plantRef.update({
    wateringIntervalDays: wateringInterval,
    fertilizingIntervalDays: fertilizingInterval,
    nextWatering,
    nextFertilizing,
    updatedAt: now,
  });

  // Create tasks in Firestore
  await createTasksForPlant(
    plantData.userId,
    request.plantId,
    plantData.name,
    nextWatering,
    nextFertilizing
  );

  return {
    plantId: request.plantId,
    status: 'updated',
    watering_interval_days: wateringInterval,
    fertilizing_interval_days: fertilizingInterval,
    recommendations: aiResponse.recommendations,
  };
}

/**
 * Handle update_status action
 */
async function handleUpdateStatus(
  plantRef: admin.firestore.DocumentReference,
  plantData: PlantDocument,
  request: PlantAgentRequest
): Promise<PlantAgentResponse> {
  const taskType = request.data.taskType;
  const completed = request.data.completed ?? true;

  if (!taskType) {
    throw new Error('taskType is required for update_status action');
  }

  // Calculate happiness change
  let happinessChange = 0;
  if (completed) {
    happinessChange = taskType === 'watering' ? 1 : 3;
  } else {
    happinessChange = taskType === 'watering' ? -1 : -3;
  }

  const newHappiness = Math.max(0, Math.min(100, plantData.happiness + happinessChange));

  // Get AI recommendations
  const payload = {
    taskType,
    completed,
    currentHappiness: plantData.happiness,
    careHistory: [], // Could be expanded to include historical data
  };

  const aiResponse = await runVertexAgent('update_status', payload);

  // Use AI-calculated happiness if provided, otherwise use our calculation
  const finalHappiness = aiResponse.happiness ?? newHappiness;
  const healthStatus = aiResponse.healthStatus || getHappinessStatus(finalHappiness);

  // Update timestamps if task was completed
  const now = getCurrentTimestamp();
  const updates: any = {
    happiness: finalHappiness,
    updatedAt: now,
  };

  if (completed && taskType === 'watering') {
    updates.lastWatered = now;
    // Calculate next watering
    const nextWatering = dateToTimestamp(
      new Date(Date.now() + plantData.wateringIntervalDays * 24 * 60 * 60 * 1000)
    );
    updates.nextWatering = nextWatering;
  } else if (completed && taskType === 'fertilizing') {
    updates.lastFertilized = now;
    // Calculate next fertilizing
    const nextFertilizing = dateToTimestamp(
      new Date(Date.now() + plantData.fertilizingIntervalDays * 24 * 60 * 60 * 1000)
    );
    updates.nextFertilizing = nextFertilizing;
  }

  await plantRef.update(updates);

  return {
    plantId: request.plantId,
    status: 'updated',
    happiness: finalHappiness,
    healthStatus,
    recommendations: aiResponse.recommendations,
  };
}

/**
 * Handle analyze_photo action
 */
async function handleAnalyzePhoto(
  plantRef: admin.firestore.DocumentReference,
  plantData: PlantDocument,
  request: PlantAgentRequest
): Promise<PlantAgentResponse> {
  const imageUrl = request.data.imageUrl;

  if (!imageUrl) {
    throw new Error('imageUrl is required for analyze_photo action');
  }

  const payload = { imageUrl };
  const aiResponse = await runVertexAgent('analyze_photo', payload);

  // Update plant with photo URL and happiness
  const now = getCurrentTimestamp();
  const photoUrls = [...(plantData.photoUrls || []), imageUrl];
  const happiness = aiResponse.happiness ?? plantData.happiness;
  const healthStatus = aiResponse.healthStatus || getHappinessStatus(happiness);

  await plantRef.update({
    photoUrls,
    happiness,
    updatedAt: now,
  });

  return {
    plantId: request.plantId,
    status: 'updated',
    happiness,
    healthStatus,
    recommendations: aiResponse.recommendations,
  };
}

/**
 * Create tasks in Firestore for a plant
 */
async function createTasksForPlant(
  userId: string,
  plantId: string,
  plantName: string,
  nextWatering: admin.firestore.Timestamp | null,
  nextFertilizing: admin.firestore.Timestamp | null
) {
  const tasksRef = db.collection('tasks');

  // Create watering task if nextWatering is set
  if (nextWatering) {
    const wateringTask = await tasksRef.add({
      plantId,
      plantName,
      type: 'watering',
      scheduledDate: nextWatering,
      completed: false,
      userId,
      createdAt: getCurrentTimestamp(),
    });
    // Task ID is automatically generated by Firestore
  }

  // Create fertilizing task if nextFertilizing is set
  if (nextFertilizing) {
    const fertilizingTask = await tasksRef.add({
      plantId,
      plantName,
      type: 'fertilizing',
      scheduledDate: nextFertilizing,
      completed: false,
      userId,
      createdAt: getCurrentTimestamp(),
    });
    // Task ID is automatically generated by Firestore
  }
}

export default router;

