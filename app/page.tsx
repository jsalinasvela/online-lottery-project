export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              🏆 Lucky Draw ✨
            </span>
          </h1>
          <p className="text-lg text-slate-400">
            Watch the prize pool grow in real-time! 🚀
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          {/* Players Card */}
          <div className="bg-slate-800/50 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 text-center">
            <div className="flex justify-center mb-3">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-white mb-1">87</div>
            <div className="text-sm text-slate-400">Players</div>
          </div>

          {/* Time Left Card */}
          <div className="bg-slate-800/50 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 text-center">
            <div className="flex justify-center mb-3">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-white mb-1">48h</div>
            <div className="text-sm text-slate-400">Time Left</div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-slate-800/50 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 text-center">
            <div className="flex justify-center mb-3">
              <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-white mb-1">0</div>
            <div className="text-sm text-slate-400">Recent</div>
          </div>
        </div>

        {/* Active Raffle Card - Placeholder */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">ACTIVE RAFFLE</p>
                <h3 className="text-2xl font-bold">Grand Prize Draw</h3>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-xs text-purple-100">Status</p>
                <p className="text-sm font-bold">Active</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Prize Pool Display - Placeholder */}
            <div className="mb-8">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Current Prize Pool
                </span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Goal: $1,000
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <div className="mt-2 text-center">
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    $650.00
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">
                    / $1,000.00
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Purchase Section - Placeholder */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Purchase Tickets
              </h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Total: <span className="text-lg font-bold text-slate-900 dark:text-slate-100">$10.00</span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                    Buy Tickets
                  </button>
                </div>
              </div>
            </div>

            {/* My Tickets - Placeholder */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                My Tickets
              </h4>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                  You haven&apos;t purchased any tickets yet
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              How It Works
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Purchase tickets and watch the prize pool grow. When the goal is reached, a winner is automatically selected!
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Fair & Transparent
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Every ticket has an equal chance. Winners are selected using a cryptographically secure random process.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Instant Payout
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Winners receive their prize immediately. Check the history to see past winners and raffles.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>© 2025 Online Lottery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
