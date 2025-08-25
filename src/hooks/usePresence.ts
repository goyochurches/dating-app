import { useMemo } from 'react';
import { Match } from '../types';

// Simple helper to compute online by lastSeen threshold (2 minutes)
export function usePresence(matches: Match[]) {
  const withPresence = useMemo(() => {
    const now = Date.now();
    return matches.map(m => {
      const last = m.lastSeen ? Date.parse(m.lastSeen) : 0;
      const isOnline = typeof m.online === 'boolean' ? m.online : (now - last) < 2 * 60 * 1000;
      return { ...m, online: isOnline } as Match;
    });
  }, [matches]);

  return { matches: withPresence };
}
