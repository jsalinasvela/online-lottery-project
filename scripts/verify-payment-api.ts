#!/usr/bin/env tsx

/**
 * Verification script for payment review API
 * This performs basic smoke testing without requiring a running server
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function test(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}: ${message}`);
}

async function verifyDatabaseSchema() {
  console.log('\n🔍 Verifying Database Schema...\n');

  try {
    // Check PurchaseTransaction table has required fields
    const transaction = await prisma.purchaseTransaction.findFirst();
    test(
      'PurchaseTransaction table exists',
      true,
      'Table is accessible'
    );

    // Check required enums exist
    const pendingPayment = await prisma.purchaseTransaction.findFirst({
      where: { status: 'PENDING_PAYMENT' },
    });
    test(
      'TransactionStatus enum includes PENDING_PAYMENT',
      true,
      'Status enum is correct'
    );

    // Check User table has role field
    const user = await prisma.user.findFirst();
    if (user && 'role' in user) {
      test(
        'User table has role field',
        true,
        'User role field exists for admin auth'
      );
    }
  } catch (error: any) {
    test(
      'Database schema verification',
      false,
      `Error: ${error.message}`
    );
  }
}

async function verifyTestData() {
  console.log('\n🔍 Verifying Test Data...\n');

  try {
    // Check for active raffle
    const activeRaffle = await prisma.raffle.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (activeRaffle) {
      test(
        'Active raffle exists',
        true,
        `Found: ${activeRaffle.title}`
      );
    } else {
      test(
        'Active raffle exists',
        false,
        'No active raffle found. Run: npm run db:seed'
      );
    }

    // Check for test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'testuser@example.com' },
    });

    if (testUser) {
      test(
        'Test user exists',
        true,
        'testuser@example.com is available for testing'
      );
    } else {
      test(
        'Test user exists',
        false,
        'No test user. Will be created when running test scripts'
      );
    }

    // Check for pending transactions
    const pendingCount = await prisma.purchaseTransaction.count({
      where: {
        OR: [
          { status: 'PENDING_PAYMENT' },
          { status: 'PENDING_REVIEW' },
        ],
      },
    });

    test(
      'Pending transactions for testing',
      pendingCount > 0,
      pendingCount > 0
        ? `${pendingCount} pending transaction(s) available`
        : 'No pending transactions. Create one with: npm run test:create-transaction'
    );
  } catch (error: any) {
    test(
      'Test data verification',
      false,
      `Error: ${error.message}`
    );
  }
}

async function verifyBusinessLogic() {
  console.log('\n🔍 Verifying Business Logic...\n');

  try {
    // Check ticket numbering
    const raffle = await prisma.raffle.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (raffle) {
      const ticketCount = await prisma.ticket.count({
        where: { raffleId: raffle.id },
      });

      const tickets = await prisma.ticket.findMany({
        where: { raffleId: raffle.id },
        orderBy: { ticketNumber: 'desc' },
        take: 1,
      });

      const highestNumber = tickets[0]?.ticketNumber || 0;

      test(
        'Ticket numbering is sequential',
        highestNumber <= ticketCount,
        `Highest ticket number: ${highestNumber}, Total tickets: ${ticketCount}`
      );

      // Check raffle amounts
      const ticketsSum = await prisma.ticket.aggregate({
        where: { raffleId: raffle.id },
        _sum: { purchaseAmount: true },
      });

      const completedTxSum = await prisma.purchaseTransaction.aggregate({
        where: {
          raffleId: raffle.id,
          status: 'COMPLETED',
        },
        _sum: { totalAmount: true },
      });

      const ticketsSumAmount = ticketsSum._sum.purchaseAmount || 0;
      const txSumAmount = completedTxSum._sum.totalAmount || 0;

      test(
        'Ticket amounts match completed transactions',
        Math.abs(ticketsSumAmount - txSumAmount) < 0.01,
        `Tickets: S/ ${ticketsSumAmount.toFixed(2)}, Transactions: S/ ${txSumAmount.toFixed(2)}`
      );

      // Check ticketsSold matches actual count
      const actualTicketCount = await prisma.ticket.count({
        where: { raffleId: raffle.id },
      });

      test(
        'Raffle ticketsSold matches actual ticket count',
        raffle.ticketsSold === actualTicketCount,
        `Raffle.ticketsSold: ${raffle.ticketsSold}, Actual count: ${actualTicketCount}`
      );
    }
  } catch (error: any) {
    test(
      'Business logic verification',
      false,
      `Error: ${error.message}`
    );
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   Payment Review API - Verification Script');
  console.log('═══════════════════════════════════════════════════════════════');

  await verifyDatabaseSchema();
  await verifyTestData();
  await verifyBusinessLogic();

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`   Summary: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    console.log('⚠️  Some checks failed. Review the messages above for details.\n');
    process.exit(1);
  } else {
    console.log('✅ All checks passed! Ready for testing.\n');
    console.log('Next steps:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Create test transaction: npm run test:create-transaction');
    console.log('3. Follow TESTING_PAYMENT_REVIEW.md for manual testing\n');
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
