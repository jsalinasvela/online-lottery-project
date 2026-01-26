'use client';

import { useState, useEffect, useCallback } from 'react';
import { Ticket } from '@/types/lottery';
import { fetchUserTickets } from '@/lib/api/tickets';

export function useUserTickets(raffleId: string | null, userId: string | null) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!raffleId || !userId) {
      setLoading(false);
      return;
    }

    try {
      const data = await fetchUserTickets(raffleId, userId);
      setTickets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
      console.error('Error in useUserTickets:', err);
    } finally {
      setLoading(false);
    }
  }, [raffleId, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tickets, loading, error, refresh };
}
