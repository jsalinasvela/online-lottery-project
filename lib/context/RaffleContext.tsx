'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Raffle, Ticket } from '@/types/lottery';
import { useActiveRaffle } from '@/lib/hooks/useRaffle';
import { useUserTickets } from '@/lib/hooks/useTickets';
import { useRecentActivity, ActivityEntry } from '@/lib/hooks/useRecentActivity';
import { purchaseTickets as apiPurchaseTickets } from '@/lib/api/tickets';
import { useToast } from '@/lib/context/ToastContext';

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
  const { showToast } = useToast();

  // Initialize user ID from localStorage
  useEffect(() => {
    // TEMPORARY: Use mock user until Phase 2 authentication is implemented
    // This uses one of the seeded users from the database
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      // Use a random mock user from the seed data (real IDs from database)
      const mockUserIds = [
        'cmkvis0800000gn8x895nshkw', // John D.
        'cmkvis10r0003gn8x9cke4szx', // Sarah M.
        'cmkvis10r0005gn8xbi4nf8ht', // Mike R.
        'cmkvis10b0001gn8xih99okt3', // Emily L.
        'cmkvis10r0004gn8xnzhn2k18', // Alex K.
        'cmkvis10r0002gn8xwcrt077i', // Lisa P.
      ];
      storedUserId = mockUserIds[Math.floor(Math.random() * mockUserIds.length)];
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

        // Show success toast
        const ticketWord = quantity === 1 ? 'ticket' : 'tickets';
        const totalAmount = activeRaffle.ticketPrice * quantity;
        showToast(`🎉 Successfully purchased ${quantity} ${ticketWord} for $${totalAmount}!`, 'success');

        // Refresh data after purchase
        await Promise.all([
          refreshRaffle(),
          refreshTickets(),
          refreshActivity(),
        ]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to purchase tickets';
        setPurchaseError(errorMessage);
        showToast(errorMessage, 'error');
        throw err;
      } finally {
        setPurchasing(false);
      }
    },
    [activeRaffle, userId, refreshRaffle, refreshTickets, refreshActivity, showToast]
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
