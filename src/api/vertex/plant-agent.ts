import express, { Request, Response } from 'express';
import { db, getCurrentTimestamp, dateToTimestamp } from '../../lib/firebase-admin';
import { runVertexAgent, getHappinessStatus } from '../../lib/vertex-ai';
import { PlantAgentRequest, PlantAgentResponse, PlantDocument, PlantTask } from '../../types/plant';
import admin from 'firebase-admin';

const router = express.Router();

/**
 * Middleware to verify Firebase authentication token
 * In development mode, allows requests without auth
 */
async function verifyAuth(req: Request, res: Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    // Development mode: allow requests without auth
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('No auth token provided - using local-user for development');
      (req as any).userId = 'local-user';
      next();
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      (req as any).userId = decodedToken.uid;
      next();
    } catch (tokenError) {
      console.warn('Invalid token - using local-user for development:', tokenError);
      (req as any).userId = 'local-user';
      next();
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    (req as any).userId = 'local-user';
    next();
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
  console.log(`📅 Creating tasks for plant: ${plantData.name}`);
  await createTasksForPlant(
    plantData.userId || 'local-user', // Use userId from plantData or default
    request.plantId,
    plantData.name,
    nextWatering,
    nextFertilizing
  );
  console.log(`✅ Tasks created successfully`);

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

  // If this is the first photo, also generate a schedule
  if (photoUrls.length === 1) {
    try {
      console.log('First photo uploaded - generating care schedule...');
      await handleGenerateSchedule(plantRef, { ...plantData, photoUrls, happiness }, request);
    } catch (scheduleError) {
      console.error('Failed to generate schedule:', scheduleError);
      // Don't fail the whole request if schedule generation fails
    }
  }

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

  console.log(`Creating tasks with:`, {
    userId,
    plantId,
    plantName,
    nextWatering: nextWatering?.toDate(),
    nextFertilizing: nextFertilizing?.toDate(),
  });

  // Create watering task if nextWatering is set
  if (nextWatering) {
    const wateringTaskData = {
      plantId,
      plantName,
      type: 'watering' as const,
      scheduledDate: nextWatering,
      completed: false,
      userId,
      createdAt: getCurrentTimestamp(),
    };
    
    const wateringTask = await tasksRef.add(wateringTaskData);
    console.log(`✅ Created watering task:`, wateringTask.id, 'for', nextWatering.toDate());
  }

  // Create fertilizing task if nextFertilizing is set
  if (nextFertilizing) {
    const fertilizingTaskData = {
      plantId,
      plantName,
      type: 'fertilizing' as const,
      scheduledDate: nextFertilizing,
      completed: false,
      userId,
      createdAt: getCurrentTimestamp(),
    };
    
    const fertilizingTask = await tasksRef.add(fertilizingTaskData);
    console.log(`✅ Created fertilizing task:`, fertilizingTask.id, 'for', nextFertilizing.toDate());
  }
  
  console.log(`📋 Total tasks created for ${plantName}`);
}

export default router;

