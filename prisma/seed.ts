import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock user data
const mockUsers = [
  {
    name: 'John D.',
    email: 'john.d@example.com',
    walletBalance: 500,
  },
  {
    name: 'Sarah M.',
    email: 'sarah.m@example.com',
    walletBalance: 350,
  },
  {
    name: 'Mike R.',
    email: 'mike.r@example.com',
    walletBalance: 200,
  },
  {
    name: 'Emily L.',
    email: 'emily.l@example.com',
    walletBalance: 450,
  },
  {
    name: 'Alex K.',
    email: 'alex.k@example.com',
    walletBalance: 300,
  },
  {
    name: 'Lisa P.',
    email: 'lisa.p@example.com',
    walletBalance: 600,
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (in order due to foreign key constraints)
  console.log('Cleaning existing data...');
  await prisma.winner.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.purchaseTransaction.deleteMany();
  await prisma.raffle.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('Creating users...');
  const createdUsers = await Promise.all(
    mockUsers.map((userData) =>
      prisma.user.create({
        data: userData,
      })
    )
  );
  console.log(`✅ Created ${createdUsers.length} users`);

  // Create active raffle
  console.log('Creating active raffle...');
  const activeRaffle = await prisma.raffle.create({
    data: {
      title: 'Lucky Draw - Week 1',
      description: 'Win the grand prize! Every ticket counts towards the prize pool.',
      ticketPrice: 5,
      goalAmount: 10000,
      currentAmount: 2450,
      ticketsSold: 490,
      maxTickets: 5000,
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Ends in 2 days
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Created raffle: ${activeRaffle.title}`);

  // Create sample recent purchases
  const recentPurchases = [
    { userId: createdUsers[0].id, userName: createdUsers[0].name, quantity: 5, minutesAgo: 2 },
    { userId: createdUsers[1].id, userName: createdUsers[1].name, quantity: 10, minutesAgo: 15 },
    { userId: createdUsers[2].id, userName: createdUsers[2].name, quantity: 1, minutesAgo: 23 },
    { userId: createdUsers[3].id, userName: createdUsers[3].name, quantity: 5, minutesAgo: 45 },
    { userId: createdUsers[4].id, userName: createdUsers[4].name, quantity: 25, minutesAgo: 67 },
    { userId: createdUsers[5].id, userName: createdUsers[5].name, quantity: 10, minutesAgo: 120 },
  ];

  let ticketNumber = 1;
  let totalTicketsCreated = 0;

  // Create recent purchases with tickets and transactions
  console.log('Creating recent purchases...');
  for (const purchase of recentPurchases) {
    const purchaseDate = new Date(Date.now() - purchase.minutesAgo * 60 * 1000);
    const totalAmount = purchase.quantity * activeRaffle.ticketPrice;

    // Create tickets for this purchase
    const tickets = [];
    for (let i = 0; i < purchase.quantity; i++) {
      const ticket = await prisma.ticket.create({
        data: {
          raffleId: activeRaffle.id,
          userId: purchase.userId,
          ticketNumber: ticketNumber++,
          purchaseAmount: activeRaffle.ticketPrice,
          purchaseDate,
          isWinner: false,
        },
      });
      tickets.push(ticket);
      totalTicketsCreated++;
    }

    // Create transaction
    await prisma.purchaseTransaction.create({
      data: {
        userId: purchase.userId,
        raffleId: activeRaffle.id,
        ticketIds: tickets.map((t) => t.id),
        quantity: purchase.quantity,
        totalAmount,
        transactionDate: purchaseDate,
        status: 'COMPLETED',
        paymentMethod: 'yape',
      },
    });
  }

  console.log(`✅ Created ${recentPurchases.length} recent transactions`);

  // Create older tickets to reach 490 total
  const remainingTickets = 490 - totalTicketsCreated;
  console.log(`Creating ${remainingTickets} older tickets...`);

  const olderUsers = [createdUsers[0], createdUsers[1], createdUsers[2]];
  const olderTicketsData = [];

  for (let i = 0; i < remainingTickets; i++) {
    const randomUser = olderUsers[i % olderUsers.length];
    olderTicketsData.push({
      raffleId: activeRaffle.id,
      userId: randomUser.id,
      ticketNumber: ticketNumber++,
      purchaseAmount: activeRaffle.ticketPrice,
      purchaseDate: new Date(Date.now() - (i + 200) * 60 * 1000),
      isWinner: false,
    });
  }

  // Bulk insert older tickets
  await prisma.ticket.createMany({
    data: olderTicketsData,
  });

  console.log(`✅ Created ${remainingTickets} older tickets`);

  console.log('\n🎉 Database seed completed successfully!');
  console.log(`   - Users: ${createdUsers.length}`);
  console.log(`   - Active Raffles: 1`);
  console.log(`   - Tickets: 490`);
  console.log(`   - Transactions: ${recentPurchases.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
