'use client';

import { useState, useEffect } from 'react';
import { Raffle, Winner } from '@/types/lottery';
import { translations as t } from '@/lib/translations/es';
import { formatCurrency } from '@/lib/utils/currency';

interface EnrichedWinner extends Winner {
  userName: string;
}

interface WinnerBannerProps {
  raffle: Raffle;
}

const DISPLAY_WINDOW_HOURS = 48; // Show banner for 48 hours after execution
const DISMISSED_RAFFLES_KEY = 'dismissedWinnerBanners';

function isDismissed(raffleId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const dismissed = localStorage.getItem(DISMISSED_RAFFLES_KEY);
    if (!dismissed) return false;

    const dismissedIds: string[] = JSON.parse(dismissed);
    return dismissedIds.includes(raffleId);
  } catch {
    return false;
  }
}

function markAsDismissed(raffleId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const dismissed = localStorage.getItem(DISMISSED_RAFFLES_KEY);
    const dismissedIds: string[] = dismissed ? JSON.parse(dismissed) : [];

    if (!dismissedIds.includes(raffleId)) {
      dismissedIds.push(raffleId);
      localStorage.setItem(DISMISSED_RAFFLES_KEY, JSON.stringify(dismissedIds));
    }
  } catch (error) {
    console.error('Error saving dismissed state:', error);
  }
}

function isWithinDisplayWindow(executedAt: Date | undefined): boolean {
  if (!executedAt) return false;

  const now = new Date();
  const executed = new Date(executedAt);
  const hoursSinceExecution = (now.getTime() - executed.getTime()) / (1000 * 60 * 60);

  return hoursSinceExecution <= DISPLAY_WINDOW_HOURS;
}

export default function WinnerBanner({ raffle }: WinnerBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [winners, setWinners] = useState<EnrichedWinner[]>([]);
  const [loadingWinners, setLoadingWinners] = useState(false);

  const winnerCount = raffle.winnerCount ?? 1;
  const hasMultipleWinners = winnerCount > 1;

  useEffect(() => {
    // Check if banner should be shown
    const withinWindow = isWithinDisplayWindow(raffle.executedAt);
    const notDismissed = !isDismissed(raffle.id);

    setShouldShow(withinWindow && notDismissed);
  }, [raffle.id, raffle.executedAt]);

  // Fetch winners when there are multiple winners
  useEffect(() => {
    if (shouldShow && hasMultipleWinners) {
      setLoadingWinners(true);
      fetch(`/api/raffles/${raffle.id}/winners`)
        .then((res) => res.json())
        .then((data) => {
          setWinners(data.winners || []);
        })
        .catch((err) => {
          console.error('Error fetching winners:', err);
        })
        .finally(() => {
          setLoadingWinners(false);
        });
    }
  }, [shouldShow, hasMultipleWinners, raffle.id]);

  const handleDismiss = () => {
    markAsDismissed(raffle.id);
    setDismissed(true);
  };

  if (dismissed || !shouldShow) return null;

  // Calculate prize per winner
  const totalPrize = raffle.currentAmount * (raffle.prizePercentage ?? 0.70);
  const prizePerWinner = totalPrize / winnerCount;

  // Single winner display (backwards compatible)
  if (!hasMultipleWinners) {
    return (
      <div className="mb-4 relative">
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-950/30 dark:via-orange-950/30 dark:to-amber-950/30 border-l-4 border-yellow-500 dark:border-yellow-600 rounded-lg shadow-sm p-3 sm:p-4">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors text-slate-600 dark:text-slate-400 cursor-pointer"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="flex items-center gap-3 pr-6">
            {/* Trophy icon */}
            <div className="flex-shrink-0 text-2xl">
              🏆
            </div>

            {/* Winner info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
                {t.winner.recentWinner} <span className="text-yellow-700 dark:text-yellow-400">{raffle.winnerName || 'Anonymous'}</span>
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t.winner.won} <span className="font-bold text-yellow-700 dark:text-yellow-500">{formatCurrency(totalPrize)}</span> {t.winner.with} #{raffle.winningTicketNumber} • {raffle.title}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multiple winners display
  return (
    <div className="mb-4 relative">
      <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-950/30 dark:via-orange-950/30 dark:to-amber-950/30 border-l-4 border-yellow-500 dark:border-yellow-600 rounded-lg shadow-sm p-3 sm:p-4">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors text-slate-600 dark:text-slate-400 cursor-pointer"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="pr-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏆</span>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t.winner.recentWinners || 'Ganadores Recientes'}
            </p>
          </div>

          {/* Winners list */}
          {loadingWinners ? (
            <p className="text-xs text-slate-500">Cargando ganadores...</p>
          ) : (
            <div className="space-y-1">
              {winners.map((winner, index) => (
                <p key={winner.id} className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                    {winner.userName}
                  </span>
                  {' '}{t.winner.won}{' '}
                  <span className="font-bold text-yellow-700 dark:text-yellow-500">
                    {formatCurrency(winner.prizeAmount)}
                  </span>
                  {' '}{t.winner.with} #{winners[index]?.ticketId ? '...' : ''}
                </p>
              ))}
            </div>
          )}

          {/* Raffle title */}
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            {raffle.title} • {formatCurrency(prizePerWinner)} {t.winner.perWinner || 'por ganador'}
          </p>
        </div>
      </div>
    </div>
  );
}
