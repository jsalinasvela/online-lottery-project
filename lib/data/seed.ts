// Seed initial data for the lottery application

import { Raffle, User, Ticket, PurchaseTransaction } from '@/types/lottery';
import {
  createRaffle,
  createUser,
  createTicket,
  createTransaction,
  addActivity,
  generateId,
} from './store';

// ============================================
// Mock User Data
// ============================================

const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John D.',
    email: 'john.d@example.com',
    walletBalance: 500,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    updatedAt: new Date(),
  },
  {
    id: 'user-2',
    name: 'Sarah M.',
    email: 'sarah.m@example.com',
    walletBalance: 350,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'user-3',
    name: 'Mike R.',
    email: 'mike.r@example.com',
    walletBalance: 200,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'user-4',
    name: 'Emily L.',
    email: 'emily.l@example.com',
    walletBalance: 450,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'user-5',
    name: 'Alex K.',
    email: 'alex.k@example.com',
    walletBalance: 300,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'user-6',
    name: 'Lisa P.',
    email: 'lisa.p@example.com',
    walletBalance: 600,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

// ============================================
// Initialize Database
// ============================================

let isInitialized = false;

export function initializeData(): void {
  if (isInitialized) {
    console.log('Data already initialized');
    return;
  }

  console.log('Initializing lottery data...');

  // Create users
  mockUsers.forEach((user) => createUser(user));

  // Create active raffle
  const activeRaffle: Raffle = {
    id: 'raffle-1',
    title: 'Lucky Draw - Week 1',
    description: 'Win the grand prize! Every ticket counts towards the prize pool.',
    ticketPrice: 5,
    goalAmount: 10000,
    currentAmount: 2450,
    ticketsSold: 490,
    maxTickets: 5000,
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Ends in 2 days (48 hours)
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  };

  createRaffle(activeRaffle);

  // Create sample tickets and transactions
  const recentPurchases: Array<{ userId: string; userName: string; quantity: number; minutesAgo: number }> = [
    { userId: 'user-1', userName: 'John D.', quantity: 5, minutesAgo: 2 },
    { userId: 'user-2', userName: 'Sarah M.', quantity: 10, minutesAgo: 15 },
    { userId: 'user-3', userName: 'Mike R.', quantity: 1, minutesAgo: 23 },
    { userId: 'user-4', userName: 'Emily L.', quantity: 5, minutesAgo: 45 },
    { userId: 'user-5', userName: 'Alex K.', quantity: 25, minutesAgo: 67 },
    { userId: 'user-6', userName: 'Lisa P.', quantity: 10, minutesAgo: 120 },
  ];

  let ticketNumber = 1;

  recentPurchases.forEach((purchase) => {
    const purchaseDate = new Date(Date.now() - purchase.minutesAgo * 60 * 1000);
    const ticketIds: string[] = [];
    const totalAmount = purchase.quantity * activeRaffle.ticketPrice;

    // Create tickets
    for (let i = 0; i < purchase.quantity; i++) {
      const ticket: Ticket = {
        id: generateId(),
        raffleId: activeRaffle.id,
        userId: purchase.userId,
        ticketNumber: ticketNumber++,
        purchaseAmount: activeRaffle.ticketPrice,
        purchaseDate,
        isWinner: false,
      };
      createTicket(ticket);
      ticketIds.push(ticket.id);
    }

    // Create transaction
    const transaction: PurchaseTransaction = {
      id: generateId(),
      userId: purchase.userId,
      raffleId: activeRaffle.id,
      ticketIds,
      quantity: purchase.quantity,
      totalAmount,
      transactionDate: purchaseDate,
      status: 'completed',
    };
    createTransaction(transaction);

    // Add to activity feed
    addActivity({
      id: transaction.id,
      userId: purchase.userId,
      userName: purchase.userName,
      quantity: purchase.quantity,
      totalAmount,
      purchaseDate,
      raffleId: activeRaffle.id,
    });
  });

  // Add some older tickets to reach 490 total
  // We've created 56 tickets above (5+10+1+5+25+10), need 434 more
  const olderUsers = [mockUsers[0], mockUsers[1], mockUsers[2]];
  const remainingTickets = 490 - ticketNumber + 1;

  for (let i = 0; i < remainingTickets; i++) {
    const randomUser = olderUsers[i % olderUsers.length];
    const ticket: Ticket = {
      id: generateId(),
      raffleId: activeRaffle.id,
      userId: randomUser.id,
      ticketNumber: ticketNumber++,
      purchaseAmount: activeRaffle.ticketPrice,
      purchaseDate: new Date(Date.now() - (i + 200) * 60 * 1000), // Various times in the past
      isWinner: false,
    };
    createTicket(ticket);
  }

  isInitialized = true;
  console.log('Data initialization complete!');
  console.log(`- Created ${mockUsers.length} users`);
  console.log(`- Created 1 active raffle`);
  console.log(`- Created 490 tickets`);
  console.log(`- Created ${recentPurchases.length} recent transactions`);
}

// Auto-initialize on import
initializeData();
