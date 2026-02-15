'use client';

import { useCallback } from 'react';
import { getStoredUTMParams } from '@/lib/utm';

interface TrackEventOptions {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export function useTrackEvent() {
  return useCallback(({ category, action, label, value }: TrackEventOptions) => {
    // Vercel Analytics (if available)
    if (typeof window !== 'undefined' && 'va' in window) {
      const utm = getStoredUTMParams();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).va?.track(action, {
        category,
        label,
        value,
        ...utm,
      });
    }
  }, []);
}
