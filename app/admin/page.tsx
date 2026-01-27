'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Raffle } from '@/types/lottery';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [executing, setExecuting] = useState<string | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login');
    }
  }, [session, status, router]);

  // Create raffle form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ticketPrice: 5,
    goalAmount: 10000,
    maxTickets: 5000,
    endDate: '',
  });

  const fetchRaffles = async () => {
    try {
      const response = await fetch('/api/raffles');
      if (!response.ok) throw new Error('Failed to fetch raffles');
      const data = await response.json();
      setRaffles(data.raffles || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch raffles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaffles();
  }, []);

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          endDate: formData.endDate || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create raffle');
      }

      setSuccessMessage('Raffle created successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        ticketPrice: 5,
        goalAmount: 10000,
        maxTickets: 5000,
        endDate: '',
      });
      await fetchRaffles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create raffle');
    } finally {
      setCreating(false);
    }
  };

  const handleExecuteRaffle = async (raffleId: string) => {
    if (!confirm('Are you sure you want to execute this raffle and select a winner?')) {
      return;
    }

    setExecuting(raffleId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/execute-raffle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raffleId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute raffle');
      }

      const data = await response.json();
      setSuccessMessage(data.message || 'Raffle executed successfully!');
      await fetchRaffles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute raffle');
    } finally {
      setExecuting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage raffles and view statistics
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/admin/payments"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                💳 Payment Review
              </a>
              <a
                href="/"
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                  Success
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                  Error
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Create Raffle Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            {showCreateForm ? 'Cancel' : '+ Create New Raffle'}
          </button>
        </div>

        {/* Create Raffle Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-6 text-white">
              <h3 className="text-xl font-bold">Create New Raffle</h3>
            </div>
            <form onSubmit={handleCreateRaffle} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  placeholder="e.g., Lucky Draw - Week 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  rows={3}
                  placeholder="Describe the raffle..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Ticket Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.ticketPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, ticketPrice: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Goal Amount ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.goalAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, goalAmount: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Max Tickets
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxTickets}
                    onChange={(e) =>
                      setFormData({ ...formData, maxTickets: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Raffle'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Raffles List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-6 text-white">
            <h3 className="text-xl font-bold">All Raffles</h3>
          </div>

          <div className="p-6">
            {raffles.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No raffles found. Create one to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {raffles.map((raffle) => (
                  <div
                    key={raffle.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:border-purple-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {raffle.title}
                        </h4>
                        {raffle.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {raffle.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
                          raffle.status
                        )}`}
                      >
                        {raffle.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Ticket Price</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          ${raffle.ticketPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Goal</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          ${raffle.goalAmount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Current</p>
                        <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                          ${raffle.currentAmount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tickets Sold</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {raffle.ticketsSold}
                        </p>
                      </div>
                    </div>

                    {raffle.status === 'active' && (
                      <button
                        onClick={() => handleExecuteRaffle(raffle.id)}
                        disabled={executing === raffle.id || raffle.ticketsSold === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {executing === raffle.id ? 'Executing...' : 'Execute Raffle'}
                      </button>
                    )}

                    {raffle.status === 'completed' && raffle.winnerId && (
                      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                          🎉 Winner: {raffle.winnerName || 'Anonymous'} | Ticket #{raffle.winningTicketNumber || raffle.winningTicketId}
                        </p>
                        <p className="text-xs text-yellow-800 dark:text-yellow-300 mt-1">
                          Prize: ${raffle.currentAmount}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
