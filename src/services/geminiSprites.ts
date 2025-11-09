/**
 * Generates 4 animated sprite frames from a plant photo
 * Uses Gemini 2.5 Flash for background removal, pixelization, and compositing
 * Falls back to stub implementation if Gemini API is unavailable
 */

interface SpriteGenerationResult {
  frames: string[]; // 4 data URLs
  width: number;
  height: number;
}

// Default pot image as data URL (placeholder - replace with actual pot asset)
const DEFAULT_POT_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjOUI2QzQ1Ii8+CjxyZWN0IHg9IjgiIHk9IjQwIiB3aWR0aD0iNDgiIGhlaWdodD0iOCIgZmlsbD0iIzZBM0MzNCIvPgo8L3N2Zz4K';

/**
 * Stub implementation: Creates 4 frames using canvas manipulation
 * This provides a working fallback while Gemini integration is being developed
 */
async function generateSpritesStub(imageDataUrl: string): Promise<SpriteGenerationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Set canvas size (pixel art dimensions)
      const targetWidth = 64;
      const targetHeight = 96;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Disable image smoothing for pixel-perfect rendering
      ctx.imageSmoothingEnabled = false;

      // Load pot image
      const potImg = new Image();
      potImg.onload = () => {
        const frames: string[] = [];

        // Generate 4 frames with slight variations
        for (let i = 0; i < 4; i++) {
          const frameCanvas = document.createElement('canvas');
          frameCanvas.width = targetWidth;
          frameCanvas.height = targetHeight;
          const frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true });
          if (!frameCtx) continue;

          frameCtx.imageSmoothingEnabled = false;

          // Calculate plant position with slight offset for animation
          const offsetX = (i % 2) * 2 - 1; // -1 or 1
          const offsetY = Math.floor(i / 2) * 2 - 1; // -1 or 1

          // Draw pot at bottom
          frameCtx.drawImage(potImg, 0, targetHeight - 48, 64, 48);

          // Scale and draw plant (nearest neighbor for pixel art)
          const plantWidth = targetWidth;
          const plantHeight = targetHeight - 48; // Leave room for pot
          frameCtx.drawImage(
            img,
            offsetX,
            offsetY,
            plantWidth,
            plantHeight,
            0,
            0,
            plantWidth,
            plantHeight
          );

          // Add simple pixel eyes overlay (2 black pixels)
          frameCtx.fillStyle = '#000000';
          const eyeY = Math.floor(plantHeight * 0.3);
          frameCtx.fillRect(Math.floor(targetWidth * 0.35), eyeY, 2, 2);
          frameCtx.fillRect(Math.floor(targetWidth * 0.6), eyeY, 2, 2);

          frames.push(frameCanvas.toDataURL('image/png'));
        }

        resolve({
          frames,
          width: targetWidth,
          height: targetHeight,
        });
      };

      potImg.onerror = () => {
        // If pot image fails, create frames without pot
        const frames: string[] = [];
        for (let i = 0; i < 4; i++) {
          const frameCanvas = document.createElement('canvas');
          frameCanvas.width = targetWidth;
          frameCanvas.height = targetHeight;
          const frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true });
          if (!frameCtx) continue;

          frameCtx.imageSmoothingEnabled = false;
          const offsetX = (i % 2) * 2 - 1;
          const offsetY = Math.floor(i / 2) * 2 - 1;

          frameCtx.drawImage(
            img,
            offsetX,
            offsetY,
            targetWidth,
            targetHeight,
            0,
            0,
            targetWidth,
            targetHeight
          );

          // Add eyes
          frameCtx.fillStyle = '#000000';
          frameCtx.fillRect(Math.floor(targetWidth * 0.35), Math.floor(targetHeight * 0.3), 2, 2);
          frameCtx.fillRect(Math.floor(targetWidth * 0.6), Math.floor(targetHeight * 0.3), 2, 2);

          frames.push(frameCanvas.toDataURL('image/png'));
        }

        resolve({
          frames,
          width: targetWidth,
          height: targetHeight,
        });
      };

      potImg.src = DEFAULT_POT_DATA_URL;
    };

    img.onerror = () => {
      throw new Error('Failed to load plant image');
    };

    img.src = imageDataUrl;
  });
}

/**
 * Real implementation using Gemini 2.5 Flash API
 * TODO: Implement actual Gemini API integration
 */
async function generateSpritesGemini(imageDataUrl: string): Promise<SpriteGenerationResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('Gemini API key not found, using stub implementation');
    return generateSpritesStub(imageDataUrl);
  }

  // For now, fall back to stub
  // TODO: Implement Gemini 2.5 Flash API call for:
  // - Background removal
  // - 16-bit pixelization
  // - Composite with pot
  // - Generate 4 frames with pose variations
  // - Overlay pixel eyes

  return generateSpritesStub(imageDataUrl);
}

/**
 * Main function to generate plant sprites
 * @param imageDataUrl - Base64 data URL of the plant photo
 * @returns Promise with 4 sprite frames and dimensions
 */
export async function generatePlantSprites(
  imageDataUrl: string
): Promise<SpriteGenerationResult> {
  try {
    // Try Gemini first, fall back to stub
    return await generateSpritesGemini(imageDataUrl);
  } catch (error) {
    console.error('Sprite generation failed, using stub:', error);
    return generateSpritesStub(imageDataUrl);
  }
}

