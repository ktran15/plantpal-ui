/**
 * Generates a single sprite image from a plant species name
 * Uses Gemini 2.5 Flash for image generation (eyes included by Gemini)
 */

export type PlantSprite = {
  dataUrl: string; // single PNG data URL with #DBBD94 background
  width: number;   // 400
  height: number;  // 400
};

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
}

const OUTPUT_SIZE = 400;

/**
 * Hash function to create deterministic seed from species name
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Remove checkerboard transparency artifacts from generated image
 * Uses edge-connected flood-fill to only remove background checkerboard
 * Preserves interior pixels like eyes and highlights
 */
function removeCheckerboardToAlpha(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context not available');

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = new Uint8ClampedArray(imageData.data);
  const width = canvas.width;
  const height = canvas.height;

  // Checkerboard colors to detect
  const checkerboardColors = [
    { r: 255, g: 255, b: 255 }, // white
    { r: 240, g: 240, b: 240 }, // light gray
    { r: 204, g: 204, b: 204 }, // medium gray
    { r: 192, g: 192, b: 192 }, // darker gray
    { r: 191, g: 191, b: 191 }, // another gray
  ];

  const colorThreshold = 18; // RGB distance tolerance
  const alphaThreshold = 0.99; // Only consider highly opaque pixels

  // Helper: Check if pixel matches checkerboard
  function isCheckerboardPixel(idx: number): boolean {
    const a = data[idx + 3] / 255;
    if (a < alphaThreshold) return false;

    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    for (const color of checkerboardColors) {
      const dist = Math.abs(r - color.r) + Math.abs(g - color.g) + Math.abs(b - color.b);
      if (dist <= colorThreshold) {
        return true;
      }
    }
    return false;
  }

  // Build background mask using flood-fill from edges
  const backgroundMask = new Uint8Array(width * height); // 0 = interior, 1 = background
  const queue: Array<[number, number]> = [];

  // Add all edge pixels to queue
  for (let x = 0; x < width; x++) {
    queue.push([x, 0]); // top edge
    queue.push([x, height - 1]); // bottom edge
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push([0, y]); // left edge
    queue.push([width - 1, y]); // right edge
  }

  // Flood-fill from edges
  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    const pixelIdx = (y * width + x) * 4;
    const maskIdx = y * width + x;

    if (backgroundMask[maskIdx] === 1) continue; // Already visited

    // Check if this pixel is a checkerboard candidate
    if (!isCheckerboardPixel(pixelIdx)) continue;

    backgroundMask[maskIdx] = 1; // Mark as background

    // Add neighbors to queue
    queue.push([x + 1, y]);
    queue.push([x - 1, y]);
    queue.push([x, y + 1]);
    queue.push([x, y - 1]);
  }

  // Apply mask: set alpha=0 for background pixels only
  for (let i = 0; i < backgroundMask.length; i++) {
    if (backgroundMask[i] === 1) {
      data[i * 4 + 3] = 0; // Set alpha to transparent
    }
  }

  ctx.putImageData(new ImageData(data, width, height), 0, 0);
  return canvas;
}

/**
 * Replace background with exact #DBBD94 color
 * Uses edge-connected flood-fill to detect and replace background pixels
 */
function replaceBackgroundColor(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context not available');

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = new Uint8ClampedArray(imageData.data);
  const width = canvas.width;
  const height = canvas.height;

  // Target background color #DBBD94 (RGB: 219, 189, 148)
  const targetColor = { r: 219, g: 189, b: 148 };
  const colorThreshold = 30; // RGB distance tolerance for detecting similar colors

  // Helper: Check if pixel is close to target background color
  function isBackgroundColor(idx: number): boolean {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const dist = Math.abs(r - targetColor.r) + Math.abs(g - targetColor.g) + Math.abs(b - targetColor.b);
    return dist <= colorThreshold;
  }

  // Build background mask using flood-fill from edges
  const backgroundMask = new Uint8Array(width * height); // 0 = interior, 1 = background
  const queue: Array<[number, number]> = [];

  // Add all edge pixels to queue
  for (let x = 0; x < width; x++) {
    queue.push([x, 0]); // top edge
    queue.push([x, height - 1]); // bottom edge
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push([0, y]); // left edge
    queue.push([width - 1, y]); // right edge
  }

  // Flood-fill from edges
  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    const pixelIdx = (y * width + x) * 4;
    const maskIdx = y * width + x;

    if (backgroundMask[maskIdx] === 1) continue; // Already visited

    // Check if this pixel is close to background color
    if (!isBackgroundColor(pixelIdx)) continue;

    backgroundMask[maskIdx] = 1; // Mark as background

    // Add neighbors to queue
    queue.push([x + 1, y]);
    queue.push([x - 1, y]);
    queue.push([x, y + 1]);
    queue.push([x, y - 1]);
  }

  // Replace background pixels with exact #DBBD94
  for (let i = 0; i < backgroundMask.length; i++) {
    if (backgroundMask[i] === 1) {
      data[i * 4] = targetColor.r;
      data[i * 4 + 1] = targetColor.g;
      data[i * 4 + 2] = targetColor.b;
      // Keep original alpha
    }
  }

  ctx.putImageData(new ImageData(data, width, height), 0, 0);
  return canvas;
}

