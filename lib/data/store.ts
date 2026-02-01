// Database store using Prisma ORM
// Replaces the previous in-memory Map-based store

import { prisma } from '@/lib/db/prisma';
import type {
  Raffle,
  Ticket,
  User,
  PurchaseTransaction,
  Winner,
  Affiliate,
  AffiliateEarning,
} from '@/types/lottery';

// ============================================
// Activity Feed Interface
// ============================================

export interface ActivityEntry {
  id: string;
  userId: string;
  userName: string;
  quantity: number;
  totalAmount: number;
  purchaseDate: Date;
  raffleId: string;
}

// ============================================
// Raffle Operations
// ============================================

export async function createRaffle(raffle: Omit<Raffle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Raffle> {
  const created = await prisma.raffle.create({
    data: {
      title: raffle.title,
      description: raffle.description || '',
      ticketPrice: raffle.ticketPrice,
      goalAmount: raffle.goalAmount,
      currentAmount: raffle.currentAmount || 0,
      ticketsSold: raffle.ticketsSold || 0,
      maxTickets: raffle.maxTickets,
      startDate: raffle.startDate || new Date(),
      endDate: raffle.endDate,
      status: raffle.status === 'active' ? 'ACTIVE' : raffle.status === 'completed' ? 'COMPLETED' : 'CANCELLED',
      winnerId: raffle.winnerId,
      winningTicketId: raffle.winningTicketId,
      winningTicketNumber: raffle.winningTicketNumber,
      winnerName: raffle.winnerName,
      executedAt: raffle.executedAt,
      // Prize/Platform split configuration
      prizePercentage: raffle.prizePercentage ?? 0.70,
      causeName: raffle.causeName || null,
      causeDescription: raffle.causeDescription || null,
    },
  });

  return convertRaffleFromDb(created);
}

export async function getRaffleById(id: string): Promise<Raffle | undefined> {
  const raffle = await prisma.raffle.findUnique({
    where: { id },
  });

  return raffle ? convertRaffleFromDb(raffle) : undefined;
}

export async function getAllRaffles(): Promise<Raffle[]> {
  const raffles = await prisma.raffle.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return raffles.map(convertRaffleFromDb);
}

export async function getActiveRaffle(): Promise<Raffle | undefined> {
  const raffle = await prisma.raffle.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  return raffle ? convertRaffleFromDb(raffle) : undefined;
}

export async function getRafflesByStatus(status: string): Promise<Raffle[]> {
  const dbStatus = status === 'active' ? 'ACTIVE' : status === 'completed' ? 'COMPLETED' : 'CANCELLED';

  const raffles = await prisma.raffle.findMany({
    where: { status: dbStatus },
    orderBy: { createdAt: 'desc' },
  });

  return raffles.map(convertRaffleFromDb);
}

export async function getMostRecentCompletedRaffle(): Promise<Raffle | undefined> {
  const raffle = await prisma.raffle.findFirst({
    where: {
      status: 'COMPLETED',
      winnerId: { not: null },
    },
    orderBy: { executedAt: 'desc' },
  });

  return raffle ? convertRaffleFromDb(raffle) : undefined;
}

export async function updateRaffle(id: string, updates: Partial<Raffle>): Promise<Raffle | undefined> {
  try {
    const updateData: any = { updatedAt: new Date() };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.ticketPrice !== undefined) updateData.ticketPrice = updates.ticketPrice;
    if (updates.goalAmount !== undefined) updateData.goalAmount = updates.goalAmount;
    if (updates.currentAmount !== undefined) updateData.currentAmount = updates.currentAmount;
    if (updates.ticketsSold !== undefined) updateData.ticketsSold = updates.ticketsSold;
    if (updates.maxTickets !== undefined) updateData.maxTickets = updates.maxTickets;
    if (updates.startDate !== undefined) updateData.startDate = updates.startDate;
    if (updates.endDate !== undefined) updateData.endDate = updates.endDate;
    if (updates.status !== undefined) {
      updateData.status = updates.status === 'active' ? 'ACTIVE' : updates.status === 'completed' ? 'COMPLETED' : 'CANCELLED';
    }
    if (updates.winnerId !== undefined) updateData.winnerId = updates.winnerId;
    if (updates.winningTicketId !== undefined) updateData.winningTicketId = updates.winningTicketId;
    if (updates.winningTicketNumber !== undefined) updateData.winningTicketNumber = updates.winningTicketNumber;
    if (updates.winnerName !== undefined) updateData.winnerName = updates.winnerName;
    if (updates.executedAt !== undefined) updateData.executedAt = updates.executedAt;
    // Prize/Platform split configuration
    if (updates.prizePercentage !== undefined) updateData.prizePercentage = updates.prizePercentage;
    if (updates.causeName !== undefined) updateData.causeName = updates.causeName;
    if (updates.causeDescription !== undefined) updateData.causeDescription = updates.causeDescription;

    const updated = await prisma.raffle.update({
      where: { id },
      data: updateData,
    });

    return convertRaffleFromDb(updated);
  } catch (error) {
    return undefined;
  }
}

