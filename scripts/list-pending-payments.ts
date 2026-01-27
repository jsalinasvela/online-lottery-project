#!/usr/bin/env tsx

/**
 * Script to list pending payment transactions
 * Usage: npx tsx scripts/list-pending-payments.ts [status]
 *
 * Examples:
 *   npx tsx scripts/list-pending-payments.ts
 *   npx tsx scripts/list-pending-payments.ts PENDING_PAYMENT
 *   npx tsx scripts/list-pending-payments.ts PENDING_REVIEW
 *   npx tsx scripts/list-pending-payments.ts all
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const statusFilter = process.argv[2]?.toUpperCase();

  console.log('💳 Payment Transactions\n');

  // Build where clause
  const where: any = {};
  if (statusFilter && statusFilter !== 'ALL') {
    where.status = statusFilter;
  }

  const transactions = await prisma.purchaseTransaction.findMany({
    where,
    include: {
      user: true,
      raffle: true,
    },
    orderBy: { transactionDate: 'desc' },
    take: 20,
  });

  if (transactions.length === 0) {
    console.log('No transactions found.');
    return;
  }

  console.log(`Found ${transactions.length} transaction(s)\n`);
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  for (const tx of transactions) {
    const statusEmoji = {
      PENDING_PAYMENT: '⏳',
      PENDING_REVIEW: '👀',
      COMPLETED: '✅',
      REJECTED: '❌',
      FAILED: '💥',
    }[tx.status] || '❓';

    console.log(`${statusEmoji} Transaction: ${tx.id}`);
    console.log(`   Reference: ${tx.id.slice(-8).toUpperCase()}`);
    console.log(`   Status: ${tx.status}`);
    console.log(`   User: ${tx.user.name} (${tx.user.email})`);
    console.log(`   Raffle: ${tx.raffle.title}`);
    console.log(`   Quantity: ${tx.quantity} tickets`);
    console.log(`   Amount: S/ ${tx.totalAmount.toFixed(2)}`);
    console.log(`   Date: ${tx.transactionDate.toLocaleString()}`);

    if (tx.reviewedAt) {
      console.log(`   Reviewed: ${tx.reviewedAt.toLocaleString()}`);
      console.log(`   Reviewer: ${tx.reviewedBy}`);
      if (tx.adminNotes) {
        console.log(`   Notes: ${tx.adminNotes}`);
      }
    }

    if (tx.ticketIds.length > 0) {
      console.log(`   Tickets: ${tx.ticketIds.length} created`);
    }

    // Show test commands for pending transactions
    if (tx.status === 'PENDING_PAYMENT' || tx.status === 'PENDING_REVIEW') {
      console.log('\n   Test Commands:');
      console.log(`   Approve: curl -X PATCH http://localhost:3000/api/admin/payments/${tx.id} -H "Content-Type: application/json" -b cookies.txt -d '{"action":"approve"}'`);
      console.log(`   Reject:  curl -X PATCH http://localhost:3000/api/admin/payments/${tx.id} -H "Content-Type: application/json" -b cookies.txt -d '{"action":"reject"}'`);
    }

    console.log('\n───────────────────────────────────────────────────────────────────────────\n');
  }

  // Summary statistics
  const stats = await prisma.purchaseTransaction.groupBy({
    by: ['status'],
    _count: true,
    _sum: {
      totalAmount: true,
    },
  });

  console.log('📊 Summary Statistics:\n');
  for (const stat of stats) {
    console.log(`   ${stat.status}: ${stat._count} transactions, S/ ${stat._sum.totalAmount?.toFixed(2) || '0.00'} total`);
  }
  console.log();
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
