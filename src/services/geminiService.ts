export interface PlantIdentificationResult {
  commonName: string;
  scientificName: string;
  careInstructions: {
    light: string;
    water: string;
    soil: string;
    temperature: string;
  };
  funFacts: string[];
}

export type PlantDiagnosis = {
  summary: string;
  issues: string[];
  suggestions: string[];
  confidence: number;
};

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Identifies a plant from an image using Gemini API
 * @param imageBase64 - Base64 encoded image string (with or without data URL prefix)
 * @returns Plant identification result with structured data
 */
export async function identifyPlant(
  imageBase64: string
): Promise<PlantIdentificationResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  // Remove data URL prefix if present (data:image/jpeg;base64,)
  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  // Determine MIME type from base64 string
  const mimeType = imageBase64.startsWith("data:image/png")
    ? "image/png"
    : imageBase64.startsWith("data:image/jpeg") || imageBase64.startsWith("data:image/jpg")
    ? "image/jpeg"
    : "image/jpeg"; // default

  const prompt = `Identify this plant from the uploaded image. Provide:

1. Common name
2. Scientific name
3. Detailed care instructions (light, water, soil, temperature)
4. 2–3 fun facts about this plant.

Please format your response as follows:
Common Name: [name]
Scientific Name: [name]
Care Instructions:
- Light: [details]
- Water: [details]
- Soil: [details]
- Temperature: [details]
Fun Facts:
- [fact 1]
- [fact 2]
- [fact 3]`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      );
    }

    const data: GeminiResponse = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0]
    ) {
      throw new Error("Invalid response format from Gemini API");
    }

    const responseText = data.candidates[0].content.parts[0].text;

    // Parse the response text into structured format
    return parseGeminiResponse(responseText);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to identify plant: " + String(error));
  }
}

/**
 * Parses the Gemini API response text into structured format
 */
function parseGeminiResponse(text: string): PlantIdentificationResult {
  const result: PlantIdentificationResult = {
    commonName: "",
    scientificName: "",
    careInstructions: {
      light: "",
      water: "",
      soil: "",
      temperature: "",
    },
    funFacts: [],
  };

  // Extract Common Name
  const commonNameMatch = text.match(/Common Name:\s*(.+?)(?:\n|Scientific Name:|$)/i);
  if (commonNameMatch) {
    result.commonName = commonNameMatch[1].trim();
  }

  // Extract Scientific Name
  const scientificNameMatch = text.match(/Scientific Name:\s*(.+?)(?:\n|Care Instructions:|$)/i);
  if (scientificNameMatch) {
    result.scientificName = scientificNameMatch[1].trim();
  }

  // Extract Care Instructions
  const lightMatch = text.match(/Light:\s*(.+?)(?:\n\s*[-•]\s*Water:|$)/i);
  if (lightMatch) {
    result.careInstructions.light = lightMatch[1].trim();
  }

  const waterMatch = text.match(/Water:\s*(.+?)(?:\n\s*[-•]\s*Soil:|$)/i);
  if (waterMatch) {
    result.careInstructions.water = waterMatch[1].trim();
  }

  const soilMatch = text.match(/Soil:\s*(.+?)(?:\n\s*[-•]\s*Temperature:|$)/i);
  if (soilMatch) {
    result.careInstructions.soil = soilMatch[1].trim();
  }

  const temperatureMatch = text.match(/Temperature:\s*(.+?)(?:\n\s*Fun Facts:|$)/i);
  if (temperatureMatch) {
    result.careInstructions.temperature = temperatureMatch[1].trim();
  }

  // Extract Fun Facts
  const funFactsSection = text.match(/Fun Facts:\s*([\s\S]+?)(?:\n\n|$)/i);
  if (funFactsSection) {
    const factsText = funFactsSection[1];
    // Match lines starting with - or • or numbers
    const facts = factsText
      .split(/\n/)
      .map((line) => line.replace(/^[-•]\s*|\d+\.\s*/, "").trim())
      .filter((line) => line.length > 0);
    result.funFacts = facts.slice(0, 3); // Take up to 3 facts
  }

  // Fallback: If parsing fails, try to extract basic info from the text
  if (!result.commonName && !result.scientificName) {
    // Try to find plant names in the text
    const lines = text.split("\n").filter((line) => line.trim().length > 0);
    if (lines.length > 0) {
      result.commonName = lines[0].replace(/^Common Name:\s*/i, "").trim() || "Unknown Plant";
    }
    if (lines.length > 1) {
      result.scientificName = lines[1].replace(/^Scientific Name:\s*/i, "").trim() || "";
    }
  }

  // Ensure we have at least some data
  if (!result.commonName) {
    result.commonName = "Plant";
  }
  if (!result.scientificName) {
    result.scientificName = "Unknown";
  }
  if (result.funFacts.length === 0) {
    result.funFacts = ["No additional facts available."];
  }

  return result;
}

/**
 * Diagnoses a plant from an image using Gemini 2.5 Pro API
 * @param imageBase64 - Base64 encoded image string (with or without data URL prefix)
 * @returns Plant diagnosis result with health status, issues, and suggestions
 */
export async function diagnosePlant(
  imageBase64: string
): Promise<PlantDiagnosis> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  // Remove data URL prefix if present (data:image/jpeg;base64,)
  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  // Determine MIME type from base64 string
  const mimeType = imageBase64.startsWith("data:image/png")
    ? "image/png"
    : imageBase64.startsWith("data:image/jpeg") || imageBase64.startsWith("data:image/jpg")
    ? "image/jpeg"
    : "image/jpeg"; // default

  const prompt = `You are a professional botanist diagnosing a houseplant from a photo.

Evaluate it based on:

- Leaf color and texture
- Stem condition
- Soil moisture or discoloration
- Common plant diseases (mold, rot, pests, nutrient deficiency)
- Environmental stress (light, temperature, watering)

If the plant looks healthy, say so clearly.
If unhealthy, describe the problem and suggest concrete care tasks.

Return your analysis in JSON with this format:
{
  "summary": "...",
  "issues": ["..."],
  "suggestions": ["..."],
  "confidence": 0.0
}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: "application/json",
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      );
    }

    const data: GeminiResponse = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0]
    ) {
      throw new Error("Invalid response format from Gemini API");
    }

    const responseText = data.candidates[0].content.parts[0].text;

    // Parse the JSON response
    return parseDiagnosisResponse(responseText);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to diagnose plant: " + String(error));
  }
}

/**
 * Parses the Gemini API JSON response into PlantDiagnosis type
 */
function parseDiagnosisResponse(text: string): PlantDiagnosis {
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;
    
    const parsed = JSON.parse(jsonText) as PlantDiagnosis;

    // Validate and ensure all required fields exist
    const diagnosis: PlantDiagnosis = {
      summary: parsed.summary || "Unable to determine plant health status.",
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
    };

    // Ensure confidence is between 0 and 1
    diagnosis.confidence = Math.max(0, Math.min(1, diagnosis.confidence));

    // Ensure we have at least one suggestion
    if (diagnosis.suggestions.length === 0) {
      diagnosis.suggestions = ["Monitor the plant's condition regularly."];
    }

    return diagnosis;
  } catch (error) {
    // Fallback if JSON parsing fails
    console.error("Failed to parse diagnosis JSON:", error);
    return {
      summary: "Unable to parse diagnosis response. Please try again.",
      issues: [],
      suggestions: ["Please try uploading another image for diagnosis."],
      confidence: 0.0,
    };
  }
}

