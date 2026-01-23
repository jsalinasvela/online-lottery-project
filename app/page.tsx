import GlassVisualization from '@/components/raffle/GlassVisualization';

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

          {/* Two Column Layout */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column - Glass Visualization */}
              <div className="flex items-center justify-center py-8">
                <GlassVisualization
                  currentAmount={2450}
                  goalAmount={10000}
                  ticketsSold={490}
                />
              </div>

              {/* Right Column - Ticket Purchase & My Tickets */}
              <div className="flex flex-col justify-center space-y-8">
                {/* Ticket Purchase Section */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Choose Your Package
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Package 1: 1 ticket / $5 */}
                    <button className="relative bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-200 text-left group">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        1
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        ticket
                      </div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        $5
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          Select
                        </span>
                      </div>
                    </button>

                    {/* Package 2: 5 tickets / $20 - HOT */}
                    <button className="relative bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-400 dark:border-orange-500 rounded-xl p-4 hover:border-orange-500 hover:shadow-lg transition-all duration-200 text-left group">
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <span>🔥</span>
                        <span>HOT</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        5
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                        tickets
                      </div>
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        $20
                      </div>
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">
                          Select
                        </span>
                      </div>
                    </button>

                    {/* Package 3: 10 tickets / $35 */}
                    <button className="relative bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-200 text-left group">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        10
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        tickets
                      </div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        $35
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                        Save $15
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          Select
                        </span>
                      </div>
                    </button>

                    {/* Package 4: 25 tickets / $75 */}
                    <button className="relative bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-200 text-left group">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        25
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        tickets
                      </div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        $75
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                        Save $50
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          Select
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* My Tickets Section */}
                <div>
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
                <h3 className="text-xl font-bold">Recent Activity</h3>
              </div>
              <span className="text-sm text-purple-100">Live</span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Scrollable Activity Feed */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {/* Activity Item 1 */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/70 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  JD
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    <span className="font-bold">John D.</span> purchased <span className="text-purple-600 dark:text-purple-400 font-semibold">5 tickets</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">2 minutes ago</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                    $20
                  </span>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/70 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  SM
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    <span className="font-bold">Sarah M.</span> purchased <span className="text-purple-600 dark:text-purple-400 font-semibold">10 tickets</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">5 minutes ago</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                    $35
                  </span>
                </div>
              </div>

              {/* Activity Item 3 */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/70 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                  MK
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    <span className="font-bold">Mike K.</span> purchased <span className="text-purple-600 dark:text-purple-400 font-semibold">1 ticket</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">8 minutes ago</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                    $5
                  </span>
                </div>
              </div>

              {/* Activity Item 4 */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/70 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                  AL
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    <span className="font-bold">Alex L.</span> purchased <span className="text-purple-600 dark:text-purple-400 font-semibold">25 tickets</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">12 minutes ago</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                    $75
                  </span>
                </div>
              </div>

              {/* Activity Item 5 */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/70 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  EW
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    <span className="font-bold">Emma W.</span> purchased <span className="text-purple-600 dark:text-purple-400 font-semibold">5 tickets</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">15 minutes ago</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                    $20
                  </span>
                </div>
              </div>

              {/* Activity Item 6 */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/70 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  RC
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    <span className="font-bold">Ryan C.</span> purchased <span className="text-purple-600 dark:text-purple-400 font-semibold">10 tickets</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">18 minutes ago</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                    $35
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - Single Consolidated Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-4 sm:p-6 text-white">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h3 className="text-xl font-bold">How It Works</h3>
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
                    Purchase Your Tickets
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Choose from our ticket packages and join the draw. Watch the prize pool grow in real-time as more players participate.
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
                    Fair & Transparent Selection
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Every ticket has an equal chance to win. When the goal is reached, a winner is automatically selected using a cryptographically secure random process.
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
                    Instant Payout
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Winners receive their prize immediately after the draw. Check the history section to see past winners and completed raffles.
                  </p>
                </div>
              </div>
            </div>
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
