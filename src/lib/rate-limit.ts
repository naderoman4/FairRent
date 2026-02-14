import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from './constants';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();

  // Clean expired entries periodically
  if (Math.random() < 0.01) {
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }

  let entry = store.get(ip);

  if (!entry || entry.resetAt <= now) {
    // Reset — start of new day window
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    entry = { count: 0, resetAt };
    store.set(ip, entry);
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      message: 'Vous avez atteint la limite de 10 analyses par jour. Réessayez demain.',
    };
  }

  return { allowed: true };
}
