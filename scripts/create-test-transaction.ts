#!/usr/bin/env tsx

/**
 * Script to create test transactions for payment review testing
 * Usage: npx tsx scripts/create-test-transaction.ts [quantity]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const quantity = parseInt(process.argv[2]) || 5;

  console.log('🎫 Creating test transaction...\n');

  // Get active raffle
  const activeRaffle = await prisma.raffle.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  if (!activeRaffle) {
    console.error('❌ No active raffle found. Please create one first.');
    process.exit(1);
  }

  console.log(`📊 Active Raffle: ${activeRaffle.title}`);
  console.log(`💰 Ticket Price: S/ ${activeRaffle.ticketPrice}`);

  // Get or create test user
  let testUser = await prisma.user.findUnique({
    where: { email: 'testuser@example.com' },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'testuser@example.com',
        name: 'Test User',
        walletBalance: 0,
      },
    });
    console.log('👤 Created test user: testuser@example.com');
  } else {
    console.log('👤 Using existing test user: testuser@example.com');
  }

  // Check availability
  if (activeRaffle.maxTickets) {
    const remaining = activeRaffle.maxTickets - activeRaffle.ticketsSold;
    if (quantity > remaining) {
      console.error(`❌ Not enough tickets available. Remaining: ${remaining}, Requested: ${quantity}`);
      process.exit(1);
    }
  }

  const totalAmount = activeRaffle.ticketPrice * quantity;

  // Create pending transaction
  const transaction = await prisma.purchaseTransaction.create({
    data: {
      userId: testUser.id,
      raffleId: activeRaffle.id,
      quantity,
      totalAmount,
      status: 'PENDING_PAYMENT',
      ticketIds: [], // Empty until approved
      paymentMethod: 'yape',
    },
  });

  // Optimistically update raffle currentAmount (like the real flow)
  await prisma.raffle.update({
    where: { id: activeRaffle.id },
    data: {
      currentAmount: { increment: totalAmount },
    },
  });

  console.log('\n✅ Test transaction created successfully!\n');
  console.log('Transaction Details:');
  console.log('-------------------');
  console.log(`ID: ${transaction.id}`);
  console.log(`Reference Code: ${transaction.id.slice(-8).toUpperCase()}`);
  console.log(`User: ${testUser.name} (${testUser.email})`);
  console.log(`Quantity: ${quantity} tickets`);
  console.log(`Total Amount: S/ ${totalAmount.toFixed(2)}`);
  console.log(`Status: ${transaction.status}`);
  console.log(`Created: ${transaction.transactionDate.toLocaleString()}`);
  console.log('\n📋 Test Commands:');
  console.log('-------------------');
  console.log(`\n# Approve this transaction:`);
  console.log(`curl -X PATCH http://localhost:3000/api/admin/payments/${transaction.id} \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -b cookies.txt \\`);
  console.log(`  -d '{"action": "approve", "notes": "Test approval"}'`);
  console.log(`\n# Reject this transaction:`);
  console.log(`curl -X PATCH http://localhost:3000/api/admin/payments/${transaction.id} \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -b cookies.txt \\`);
  console.log(`  -d '{"action": "reject", "notes": "Test rejection"}'`);
  console.log('\n💡 Tip: Run "npm run db:studio" to view the transaction in Prisma Studio\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
