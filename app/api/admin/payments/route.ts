import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  // Require admin authentication
  const session = await requireAdmin();
  if (isErrorResponse(session)) {
    return session;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};

    // Filter by status if provided
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    } else {
      // Default: show pending payments (PENDING_PAYMENT and PENDING_REVIEW)
      where.status = {
        in: ['PENDING_PAYMENT', 'PENDING_REVIEW'],
      };
    }

    // Fetch transactions with user and raffle details
    const transactions = await prisma.purchaseTransaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        raffle: {
          select: {
            id: true,
            title: true,
            ticketPrice: true,
          },
        },
      },
      orderBy: { transactionDate: 'desc' },
      take: 50, // Limit to 50 most recent
    });

    // Convert to frontend-friendly format
    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      referenceCode: tx.id.slice(-8).toUpperCase(),
      userId: tx.userId,
      userName: tx.user.name,
      userEmail: tx.user.email,
      raffleId: tx.raffleId,
      raffleTitle: tx.raffle.title,
      quantity: tx.quantity,
      totalAmount: tx.totalAmount,
      status: tx.status.toLowerCase(),
      transactionDate: tx.transactionDate.toISOString(),
      paymentMethod: tx.paymentMethod,
      paymentProofUrl: tx.paymentProofUrl,
      adminNotes: tx.adminNotes,
      reviewedAt: tx.reviewedAt?.toISOString(),
      reviewedBy: tx.reviewedBy,
      ticketIds: tx.ticketIds,
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      count: formattedTransactions.length,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
