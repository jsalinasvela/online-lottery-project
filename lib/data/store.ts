// In-memory data store for MVP
// This can be replaced with a real database later

import {
  Raffle,
  Ticket,
  User,
  PurchaseTransaction,
  Winner,
} from '@/types/lottery';

// ============================================
// In-Memory Data Stores
// ============================================

export const raffles = new Map<string, Raffle>();
export const tickets = new Map<string, Ticket>();
export const users = new Map<string, User>();
export const transactions = new Map<string, PurchaseTransaction>();
export const winners = new Map<string, Winner>();

// Activity feed - stores recent purchase transactions with user info
export interface ActivityEntry {
  id: string;
  userId: string;
  userName: string;
  quantity: number;
  totalAmount: number;
  purchaseDate: Date;
  raffleId: string;
}

export const activities: ActivityEntry[] = [];

// ============================================
// Raffle Operations
// ============================================

export function createRaffle(raffle: Raffle): Raffle {
  raffles.set(raffle.id, raffle);
  return raffle;
}

export function getRaffleById(id: string): Raffle | undefined {
  return raffles.get(id);
}

export function getAllRaffles(): Raffle[] {
  return Array.from(raffles.values());
}

export function getActiveRaffle(): Raffle | undefined {
  return Array.from(raffles.values()).find((r) => r.status === 'active');
}

export function getRafflesByStatus(status: string): Raffle[] {
  return Array.from(raffles.values()).filter((r) => r.status === status);
}

export function updateRaffle(id: string, updates: Partial<Raffle>): Raffle | undefined {
  const raffle = raffles.get(id);
  if (!raffle) return undefined;

  const updatedRaffle = {
    ...raffle,
    ...updates,
    updatedAt: new Date(),
  };

  raffles.set(id, updatedRaffle);
  return updatedRaffle;
}

export function deleteRaffle(id: string): boolean {
  return raffles.delete(id);
}

// ============================================
// Ticket Operations
// ============================================

export function createTicket(ticket: Ticket): Ticket {
  tickets.set(ticket.id, ticket);
  return ticket;
}

export function getTicketById(id: string): Ticket | undefined {
  return tickets.get(id);
}

export function getTicketsByRaffleId(raffleId: string): Ticket[] {
  return Array.from(tickets.values()).filter((t) => t.raffleId === raffleId);
}

export function getTicketsByUserId(userId: string, raffleId?: string): Ticket[] {
  const userTickets = Array.from(tickets.values()).filter((t) => t.userId === userId);

  if (raffleId) {
    return userTickets.filter((t) => t.raffleId === raffleId);
  }

  return userTickets;
}

export function getTicketCount(raffleId: string): number {
  return getTicketsByRaffleId(raffleId).length;
}

export function updateTicket(id: string, updates: Partial<Ticket>): Ticket | undefined {
  const ticket = tickets.get(id);
  if (!ticket) return undefined;

  const updatedTicket = { ...ticket, ...updates };
  tickets.set(id, updatedTicket);
  return updatedTicket;
}

// ============================================
// User Operations
// ============================================

export function createUser(user: User): User {
  users.set(user.id, user);
  return user;
}

export function getUserById(id: string): User | undefined {
  return users.get(id);
}

export function getUserByEmail(email: string): User | undefined {
  return Array.from(users.values()).find((u) => u.email === email);
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const user = users.get(id);
  if (!user) return undefined;

  const updatedUser = {
    ...user,
    ...updates,
    updatedAt: new Date(),
  };

  users.set(id, updatedUser);
  return updatedUser;
}

// ============================================
// Transaction Operations
// ============================================

export function createTransaction(transaction: PurchaseTransaction): PurchaseTransaction {
  transactions.set(transaction.id, transaction);
  return transaction;
}

export function getTransactionById(id: string): PurchaseTransaction | undefined {
  return transactions.get(id);
}

export function getTransactionsByUserId(userId: string): PurchaseTransaction[] {
  return Array.from(transactions.values()).filter((t) => t.userId === userId);
}

export function getTransactionsByRaffleId(raffleId: string): PurchaseTransaction[] {
  return Array.from(transactions.values()).filter((t) => t.raffleId === raffleId);
}

// ============================================
// Winner Operations
// ============================================

export function createWinner(winner: Winner): Winner {
  winners.set(winner.id, winner);
  return winner;
}

export function getWinnerById(id: string): Winner | undefined {
  return winners.get(id);
}

export function getWinnerByRaffleId(raffleId: string): Winner | undefined {
  return Array.from(winners.values()).find((w) => w.raffleId === raffleId);
}

// ============================================
// Activity Feed Operations
// ============================================

export function addActivity(activity: ActivityEntry): void {
  activities.unshift(activity); // Add to beginning for most recent first

  // Keep only last 50 activities to prevent memory issues
  if (activities.length > 50) {
    activities.pop();
  }
}

export function getRecentActivities(raffleId: string, limit = 20): ActivityEntry[] {
  return activities
    .filter((a) => a.raffleId === raffleId)
    .slice(0, limit);
}

// ============================================
// Utility Functions
// ============================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function clearAllData(): void {
  raffles.clear();
  tickets.clear();
  users.clear();
  transactions.clear();
  winners.clear();
  activities.length = 0;
}
