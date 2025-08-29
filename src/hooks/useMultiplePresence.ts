import { useState, useEffect } from 'react';
import { presenceService } from '../services/presenceService';

export function useMultiplePresence(userIds: string[]) {
  const [presenceStates, setPresenceStates] = useState<{[userId: string]: any}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const unsubscribe = presenceService.subscribeToMultipleUsersPresence(
      userIds, 
      (states) => {
        setPresenceStates(states);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [JSON.stringify(userIds)]); // Usar JSON.stringify para comparar arrays

  const isUserOnline = (userId: string) => {
    return presenceStates[userId]?.isOnline || false;
  };

  const getUserLastSeen = (userId: string) => {
    return presenceStates[userId]?.lastSeen || null;
  };

  const getUserPresence = (userId: string) => {
    return presenceStates[userId] || { isOnline: false, lastSeen: null, updatedAt: null };
  };

  return {
    presenceStates,
    loading,
    isUserOnline,
    getUserLastSeen,
    getUserPresence,
  };
}