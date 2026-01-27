'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PaymentTransaction {
  id: string;
  referenceCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  raffleId: string;
  raffleTitle: string;
  quantity: number;
  totalAmount: number;
  status: string;
  transactionDate: string;
  paymentMethod: string;
  paymentProofUrl?: string;
  adminNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  ticketIds: string[];
}

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login');
    }
  }, [session, status, router]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/payments?status=${statusFilter === 'pending' ? '' : statusFilter}`
      );

      if (!response.ok) throw new Error('Failed to fetch payments');

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== 'loading' && session) {
      fetchPayments();
    }
  }, [statusFilter, session, status]);

  const handleApprove = async (transactionId: string) => {
    if (!confirm('Are you sure you want to approve this payment and create tickets?')) {
      return;
    }

    setProcessing(transactionId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/payments/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          notes: reviewNotes[transactionId] || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve payment');
      }

      const data = await response.json();
      setSuccessMessage(
        `Payment approved! ${data.ticketCount} ticket(s) created successfully.`
      );
      setReviewNotes((prev) => {
        const updated = { ...prev };
        delete updated[transactionId];
        return updated;
      });
      await fetchPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve payment');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (transactionId: string) => {
    const notes = reviewNotes[transactionId];

    if (!notes || notes.trim() === '') {
      alert('Please provide a reason for rejection in the notes field.');
      return;
    }

    if (!confirm('Are you sure you want to reject this payment?')) {
      return;
    }

    setProcessing(transactionId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/payments/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject payment');
      }

      setSuccessMessage('Payment rejected successfully.');
      setReviewNotes((prev) => {
        const updated = { ...prev };
        delete updated[transactionId];
        return updated;
      });
      await fetchPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject payment');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'pending_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'failed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading payments...</p>
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
                Payment Review
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Review and approve Yape payment transactions
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/admin"
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Back to Admin
              </a>
              <a
                href="/"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Home
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

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {[
            { value: 'pending', label: 'Pending' },
            { value: 'all', label: 'All' },
            { value: 'completed', label: 'Completed' },
            { value: 'rejected', label: 'Rejected' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === filter.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Payments List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-6 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {statusFilter === 'pending' ? 'Pending Payments' : 'Payment Transactions'}
              </h3>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {transactions.length} transaction(s)
              </span>
            </div>
          </div>

          <div className="p-6">
            {transactions.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No {statusFilter === 'pending' ? 'pending ' : ''}transactions found.
              </p>
            ) : (
              <div className="space-y-6">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {tx.userName}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              tx.status
                            )}`}
                          >
                            {getStatusLabel(tx.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{tx.userEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Reference Code
                        </p>
                        <p className="text-lg font-mono font-bold text-purple-600 dark:text-purple-400">
                          {tx.referenceCode}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Raffle</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {tx.raffleTitle}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Quantity</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {tx.quantity} tickets
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Amount</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          S/ {tx.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {new Date(tx.transactionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-xl">💳</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                            Payment Method: {tx.paymentMethod.toUpperCase()}
                          </p>
                          <p className="text-xs text-yellow-800 dark:text-yellow-300">
                            User should have sent payment proof via WhatsApp/Email with reference
                            code: <span className="font-mono font-bold">{tx.referenceCode}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Review Notes (if reviewed) */}
                    {tx.reviewedAt && (
                      <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          Reviewed on {new Date(tx.reviewedAt).toLocaleString()}
                        </p>
                        {tx.adminNotes && (
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            <strong>Notes:</strong> {tx.adminNotes}
                          </p>
                        )}
                        {tx.ticketIds.length > 0 && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                            <strong>Tickets Created:</strong> {tx.ticketIds.length}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Review Actions (only for pending) */}
                    {(tx.status === 'pending_payment' || tx.status === 'pending_review') && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Admin Notes (optional for approve, required for reject)
                          </label>
                          <textarea
                            value={reviewNotes[tx.id] || ''}
                            onChange={(e) =>
                              setReviewNotes((prev) => ({ ...prev, [tx.id]: e.target.value }))
                            }
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm"
                            rows={2}
                            placeholder="Add notes about this payment review..."
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(tx.id)}
                            disabled={processing === tx.id}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            {processing === tx.id ? 'Processing...' : '✓ Approve & Create Tickets'}
                          </button>
                          <button
                            onClick={() => handleReject(tx.id)}
                            disabled={processing === tx.id}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            {processing === tx.id ? 'Processing...' : '✗ Reject Payment'}
                          </button>
                        </div>
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
