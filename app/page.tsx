'use client';

import { useState } from 'react';
import GlassVisualization from '@/components/raffle/GlassVisualization';
import WinnerBanner from '@/components/raffle/WinnerBanner';
import { useRaffleContext } from '@/lib/context/RaffleContext';
import { useRecentCompletedRaffle } from '@/lib/hooks/useRaffle';
import { translations as t } from '@/lib/translations/es';
import { formatCurrency } from '@/lib/utils/currency';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getTimeLeft(endDate: Date | undefined): string {
  if (!endDate) return t.home.stats.untilGoal;

  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return t.home.stats.ended;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours}${t.time.hours}`;

  const days = Math.floor(hours / 24);
  return `${days}${t.time.days}`;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 1) return t.home.recentActivity.justNow;
  if (minutes < 60) {
    return minutes === 1
      ? `1 ${t.home.recentActivity.minuteAgo}`
      : `${minutes} ${t.home.recentActivity.minutesAgo}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1
      ? `1 ${t.home.recentActivity.hourAgo}`
      : `${hours} ${t.home.recentActivity.hoursAgo}`;
  }

  const days = Math.floor(hours / 24);
  return days === 1
    ? `1 ${t.home.recentActivity.dayAgo}`
    : `${days} ${t.home.recentActivity.daysAgo}`;
}

function getUniquePlayerCount(activities: any[]): number {
  const uniqueUserIds = new Set(activities.map(a => a.userId));
  return uniqueUserIds.size;
}

