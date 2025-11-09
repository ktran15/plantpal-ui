/**
 * Generate a unique session ID using crypto.randomUUID with fallback
 */
export function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Build the full mobile upload URL for a session
 * Uses window.location to automatically detect the correct hostname/IP
 */
export function buildMobileUrl(sessionId: string): string {
  // This will use whatever hostname/IP the user accessed the app with
  // e.g., if accessed via 192.168.1.100:3000, the QR will use that IP
  return `${window.location.origin}/mobile-upload/${sessionId}`;
}

/**
 * Get a human-readable network access hint
 */
export function getNetworkAccessHint(): string {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'Access via your network IP for mobile upload';
  }
  return `Network: ${hostname}`;
}