/**
 * Generate fallback fern-like sprite (single image)
 */
async function generateFallbackSprite(species: string): Promise<PlantSprite> {
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context not available');

  ctx.imageSmoothingEnabled = false;

  // Draw simple fern-like plant with integrated pot (single image)
  const plantHeight = OUTPUT_SIZE * 0.7;
  const plantWidth = OUTPUT_SIZE * 0.5;
  const plantX = (OUTPUT_SIZE - plantWidth) / 2;
  const plantY = OUTPUT_SIZE * 0.05;

  // Draw pot (integrated into sprite)
  ctx.fillStyle = '#6A3C33'; // Terracotta brown
  const potHeight = OUTPUT_SIZE * 0.25;
  const potWidth = OUTPUT_SIZE * 0.4;
  const potX = (OUTPUT_SIZE - potWidth) / 2;
  const potY = OUTPUT_SIZE - potHeight;
  ctx.fillRect(potX, potY, potWidth, potHeight);

  // Simple fern shape (green pixels)
  ctx.fillStyle = '#4a7c59'; // Botanical green
  const stemWidth = 8;
  ctx.fillRect(
    plantX + plantWidth / 2 - stemWidth / 2,
    plantY + plantHeight * 0.2,
    stemWidth,
    plantHeight * 0.5
  );

  // Fronds
  for (let j = 0; j < 5; j++) {
    const frondX = plantX + (plantWidth / 6) * (j + 1);
    const frondY = plantY + plantHeight * 0.15;
    ctx.fillRect(frondX, frondY, 4, plantHeight * 0.5);
  }

  // Draw simple pixel eyes (20% bigger and 20% farther apart)
  ctx.fillStyle = '#000000';
  const eyeSize = 7; // 20% bigger than original 6px
  const eyeY = (plantY + (OUTPUT_SIZE - potHeight)) / 2;
  ctx.fillRect((OUTPUT_SIZE / 2) - 18, eyeY, eyeSize, eyeSize);
  ctx.fillRect((OUTPUT_SIZE / 2) + 11, eyeY, eyeSize, eyeSize);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: OUTPUT_SIZE,
    height: OUTPUT_SIZE,
  };
}


/**
 * Generate sprite using Gemini 2.5 Flash Image API
 */
async function generateSpritesGemini(species: string): Promise<PlantSprite> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `Generate a single 16-bit pixel-art image of a ${species} plant on a 400 × 400 pixel canvas. Use a solid background color with hex #DBBD94. Use a simple terracotta-style pot drawn as part of the sprite. The plant should be large and centered, filling ~90% of the frame. Include prominent pixel eyes on the plant (not on the pot) around the midpoint between pot-top and foliage-top - make the eyes notably large and well-spaced apart from each other. Crisp, blocky pixels, no anti-aliasing. Keep the plant's eyes clear and distinct.`;

  // Use seed based on species hash for consistency
  const seed = hashString(species) % 1000000;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

    // DEBUG: Log the full response to see what we're getting
    console.log('=== GEMINI API RESPONSE ===');
    console.log('Full response:', JSON.stringify(data, null, 2));
    if (data.candidates?.[0]?.content?.parts) {
      console.log('Parts in response:', data.candidates[0].content.parts);
      data.candidates[0].content.parts.forEach((part, idx) => {
        console.log(`Part ${idx}:`, {
          hasText: !!part.text,
          hasInlineData: !!part.inlineData,
          mimeType: part.inlineData?.mimeType,
          textPreview: part.text?.substring(0, 100),
        });
      });
    }
    console.log('=========================');

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts
    ) {
      throw new Error('Invalid response format from Gemini API');
    }

    // Check if response contains image data
    const imagePart = data.candidates[0].content.parts.find(
      (part) => part.inlineData && part.inlineData.mimeType.startsWith('image/')
    );

    if (imagePart && imagePart.inlineData) {
      // Load the generated image
      const imageData = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      const plantImg = new Image();
      plantImg.src = imageData;

      await new Promise((resolve, reject) => {
        plantImg.onload = resolve;
        plantImg.onerror = reject;
      });

      // Replace background with exact #DBBD94 color
      const correctedCanvas = replaceBackgroundColor(plantImg);
      const correctedDataUrl = correctedCanvas.toDataURL('image/png');

      return {
        dataUrl: correctedDataUrl,
        width: OUTPUT_SIZE,
        height: OUTPUT_SIZE,
      };
    } else {
      // If no image returned, try to parse text response or use fallback
      throw new Error('Gemini did not return an image');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('API key')) {
      throw error;
    }
    // Re-throw to trigger fallback
    throw new Error(`Gemini API call failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Main function to generate plant sprite from species name
 */
export async function generateSpeciesSprite(species: string): Promise<PlantSprite> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // If no API key, use fallback immediately
  if (!apiKey) {
    console.warn('Gemini API key not found, using fallback sprite');
    return generateFallbackSprite(species);
  }

  try {
    // Try Gemini API first
    return await generateSpritesGemini(species);
  } catch (error) {
    console.error('Sprite generation failed, using fallback:', error);
    // Use fallback on any error
    return generateFallbackSprite(species);
  }
}

