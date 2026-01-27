'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchRecentActivity } from '@/lib/api/activity';
import { ActivityEntry } from '@/lib/data/store';

// Re-export ActivityEntry for convenience
export type { ActivityEntry };

const POLLING_INTERVAL = 5000; // 5 seconds for more real-time feel

export function useRecentActivity(raffleId: string | null) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!raffleId) {
      setLoading(false);
      return;
    }

    try {
      const data = await fetchRecentActivity(raffleId, 20);
      setActivities(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
      console.error('Error in useRecentActivity:', err);
    } finally {
      setLoading(false);
    }
  }, [raffleId]);

  useEffect(() => {
    // Initial fetch
    refresh();

    // Set up polling
    const intervalId = setInterval(refresh, POLLING_INTERVAL);

    // Pause polling when tab is not visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalId);
      } else {
        refresh();
        // Resume polling
        const newIntervalId = setInterval(refresh, POLLING_INTERVAL);
        return () => clearInterval(newIntervalId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refresh]);

  return { activities, loading, error, refresh };
}