export async function deleteRaffle(id: string): Promise<boolean> {
  try {
    await prisma.raffle.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    return false;
  }
}

// ============================================
// Ticket Operations
// ============================================

export async function createTicket(ticket: Omit<Ticket, 'id'>): Promise<Ticket> {
  const created = await prisma.ticket.create({
    data: {
      raffleId: ticket.raffleId,
      userId: ticket.userId,
      ticketNumber: ticket.ticketNumber,
      purchaseAmount: ticket.purchaseAmount,
      purchaseDate: ticket.purchaseDate || new Date(),
      isWinner: ticket.isWinner || false,
    },
  });

  return convertTicketFromDb(created);
}

export async function getTicketById(id: string): Promise<Ticket | undefined> {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
  });

  return ticket ? convertTicketFromDb(ticket) : undefined;
}

export async function getTicketsByRaffleId(raffleId: string): Promise<Ticket[]> {
  const tickets = await prisma.ticket.findMany({
    where: { raffleId },
    orderBy: { ticketNumber: 'asc' },
  });

  return tickets.map(convertTicketFromDb);
}

export async function getTicketsByUserId(userId: string, raffleId?: string): Promise<Ticket[]> {
  const tickets = await prisma.ticket.findMany({
    where: {
      userId,
      ...(raffleId ? { raffleId } : {}),
    },
    orderBy: { purchaseDate: 'desc' },
  });

  return tickets.map(convertTicketFromDb);
}

export async function getTicketCount(raffleId: string): Promise<number> {
  return await prisma.ticket.count({
    where: { raffleId },
  });
}

export async function updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined> {
  try {
    const updated = await prisma.ticket.update({
      where: { id },
      data: updates,
    });

    return convertTicketFromDb(updated);
  } catch (error) {
    return undefined;
  }
}

// ============================================
// User Operations
// ============================================

export async function createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const created = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      walletBalance: user.walletBalance || 0,
    },
  });

  return convertUserFromDb(created);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user ? convertUserFromDb(user) : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user ? convertUserFromDb(user) : undefined;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    return convertUserFromDb(updated);
  } catch (error) {
    return undefined;
  }
}

// ============================================
// Transaction Operations
// ============================================

export async function createTransaction(transaction: Omit<PurchaseTransaction, 'id'>): Promise<PurchaseTransaction> {
  const created = await prisma.purchaseTransaction.create({
    data: {
      userId: transaction.userId,
      raffleId: transaction.raffleId,
      ticketIds: transaction.ticketIds,
      quantity: transaction.quantity,
      totalAmount: transaction.totalAmount,
      transactionDate: transaction.transactionDate || new Date(),
      status: convertStatusToDb(transaction.status),
      paymentMethod: 'yape',
      affiliateCode: transaction.affiliateCode || null,
    },
  });

  return convertTransactionFromDb(created);
}

export async function getTransactionById(id: string): Promise<PurchaseTransaction | undefined> {
  const transaction = await prisma.purchaseTransaction.findUnique({
    where: { id },
  });

  return transaction ? convertTransactionFromDb(transaction) : undefined;
}

export async function getTransactionsByUserId(userId: string): Promise<PurchaseTransaction[]> {
  const transactions = await prisma.purchaseTransaction.findMany({
    where: { userId },
    orderBy: { transactionDate: 'desc' },
  });

  return transactions.map(convertTransactionFromDb);
}

export async function getTransactionsByRaffleId(raffleId: string): Promise<PurchaseTransaction[]> {
  const transactions = await prisma.purchaseTransaction.findMany({
    where: { raffleId },
    orderBy: { transactionDate: 'desc' },
  });

  return transactions.map(convertTransactionFromDb);
}

// ============================================
// Winner Operations
// ============================================

export async function createWinner(winner: Omit<Winner, 'id'>): Promise<Winner> {
  const created = await prisma.winner.create({
    data: {
      raffleId: winner.raffleId,
      userId: winner.userId,
      ticketId: winner.ticketId,
      prizeAmount: winner.prizeAmount,
      announcedAt: winner.announcedAt || new Date(),
      claimedAt: winner.claimedAt,
    },
  });

  return convertWinnerFromDb(created);
}

export async function getWinnerById(id: string): Promise<Winner | undefined> {
  const winner = await prisma.winner.findUnique({
    where: { id },
  });

  return winner ? convertWinnerFromDb(winner) : undefined;
}

