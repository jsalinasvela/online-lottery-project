'use client';

import { useState } from 'react';
import { Raffle } from '@/types/lottery';

interface WinnerBannerProps {
  raffle: Raffle;
}

export default function WinnerBanner({ raffle }: WinnerBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mb-8 relative overflow-hidden">
      {/* Animated background sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-2xl shadow-2xl border-4 border-yellow-300 dark:border-yellow-600 p-6 sm:p-8">
        {/* Close button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Trophy and celebration */}
          <div className="mb-4 flex items-center gap-2 text-5xl animate-bounce">
            <span>🎉</span>
            <span>🏆</span>
            <span>🎉</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 drop-shadow-lg">
            We Have a Winner!
          </h2>

          {/* Winner details */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-4 border-2 border-white/30 max-w-lg">
            <p className="text-lg sm:text-xl text-white font-semibold mb-2">
              Congratulations to
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-3 drop-shadow">
              {raffle.winnerName || 'Anonymous'}
            </p>
            <div className="flex items-center justify-center gap-4 text-white/90 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <span className="font-mono font-bold">Ticket #{raffle.winningTicketNumber}</span>
              </div>
            </div>
          </div>

          {/* Prize amount */}
          <div className="bg-white rounded-xl px-6 py-3 shadow-lg">
            <p className="text-sm text-slate-600 font-medium mb-1">Prize Amount</p>
            <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
              ${raffle.currentAmount.toLocaleString()}
            </p>
          </div>

          {/* Raffle name */}
          <p className="mt-4 text-white/80 text-sm sm:text-base">
            {raffle.title}
          </p>
        </div>
      </div>
    </div>
  );
}