export default function Home() {
  const {
    activeRaffle,
    userTickets,
    recentActivity,
    loading,
    error,
    purchasing,
    purchaseError,
    purchaseTickets,
  } = useRaffleContext();

  const { raffle: recentCompletedRaffle } = useRecentCompletedRaffle();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  const handlePurchase = async (quantity: number) => {
    setSelectedPackage(quantity);
    try {
      await purchaseTickets(quantity);
      // Success - context will auto-refresh data
    } catch (err) {
      // Error is already set in context
      console.error('Purchase failed:', err);
    } finally {
      setSelectedPackage(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">{t.home.loading.title}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t.home.error.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t.home.error.retry}
          </button>
        </div>
      </div>
    );
  }

  // No active raffle
  if (!activeRaffle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 max-w-md">
          <div className="text-6xl mb-4">🎟️</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t.home.noActiveRaffle.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {t.home.noActiveRaffle.description}
          </p>
        </div>
      </div>
    );
  }

  const playerCount = getUniquePlayerCount(recentActivity);
  const timeLeft = getTimeLeft(activeRaffle.endDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3">
            <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {t.home.title}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {t.home.subtitle}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Winner Banner */}
        {recentCompletedRaffle && (
          <WinnerBanner raffle={recentCompletedRaffle} />
        )}

        {/* Purchase Error Message */}
        {purchaseError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                  {t.home.purchaseError.title}
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">{purchaseError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
          {/* Players Card */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 rounded-2xl p-6 border-2 border-purple-500/20 text-center hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300 cursor-pointer group">
            <div className="flex justify-center mb-3">
              <svg className="w-8 h-8 text-purple-200 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{playerCount}</div>
            <div className="text-sm text-purple-100 group-hover:text-white transition-colors">{t.home.stats.players}</div>
          </div>

          {/* Time Left Card */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 rounded-2xl p-6 border-2 border-green-500/20 text-center hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 transition-all duration-300 cursor-pointer group">
            <div className="flex justify-center mb-3">
              <svg className="w-8 h-8 text-green-200 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{timeLeft}</div>
            <div className="text-sm text-green-100 group-hover:text-white transition-colors">{t.home.stats.timeLeft}</div>
          </div>

          {/* Entries Card */}
          <div className="bg-gradient-to-br from-pink-600 to-pink-700 dark:from-pink-700 dark:to-pink-800 rounded-2xl p-6 border-2 border-pink-500/20 text-center hover:shadow-xl hover:shadow-pink-500/30 hover:scale-105 transition-all duration-300 cursor-pointer group">
            <div className="flex justify-center mb-3">
              <svg className="w-8 h-8 text-pink-200 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{activeRaffle.ticketsSold}</div>
            <div className="text-sm text-pink-100 group-hover:text-white transition-colors">{t.home.stats.entries}</div>
          </div>
        </div>

        {/* Active Raffle Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">{t.home.raffle.activeLabel}</p>
                <h3 className="text-2xl font-bold">{activeRaffle.title}</h3>
                {activeRaffle.description && (
                  <p className="text-purple-100 text-sm mt-2">{activeRaffle.description}</p>
                )}
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-xs text-purple-100">Status</p>
                <p className="text-sm font-bold capitalize">{activeRaffle.status}</p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column - Glass Visualization */}
              <div className="flex items-center justify-center py-8">
                <GlassVisualization
                  currentAmount={activeRaffle.currentAmount}
                  goalAmount={activeRaffle.goalAmount}
                  ticketsSold={activeRaffle.ticketsSold}
                />
              </div>

              {/* Right Column - Ticket Purchase & My Tickets */}
              <div className="flex flex-col justify-center space-y-8">
                {/* Ticket Purchase Section */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    {t.home.raffle.choosePackage}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Package 1: 1 ticket */}
                    <button
                      onClick={() => handlePurchase(1)}
                      disabled={purchasing}
                      className="relative bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedPackage === 1 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-purple-600/10 rounded-xl">
                          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        1
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {t.home.raffle.ticket}
                      </div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(activeRaffle.ticketPrice)}
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          {t.home.raffle.select}
                        </span>
                      </div>
                    </button>

                    {/* Package 2: 5 tickets - HOT */}
                    <button
                      onClick={() => handlePurchase(5)}
                      disabled={purchasing}
                      className="relative bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-400 dark:border-orange-500 rounded-xl p-4 hover:border-orange-500 hover:shadow-lg transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedPackage === 5 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-orange-600/10 rounded-xl">
                          <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <span>🔥</span>
                        <span>{t.home.raffle.hot}</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        5
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                        {t.home.raffle.tickets}
                      </div>
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(activeRaffle.ticketPrice * 5)}
                      </div>
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">
                          {t.home.raffle.select}
                        </span>
                      </div>
                    </button>

                    {/* Package 3: 10 tickets */}
                    <button
                      onClick={() => handlePurchase(10)}
                      disabled={purchasing}
                      className="relative bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedPackage === 10 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-purple-600/10 rounded-xl">
                          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        10
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {t.home.raffle.tickets}
                      </div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(activeRaffle.ticketPrice * 10)}
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          {t.home.raffle.select}
                        </span>
                      </div>
                    </button>

                    {/* Package 4: 25 tickets */}
                    <button
                      onClick={() => handlePurchase(25)}
                      disabled={purchasing}
                      className="relative bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedPackage === 25 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-purple-600/10 rounded-xl">
                          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        25
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {t.home.raffle.tickets}
                      </div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(activeRaffle.ticketPrice * 25)}
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          {t.home.raffle.select}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* My Tickets Section */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    {t.home.myTickets.title}
                  </h4>
                  {userTickets.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <div className="flex justify-center mb-3">
                        <svg className="w-12 h-12 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {t.home.myTickets.empty}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        {t.home.myTickets.emptyHint}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {t.home.myTickets.youOwn} {userTickets.length} {userTickets.length === 1 ? t.home.raffle.ticket : t.home.raffle.tickets}
                        </span>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                          {t.home.myTickets.active}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {userTickets.slice(0, 20).map((ticket) => (
                          <div
                            key={ticket.id}
                            className="bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 rounded px-2 py-1 text-xs font-mono text-purple-700 dark:text-purple-300"
                          >
                            #{ticket.ticketNumber}
                          </div>
                        ))}
                        {userTickets.length > 20 && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
                            +{userTickets.length - 20} {t.home.myTickets.more}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h3 className="text-xl font-bold">{t.home.recentActivity.title}</h3>
              </div>
              <span className="text-sm text-purple-100">{t.home.recentActivity.live}</span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Scrollable Activity Feed */}
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">
                  {t.home.recentActivity.empty}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/70 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(activity.userName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        <span className="font-bold">{activity.userName}</span> {t.home.recentActivity.purchased}{' '}
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                          {activity.quantity} {activity.quantity === 1 ? t.home.raffle.ticket : t.home.raffle.tickets}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {getTimeAgo(activity.purchaseDate)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                        ${activity.totalAmount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* How It Works - Single Consolidated Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-4 sm:p-6 text-white">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h3 className="text-xl font-bold">{t.home.howItWorks.title}</h3>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {t.home.howItWorks.step1.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t.home.howItWorks.step1.description}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {t.home.howItWorks.step2.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t.home.howItWorks.step2.description}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {t.home.howItWorks.step3.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t.home.howItWorks.step3.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              {t.home.footer.copyright}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {t.home.footer.disclaimer}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