export async function getWinnerByRaffleId(raffleId: string): Promise<Winner | undefined> {
  const winner = await prisma.winner.findUnique({
    where: { raffleId },
  });

  return winner ? convertWinnerFromDb(winner) : undefined;
}

// ============================================
// Affiliate Operations
// ============================================

export async function createAffiliate(affiliate: Omit<Affiliate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Affiliate> {
  const created = await prisma.affiliate.create({
    data: {
      code: affiliate.code,
      name: affiliate.name,
      email: affiliate.email,
      commissionRate: affiliate.commissionRate ?? 0.05,
      active: affiliate.active ?? true,
    },
  });

  return convertAffiliateFromDb(created);
}

export async function getAffiliateById(id: string): Promise<Affiliate | undefined> {
  const affiliate = await prisma.affiliate.findUnique({
    where: { id },
  });

  return affiliate ? convertAffiliateFromDb(affiliate) : undefined;
}

export async function getAffiliateByCode(code: string): Promise<Affiliate | undefined> {
  const affiliate = await prisma.affiliate.findUnique({
    where: { code },
  });

  return affiliate ? convertAffiliateFromDb(affiliate) : undefined;
}

export async function getAllAffiliates(includeInactive = false): Promise<Affiliate[]> {
  const affiliates = await prisma.affiliate.findMany({
    where: includeInactive ? {} : { active: true },
    orderBy: { createdAt: 'desc' },
  });

  return affiliates.map(convertAffiliateFromDb);
}

export async function updateAffiliate(id: string, updates: Partial<Affiliate>): Promise<Affiliate | undefined> {
  try {
    const updateData: any = { updatedAt: new Date() };

    if (updates.code !== undefined) updateData.code = updates.code;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.commissionRate !== undefined) updateData.commissionRate = updates.commissionRate;
    if (updates.active !== undefined) updateData.active = updates.active;

    const updated = await prisma.affiliate.update({
      where: { id },
      data: updateData,
    });

    return convertAffiliateFromDb(updated);
  } catch (error) {
    return undefined;
  }
}

export async function deleteAffiliate(id: string): Promise<boolean> {
  try {
    // Soft delete by setting active to false
    await prisma.affiliate.update({
      where: { id },
      data: { active: false, updatedAt: new Date() },
    });
    return true;
  } catch (error) {
    return false;
  }
}

export async function getAffiliateEarnings(raffleId?: string): Promise<AffiliateEarning[]> {
  // Get all completed transactions with affiliate codes
  const whereClause: any = {
    status: 'COMPLETED',
    affiliateCode: { not: null },
  };

  if (raffleId) {
    whereClause.raffleId = raffleId;
  }

  const transactions = await prisma.purchaseTransaction.findMany({
    where: whereClause,
    include: {
      raffle: {
        select: { id: true, title: true, status: true },
      },
    },
  });

  // Only include transactions from completed raffles
  const completedRaffleTransactions = transactions.filter(
    (t: any) => t.raffle.status === 'COMPLETED'
  );

  // Get all affiliates for commission rates
  const affiliates = await prisma.affiliate.findMany();
  const affiliateMap = new Map(affiliates.map((a: any) => [a.code, a]));

  // Group transactions by affiliate and raffle
  const earningsMap = new Map<string, AffiliateEarning>();

  for (const transaction of completedRaffleTransactions) {
    const key = `${transaction.affiliateCode}-${transaction.raffleId}`;
    const affiliate = affiliateMap.get(transaction.affiliateCode!);

    if (!affiliate) continue;

    const existing = earningsMap.get(key);
    if (existing) {
      existing.totalSales += transaction.totalAmount;
      existing.commission = existing.totalSales * affiliate.commissionRate;
    } else {
      earningsMap.set(key, {
        affiliateId: affiliate.id,
        affiliateCode: affiliate.code,
        affiliateName: affiliate.name,
        raffleId: transaction.raffleId,
        raffleTitle: (transaction as any).raffle.title,
        totalSales: transaction.totalAmount,
        commission: transaction.totalAmount * affiliate.commissionRate,
      });
    }
  }

  return Array.from(earningsMap.values());
}

// ============================================
// Activity Feed Operations
// ============================================

export async function addActivity(_activity: ActivityEntry): Promise<void> {
  // Activity is now derived from transactions table, so this is a no-op
  // We keep the function for compatibility
  return;
}

export async function getRecentActivities(raffleId: string, limit = 20): Promise<ActivityEntry[]> {
  const transactions = await prisma.purchaseTransaction.findMany({
    where: {
      raffleId,
      status: 'COMPLETED',
    },
    include: {
      user: true,
    },
    orderBy: {
      transactionDate: 'desc',
    },
    take: limit,
  });

  return transactions.map((t: any) => ({
    id: t.id,
    userId: t.userId,
    userName: t.user.name,
    quantity: t.quantity,
    totalAmount: t.totalAmount,
    purchaseDate: t.transactionDate,
    raffleId: t.raffleId,
  }));
}

