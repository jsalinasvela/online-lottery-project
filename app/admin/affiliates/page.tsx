'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Affiliate, AffiliateEarning } from '@/types/lottery';

export default function AffiliatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [earnings, setEarnings] = useState<AffiliateEarning[]>([]);
  const [earningsSummary, setEarningsSummary] = useState<{
    totalSales: number;
    totalCommission: number;
    affiliateCount: number;
    raffleCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    email: '',
    commissionRate: '0.05',
  });

  // View toggle
  const [activeTab, setActiveTab] = useState<'affiliates' | 'earnings'>('affiliates');
  const [includeInactive, setIncludeInactive] = useState(false);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login');
    }
  }, [session, status, router]);

  const fetchAffiliates = async () => {
    try {
      const response = await fetch(`/api/admin/affiliates?includeInactive=${includeInactive}`);
      if (!response.ok) throw new Error('Failed to fetch affiliates');
      const data = await response.json();
      setAffiliates(data.affiliates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch affiliates');
    }
  };

  const fetchEarnings = async () => {
    try {
      const response = await fetch('/api/admin/affiliates/earnings');
      if (!response.ok) throw new Error('Failed to fetch earnings');
      const data = await response.json();
      setEarnings(data.earnings || []);
      setEarningsSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch earnings');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAffiliates(), fetchEarnings()]);
      setLoading(false);
    };
    loadData();
  }, [includeInactive]);

  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          commissionRate: parseFloat(formData.commissionRate),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create affiliate');
      }

      setSuccessMessage('Affiliate created successfully!');
      setShowCreateForm(false);
      resetForm();
      await fetchAffiliates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create affiliate');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/affiliates/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          commissionRate: parseFloat(formData.commissionRate),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update affiliate');
      }

      setSuccessMessage('Affiliate updated successfully!');
      setEditingId(null);
      resetForm();
      await fetchAffiliates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update affiliate');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAffiliate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate affiliate "${name}"?`)) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/affiliates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete affiliate');
      }

      setSuccessMessage('Affiliate deactivated successfully!');
      await fetchAffiliates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete affiliate');
    }
  };

  const startEditing = (affiliate: Affiliate) => {
    setEditingId(affiliate.id);
    setFormData({
      code: affiliate.code,
      name: affiliate.name,
      email: affiliate.email,
      commissionRate: affiliate.commissionRate.toString(),
    });
    setShowCreateForm(false);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      email: '',
      commissionRate: '0.05',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading affiliates...</p>
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
                Affiliate Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage affiliates and view earnings
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/admin"
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Back to Admin
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('affiliates')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'affiliates'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            👥 Affiliates ({affiliates.length})
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'earnings'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            💰 Earnings ({earnings.length})
          </button>
        </div>

        {activeTab === 'affiliates' && (
          <>
            {/* Actions Bar */}
            <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
              <button
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium cursor-pointer"
              >
                {showCreateForm ? 'Cancel' : '+ Add New Affiliate'}
              </button>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                Show inactive affiliates
              </label>
            </div>

            {/* Create/Edit Form */}
            {(showCreateForm || editingId) && (
              <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-6 text-white">
                  <h3 className="text-xl font-bold">
                    {editingId ? 'Edit Affiliate' : 'Add New Affiliate'}
                  </h3>
                </div>
                <form onSubmit={editingId ? handleUpdateAffiliate : handleCreateAffiliate} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        placeholder="e.g., JUAN2024"
                        pattern="[A-Za-z0-9_-]+"
                        title="Only letters, numbers, underscores, and hyphens"
                      />
                      <p className="text-xs text-slate-500 mt-1">Used in referral links: /?ref=CODE</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Commission Rate *
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          required
                          min="0"
                          max="1"
                          step="0.01"
                          value={formData.commissionRate}
                          onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        />
                        <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          ({(parseFloat(formData.commissionRate || '0') * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        placeholder="Affiliate name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        placeholder="affiliate@example.com"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {creating ? 'Saving...' : editingId ? 'Update Affiliate' : 'Create Affiliate'}
                    </button>
                    <button
                      type="button"
                      onClick={editingId ? cancelEdit : () => setShowCreateForm(false)}
                      className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Affiliates List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-6 text-white">
                <h3 className="text-xl font-bold">All Affiliates</h3>
              </div>

              <div className="p-6">
                {affiliates.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                    No affiliates found. Add one to get started!
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Code</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Commission</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {affiliates.map((affiliate) => (
                          <tr key={affiliate.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                            <td className="py-3 px-4">
                              <code className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-sm font-mono">
                                {affiliate.code}
                              </code>
                            </td>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-100">{affiliate.name}</td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{affiliate.email}</td>
                            <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                              {(affiliate.commissionRate * 100).toFixed(0)}%
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                affiliate.active
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {affiliate.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEditing(affiliate)}
                                  className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                                >
                                  Edit
                                </button>
                                {affiliate.active && (
                                  <button
                                    onClick={() => handleDeleteAffiliate(affiliate.id, affiliate.name)}
                                    className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
                                  >
                                    Deactivate
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'earnings' && (
          <>
            {/* Earnings Summary */}
            {earningsSummary && (
              <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Sales</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    ${earningsSummary.totalSales.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Commission Owed</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ${earningsSummary.totalCommission.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Affiliates with Sales</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {earningsSummary.affiliateCount}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Completed Raffles</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {earningsSummary.raffleCount}
                  </p>
                </div>
              </div>
            )}

            {/* Earnings Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-6 text-white">
                <h3 className="text-xl font-bold">Earnings by Affiliate & Raffle</h3>
                <p className="text-sm text-purple-100 mt-1">Only shows completed raffles</p>
              </div>

              <div className="p-6">
                {earnings.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                    No earnings yet. Earnings appear after raffles are completed.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Affiliate</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Raffle</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Total Sales</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {earnings.map((earning, index) => (
                          <tr key={index} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-slate-900 dark:text-slate-100 font-medium">{earning.affiliateName}</p>
                                <code className="text-xs text-slate-500 dark:text-slate-400">{earning.affiliateCode}</code>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{earning.raffleTitle}</td>
                            <td className="py-3 px-4 text-right text-slate-900 dark:text-slate-100">
                              ${earning.totalSales.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-purple-600 dark:text-purple-400">
                              ${earning.commission.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
