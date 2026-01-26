'use client';

import { useState, useEffect, useCallback } from 'react';
import { Raffle } from '@/types/lottery';
import { fetchActiveRaffle } from '@/lib/api/raffles';

const POLLING_INTERVAL = 10000; // 10 seconds

export function useActiveRaffle() {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchActiveRaffle();
      setRaffle(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch raffle');
      console.error('Error in useActiveRaffle:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return { raffle, loading, error, refresh };
}