// ============================================
// Utility Functions
// ============================================

export function generateId(): string {
  // Prisma generates IDs automatically, but keeping for compatibility
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function clearAllData(): Promise<void> {
  // Clear all data in the correct order due to foreign key constraints
  await prisma.winner.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.purchaseTransaction.deleteMany();
  await prisma.raffle.deleteMany();
  await prisma.user.deleteMany();
}

// ============================================
// Type Conversion Helpers
// ============================================

function convertRaffleFromDb(dbRaffle: any): Raffle {
  return {
    id: dbRaffle.id,
    title: dbRaffle.title,
    description: dbRaffle.description,
    ticketPrice: dbRaffle.ticketPrice,
    goalAmount: dbRaffle.goalAmount,
    currentAmount: dbRaffle.currentAmount,
    ticketsSold: dbRaffle.ticketsSold,
    maxTickets: dbRaffle.maxTickets,
    startDate: dbRaffle.startDate,
    endDate: dbRaffle.endDate,
    status: dbRaffle.status.toLowerCase(),
    winnerId: dbRaffle.winnerId,
    winningTicketId: dbRaffle.winningTicketId,
    winningTicketNumber: dbRaffle.winningTicketNumber,
    winnerName: dbRaffle.winnerName,
    executedAt: dbRaffle.executedAt,
    createdAt: dbRaffle.createdAt,
    updatedAt: dbRaffle.updatedAt,
    // Prize/Platform split configuration
    prizePercentage: dbRaffle.prizePercentage ?? 0.70,
    causeName: dbRaffle.causeName || undefined,
    causeDescription: dbRaffle.causeDescription || undefined,
  };
}

function convertTicketFromDb(dbTicket: any): Ticket {
  return {
    id: dbTicket.id,
    raffleId: dbTicket.raffleId,
    userId: dbTicket.userId,
    ticketNumber: dbTicket.ticketNumber,
    purchaseAmount: dbTicket.purchaseAmount,
    purchaseDate: dbTicket.purchaseDate,
    isWinner: dbTicket.isWinner,
  };
}

function convertUserFromDb(dbUser: any): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    walletBalance: dbUser.walletBalance,
    createdAt: dbUser.createdAt,
    updatedAt: dbUser.updatedAt,
  };
}

function convertTransactionFromDb(dbTransaction: any): PurchaseTransaction {
  return {
    id: dbTransaction.id,
    userId: dbTransaction.userId,
    raffleId: dbTransaction.raffleId,
    ticketIds: dbTransaction.ticketIds,
    quantity: dbTransaction.quantity,
    totalAmount: dbTransaction.totalAmount,
    transactionDate: dbTransaction.transactionDate,
    status: convertStatusFromDb(dbTransaction.status) as any,
    affiliateCode: dbTransaction.affiliateCode || undefined,
  };
}

function convertWinnerFromDb(dbWinner: any): Winner {
  return {
    id: dbWinner.id,
    raffleId: dbWinner.raffleId,
    userId: dbWinner.userId,
    ticketId: dbWinner.ticketId,
    prizeAmount: dbWinner.prizeAmount,
    announcedAt: dbWinner.announcedAt,
    claimedAt: dbWinner.claimedAt,
  };
}

function convertAffiliateFromDb(dbAffiliate: any): Affiliate {
  return {
    id: dbAffiliate.id,
    code: dbAffiliate.code,
    name: dbAffiliate.name,
    email: dbAffiliate.email,
    commissionRate: dbAffiliate.commissionRate,
    active: dbAffiliate.active,
    createdAt: dbAffiliate.createdAt,
    updatedAt: dbAffiliate.updatedAt,
  };
}

function convertStatusToDb(status: string): any {
  const statusMap: Record<string, string> = {
    'pending_payment': 'PENDING_PAYMENT',
    'pending_review': 'PENDING_REVIEW',
    'completed': 'COMPLETED',
    'rejected': 'REJECTED',
    'failed': 'FAILED',
  };

  return statusMap[status] || 'PENDING_PAYMENT';
}

function convertStatusFromDb(dbStatus: string): string {
  const statusMap: Record<string, string> = {
    'PENDING_PAYMENT': 'pending_payment',
    'PENDING_REVIEW': 'pending_review',
    'COMPLETED': 'completed',
    'REJECTED': 'rejected',
    'FAILED': 'failed',
  };

  return statusMap[dbStatus] || 'pending_payment';
}
