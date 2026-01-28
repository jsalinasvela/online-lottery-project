import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

interface RouteParams {
  params: Promise<{
    transactionId: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // Require admin authentication
  const session = await requireAdmin();
  if (isErrorResponse(session)) {
    return session;
  }

  const { transactionId } = await params;
  const body = await request.json();
  const { action, notes } = body as { action: 'approve' | 'reject'; notes?: string };

  // Validate action
  if (!action || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json(
      { error: 'Invalid action. Must be "approve" or "reject".' },
      { status: 400 }
    );
  }

  try {
    // Get transaction with raffle details
    const transaction = await prisma.purchaseTransaction.findUnique({
      where: { id: transactionId },
      include: { raffle: true, user: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if transaction is already processed
    if (transaction.status === 'COMPLETED' || transaction.status === 'REJECTED') {
      return NextResponse.json(
        { error: `Transaction already ${transaction.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Get current ticket count for raffle to determine starting ticket number
      const currentTicketCount = await prisma.ticket.count({
        where: { raffleId: transaction.raffleId },
      });

      // Create tickets atomically using transaction
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Create tickets
        const tickets = await Promise.all(
          Array.from({ length: transaction.quantity }).map((_, i) =>
            tx.ticket.create({
              data: {
                raffleId: transaction.raffleId,
                userId: transaction.userId,
                ticketNumber: currentTicketCount + i + 1,
                purchaseAmount: transaction.raffle.ticketPrice,
                isWinner: false,
              },
            })
          )
        );

        // Update transaction with ticket IDs and mark as completed
        const updatedTransaction = await tx.purchaseTransaction.update({
          where: { id: transactionId },
          data: {
            status: 'COMPLETED',
            ticketIds: tickets.map((t) => t.id),
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
            adminNotes: notes || null,
          },
        });

        // Increment raffle ticketsSold and currentAmount
        await tx.raffle.update({
          where: { id: transaction.raffleId },
          data: {
            ticketsSold: { increment: transaction.quantity },
            currentAmount: { increment: transaction.totalAmount },
          },
        });

        return { tickets, transaction: updatedTransaction };
      });

      return NextResponse.json({
        success: true,
        message: 'Payment approved and tickets created',
        ticketCount: result.tickets.length,
      });
    } else if (action === 'reject') {
      // Reject payment - no need to revert currentAmount since it was never incremented
      await prisma.purchaseTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          adminNotes: notes || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment rejected',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing payment review:', error);
    return NextResponse.json(
      { error: 'Failed to process payment review' },
      { status: 500 }
    );
  }
}
