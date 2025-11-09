import { VertexAI } from '@google-cloud/vertexai';
import { PlantAgentRequest, PlantAgentResponse, HappinessStatus } from '../types/plant';
import { getHappinessStatus, getHappinessColor, getHappinessStatusText } from '../utils/happiness';

// Re-export happiness utils for backward compatibility
export { getHappinessStatus, getHappinessColor, getHappinessStatusText };

// Initialize Vertex AI client
const projectId = process.env.GCP_PROJECT_ID || '';
const location = process.env.GCP_LOCATION || 'us-central1';

if (!projectId) {
  console.warn('GCP_PROJECT_ID not set. Vertex AI features will not work.');
}

let vertexAI: VertexAI | null = null;
let model: any = null;

try {
  if (projectId) {
    vertexAI = new VertexAI({ project: projectId, location });
    model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-2.5-pro',
    });
  }
} catch (error) {
  console.error('Failed to initialize Vertex AI:', error);
}

/**
 * Run Vertex AI agent for plant care actions
 */
export async function runVertexAgent(
  action: PlantAgentRequest['action'],
  payload: any
): Promise<PlantAgentResponse> {
  if (!model) {
    throw new Error('Vertex AI model not initialized. Check GCP_PROJECT_ID environment variable.');
  }

  try {
    const prompt = buildPrompt(action, payload);
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json',
      },
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Parse JSON response
    let parsed: any;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1] : text);
    } catch (parseError) {
      console.error('Failed to parse Vertex AI response:', parseError);
      console.log('Raw response:', text);
      throw new Error('Invalid JSON response from Vertex AI');
    }

    // Validate and format response
    return formatAgentResponse(parsed, action);
  } catch (error) {
    console.error('Vertex AI agent error:', error);
    throw error;
  }
}

/**
 * Build prompt based on action type
 */
function buildPrompt(action: string, payload: any): string {
  switch (action) {
    case 'generate_schedule':
      return `You are an autonomous plant care assistant. Generate optimal care schedule for a plant.

Plant Species: ${payload.species || 'Unknown'}
Current Watering Interval: ${payload.currentIntervals?.watering || 'Not set'} days
Current Fertilizing Interval: ${payload.currentIntervals?.fertilizing || 'Not set'} days

Based on the plant species, provide optimal care intervals. Consider:
- Plant type (succulent, tropical, desert, etc.)
- Typical care requirements
- Seasonal adjustments

Return JSON with this exact format:
{
  "watering_interval_days": number,
  "fertilizing_interval_days": number,
  "recommendations": "string with care advice"
}`;

    case 'update_status':
      return `You are an autonomous plant care assistant. Analyze plant care status and update happiness level.

Task Type: ${payload.taskType}
Completed: ${payload.completed}
Current Happiness: ${payload.currentHappiness || 50}
Care History: ${JSON.stringify(payload.careHistory || [])}

Calculate new happiness level:
- +1 point for completing watering task
- +3 points for completing fertilizing task
- -1 point for missing watering task
- -3 points for missing fertilizing task

Provide health status based on happiness:
- 75-100: "healthy"
- 50-75: "needs_attention"
- 25-50: "neglected"
- 0-25: "emergency"

Return JSON with this exact format:
{
  "happiness": number (0-100),
  "healthStatus": "healthy" | "needs_attention" | "neglected" | "emergency",
  "recommendations": "string with care advice"
}`;

    case 'analyze_photo':
      return `You are a professional botanist analyzing a plant photo for health assessment.

Image URL: ${payload.imageUrl}

Analyze the plant's visual health indicators:
- Leaf color and condition
- Overall plant appearance
- Signs of stress or disease
- Growth stage

Set an initial happiness baseline (0-100) based on visual health:
- Healthy, vibrant plant: 75-85
- Good condition with minor issues: 60-75
- Some visible problems: 40-60
- Poor health: 20-40
- Critical condition: 0-20

Return JSON with this exact format:
{
  "happiness": number (0-100),
  "healthStatus": "healthy" | "needs_attention" | "neglected" | "emergency",
  "recommendations": "string with care advice based on visual analysis"
}`;

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

/**
 * Format and validate agent response
 */
function formatAgentResponse(parsed: any, action: string): PlantAgentResponse {
  const response: PlantAgentResponse = {
    plantId: parsed.plantId || '',
    status: 'updated',
  };

  // Extract happiness if present
  if (typeof parsed.happiness === 'number') {
    response.happiness = Math.max(0, Math.min(100, parsed.happiness));
  }

  // Extract intervals
  if (typeof parsed.watering_interval_days === 'number') {
    response.watering_interval_days = Math.max(1, parsed.watering_interval_days);
  }
  if (typeof parsed.fertilizing_interval_days === 'number') {
    response.fertilizing_interval_days = Math.max(1, parsed.fertilizing_interval_days);
  }

  // Extract health status
  if (parsed.healthStatus) {
    const validStatuses: HappinessStatus[] = ['healthy', 'needs_attention', 'neglected', 'emergency'];
    if (validStatuses.includes(parsed.healthStatus)) {
      response.healthStatus = parsed.healthStatus;
    } else if (response.happiness !== undefined) {
      // Auto-determine status from happiness
      if (response.happiness >= 75) response.healthStatus = 'healthy';
      else if (response.happiness >= 50) response.healthStatus = 'needs_attention';
      else if (response.happiness >= 25) response.healthStatus = 'neglected';
      else response.healthStatus = 'emergency';
    }
  }

  // Extract recommendations
  if (parsed.recommendations) {
    response.recommendations = String(parsed.recommendations);
  }

  return response;
}

// Happiness helper functions are now in src/utils/happiness.ts
// They are imported and re-exported above for backward compatibility

