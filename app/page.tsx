export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎫</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                Online Lottery
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Wallet:
                </span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  $500.00
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Win Big Today!
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Join the excitement and purchase your tickets for a chance to win the grand prize
          </p>
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
