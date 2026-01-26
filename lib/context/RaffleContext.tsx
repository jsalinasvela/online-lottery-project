'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Raffle, Ticket } from '@/types/lottery';
import { useActiveRaffle } from '@/lib/hooks/useRaffle';
import { useUserTickets } from '@/lib/hooks/useTickets';
import { useRecentActivity, ActivityEntry } from '@/lib/hooks/useRecentActivity';
import { purchaseTickets as apiPurchaseTickets } from '@/lib/api/tickets';

interface RaffleContextType {
  // State
  activeRaffle: Raffle | null;
  userTickets: Ticket[];
  recentActivity: ActivityEntry[];
  loading: boolean;
  error: string | null;
  userId: string | null;

  // Actions
  refreshRaffle: () => Promise<void>;
  refreshTickets: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  purchaseTickets: (quantity: number) => Promise<void>;
  purchasing: boolean;
  purchaseError: string | null;
}

const RaffleContext = createContext<RaffleContextType | undefined>(undefined);

export function RaffleProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Initialize user ID from localStorage
  useEffect(() => {
    // Generate or retrieve user ID
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Use hooks
  const { raffle: activeRaffle, loading: raffleLoading, error: raffleError, refresh: refreshRaffle } = useActiveRaffle();
  const { tickets: userTickets, loading: ticketsLoading, error: ticketsError, refresh: refreshTickets } = useUserTickets(
    activeRaffle?.id || null,
    userId
  );
  const { activities: recentActivity, loading: activityLoading, error: activityError, refresh: refreshActivity } = useRecentActivity(
    activeRaffle?.id || null
  );

  // Purchase tickets handler
  const purchaseTickets = useCallback(
    async (quantity: number) => {
      if (!activeRaffle || !userId) {
        setPurchaseError('Unable to purchase tickets. Please try again.');
        return;
      }

      setPurchasing(true);
      setPurchaseError(null);

      try {
        await apiPurchaseTickets(activeRaffle.id, userId, quantity);

        // Refresh data after purchase
        await Promise.all([
          refreshRaffle(),
          refreshTickets(),
          refreshActivity(),
        ]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to purchase tickets';
        setPurchaseError(errorMessage);
        throw err;
      } finally {
        setPurchasing(false);
      }
    },
    [activeRaffle, userId, refreshRaffle, refreshTickets, refreshActivity]
  );

  const loading = raffleLoading || ticketsLoading || activityLoading;
  const error = raffleError || ticketsError || activityError;

  const value: RaffleContextType = {
    activeRaffle,
    userTickets,
    recentActivity,
    loading,
    error,
    userId,
    refreshRaffle,
    refreshTickets,
    refreshActivity,
    purchaseTickets,
    purchasing,
    purchaseError,
  };

  return <RaffleContext.Provider value={value}>{children}</RaffleContext.Provider>;
}

export function useRaffleContext() {
  const context = useContext(RaffleContext);
  if (context === undefined) {
    throw new Error('useRaffleContext must be used within a RaffleProvider');
  }
  return context;
}
