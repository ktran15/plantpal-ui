import { HappinessStatus } from '../types/plant';

/**
 * Get happiness status from happiness level
 * Shared utility - works in both frontend and backend
 */
export function getHappinessStatus(happiness: number): HappinessStatus {
  if (happiness >= 75) return 'healthy';
  if (happiness >= 50) return 'needs_attention';
  if (happiness >= 25) return 'neglected';
  return 'emergency';
}

/**
 * Get happiness status color
 */
export function getHappinessColor(happiness: number): string {
  if (happiness >= 75) return '#5FA244'; // Green (sprout)
  if (happiness >= 50) return '#E4B88B'; // Yellow (sand)
  if (happiness >= 25) return '#B76746'; // Red (clay)
  return '#6A3C33'; // Dark Purple (soil/emergency)
}

/**
 * Get happiness status text
 */
export function getHappinessStatusText(happiness: number): string {
  const status = getHappinessStatus(happiness);
  switch (status) {
    case 'healthy':
      return 'HEALTHY';
    case 'needs_attention':
      return 'NEEDS ATTENTION';
    case 'neglected':
      return 'NEGLECTED';
    case 'emergency':
      return 'EMERGENCY';
  }
}

