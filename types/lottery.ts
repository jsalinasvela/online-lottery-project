// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Raffle Types
// ============================================

export type RaffleStatus = 'active' | 'completed' | 'cancelled';

export interface Raffle {
  id: string;
  title: string;
  description: string;
  ticketPrice: number;          // Price per ticket in currency
  goalAmount: number;            // Target amount to reach
  currentAmount: number;         // Current prize pool
  ticketsSold: number;          // Total tickets sold
  maxTickets?: number;          // Optional max tickets limit
  startDate: Date;
  endDate?: Date;               // Optional end date
  status: RaffleStatus;
  winnerId?: string;            // Winner user ID (when completed)
  winningTicketId?: string;     // Winning ticket ID
  winningTicketNumber?: number; // Winning ticket number (for display)
  winnerName?: string;          // Winner name (for display)
  executedAt?: Date;            // When raffle was executed
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Ticket Types
// ============================================

export interface Ticket {
  id: string;
  raffleId: string;
  userId: string;
  ticketNumber: number;         // Unique sequential number for this raffle
  purchaseAmount: number;       // Amount paid for this ticket
  purchaseDate: Date;
  isWinner: boolean;            // True if this ticket won
}

// ============================================
// Transaction Types
// ============================================

export type TransactionStatus =
  | 'pending_payment'   // Waiting for user to send Yape payment
  | 'pending_review'    // Screenshot submitted, waiting for admin review
  | 'completed'         // Admin approved payment
  | 'rejected'          // Admin rejected payment
  | 'failed';           // Technical failure

export interface PurchaseTransaction {
  id: string;
  userId: string;
  raffleId: string;
  ticketIds: string[];          // Array of purchased ticket IDs (empty until approved)
  quantity: number;
  totalAmount: number;
  transactionDate: Date;
  status: TransactionStatus;

  // Yape payment verification fields
  paymentProofUrl?: string;     // Screenshot URL or path
  paymentMethod?: string;       // Payment method (e.g., 'yape')
  adminNotes?: string;          // Admin can add notes during review
  reviewedAt?: Date;            // When admin reviewed
  reviewedBy?: string;          // Admin user ID who reviewed

  // Affiliate tracking
  affiliateCode?: string;       // Code of referring affiliate (if any)
}

// ============================================
// Winner Types
// ============================================

export interface Winner {
  id: string;
  raffleId: string;
  userId: string;
  ticketId: string;
  prizeAmount: number;
  announcedAt: Date;
  claimedAt?: Date;
}

// ============================================
// Affiliate Types
// ============================================

export interface Affiliate {
  id: string;
  code: string;                 // Unique referral code (e.g., "JUAN2024")
  name: string;
  email: string;
  commissionRate: number;       // Commission rate (e.g., 0.05 for 5%)
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AffiliateEarning {
  affiliateId: string;
  affiliateCode: string;
  affiliateName: string;
  raffleId: string;
  raffleTitle: string;
  totalSales: number;           // Sum of approved transaction amounts
  commission: number;           // totalSales * commissionRate
}
