'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Raffle, Ticket, PurchaseTransaction } from '@/types/lottery';
import { useActiveRaffle } from '@/lib/hooks/useRaffle';
import { useUserTickets } from '@/lib/hooks/useTickets';
import { useRecentActivity, ActivityEntry } from '@/lib/hooks/useRecentActivity';
import { purchaseTickets as apiPurchaseTickets } from '@/lib/api/tickets';
import { useToast } from '@/lib/context/ToastContext';
import UserIdentificationModal from '@/components/user/UserIdentificationModal';
import YapePaymentModal from '@/components/payment/YapePaymentModal';
import { translations as t } from '@/lib/translations/es';

interface UserInfo {
  id: string;
  email: string;
  name: string;
}

interface RaffleContextType {
  // State
  activeRaffle: Raffle | null;
  userTickets: Ticket[];
  recentActivity: ActivityEntry[];
  loading: boolean;
  error: string | null;
  userId: string | null;
  userInfo: UserInfo | null;

  // Actions
  refreshRaffle: () => Promise<void>;
  refreshTickets: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  purchaseTickets: (quantity: number) => Promise<void>;
  purchasing: boolean;
  purchaseError: string | null;
}

const RaffleContext = createContext<RaffleContextType | undefined>(undefined);

// Helper to get affiliate code from localStorage
function getAffiliateCode(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('affiliate_code') || undefined;
}

export function RaffleProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showIdentificationModal, setShowIdentificationModal] = useState(false);
  const [pendingPurchaseQuantity, setPendingPurchaseQuantity] = useState<number | null>(null);
  const [pendingTransaction, setPendingTransaction] = useState<PurchaseTransaction | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('lottery_user');
    if (storedUser) {
      try {
        const user: UserInfo = JSON.parse(storedUser);
        setUserId(user.id);
        setUserInfo(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('lottery_user');
      }
    }
  }, []);

  // Handle user identification
  const handleUserIdentified = useCallback((id: string, email: string, name: string) => {
    const user: UserInfo = { id, email, name };
    setUserId(id);
    setUserInfo(user);
    setShowIdentificationModal(false);
    showToast(`${t.toast.welcome} ${name}!`, 'success');
  }, [showToast]);

  // Use hooks
  const { raffle: activeRaffle, loading: raffleLoading, error: raffleError, refresh: refreshRaffle } = useActiveRaffle();
  const { tickets: userTickets, loading: ticketsLoading, error: ticketsError, refresh: refreshTickets } = useUserTickets(
    activeRaffle?.id || null,
    userId
  );
  const { activities: recentActivity, loading: activityLoading, error: activityError, refresh: refreshActivity } = useRecentActivity(
    activeRaffle?.id || null
  );

  // Auto-retry purchase after user identification
  useEffect(() => {
    if (userId && userInfo && pendingPurchaseQuantity && activeRaffle) {
      // User just identified themselves, retry the purchase
      const quantity = pendingPurchaseQuantity;
      setPendingPurchaseQuantity(null); // Clear pending

      const executePurchase = async () => {
        setPurchasing(true);
        setPurchaseError(null);

        try {
          const affiliateCode = getAffiliateCode();
          const transaction = await apiPurchaseTickets(activeRaffle.id, userId, quantity, affiliateCode);

          if (!transaction) {
            throw new Error('No transaction returned');
          }

          // Show payment modal instead of success toast
          setPendingTransaction(transaction);

          // Refresh raffle to show optimistic update in glass visualization
          await refreshRaffle();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to purchase tickets';
          setPurchaseError(errorMessage);
          showToast(errorMessage, 'error');
        } finally {
          setPurchasing(false);
        }
      };

      executePurchase();
    }
  }, [userId, userInfo, pendingPurchaseQuantity, activeRaffle, refreshRaffle, refreshTickets, refreshActivity, showToast]);

  // Purchase tickets handler
  const purchaseTickets = useCallback(
    async (quantity: number) => {
      if (!activeRaffle) {
        setPurchaseError('Unable to purchase tickets. Please try again.');
        return;
      }

      // Check if user is identified
      if (!userId || !userInfo) {
        setPendingPurchaseQuantity(quantity); // Save quantity for retry after identification
        setShowIdentificationModal(true);
        return;
      }

      setPurchasing(true);
      setPurchaseError(null);

      try {
        const affiliateCode = getAffiliateCode();
        const transaction = await apiPurchaseTickets(activeRaffle.id, userId, quantity, affiliateCode);

        if (!transaction) {
          throw new Error('No transaction returned');
        }

        // Show payment modal instead of success toast
        setPendingTransaction(transaction);

        // Refresh raffle to show optimistic update in glass visualization
        await refreshRaffle();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to purchase tickets';
        setPurchaseError(errorMessage);
        showToast(errorMessage, 'error');
        throw err;
      } finally {
        setPurchasing(false);
      }
    },
    [activeRaffle, userId, userInfo, refreshRaffle, refreshTickets, refreshActivity, showToast]
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
    userInfo,
    refreshRaffle,
    refreshTickets,
    refreshActivity,
    purchaseTickets,
    purchasing,
    purchaseError,
  };

  return (
    <RaffleContext.Provider value={value}>
      {children}
      {showIdentificationModal && (
        <UserIdentificationModal
          onIdentified={handleUserIdentified}
          onClose={() => setShowIdentificationModal(false)}
        />
      )}
      {pendingTransaction && (
        <YapePaymentModal
          transaction={pendingTransaction}
          onClose={() => {
            setPendingTransaction(null);
            showToast(t.toast.paymentPending, 'info');
          }}
        />
      )}
    </RaffleContext.Provider>
  );
}

export function useRaffleContext() {
  const context = useContext(RaffleContext);
  if (context === undefined) {
    throw new Error('useRaffleContext must be used within a RaffleProvider');
  }
  return context;
}
