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

export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface PurchaseTransaction {
  id: string;
  userId: string;
  raffleId: string;
  ticketIds: string[];          // Array of purchased ticket IDs
  quantity: number;
  totalAmount: number;
  transactionDate: Date;
  status: TransactionStatus;
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
