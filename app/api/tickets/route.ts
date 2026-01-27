import { NextRequest, NextResponse } from 'next/server';
import {
  getRaffleById,
  updateRaffle,
  createTransaction,
  getTicketsByUserId,
  getTicketCount,
} from '@/lib/data/store';
import { isValidQuantity } from '@/lib/utils/validation';

// POST /api/tickets - Purchase tickets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raffleId, userId, quantity } = body;

    // Validation
    if (!raffleId || !userId || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: raffleId, userId, quantity' },
        { status: 400 }
      );
    }

    if (!isValidQuantity(quantity)) {
      return NextResponse.json(
        { error: 'Invalid quantity. Must be a positive integer.' },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 25) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 25' },
        { status: 400 }
      );
    }

    // Get raffle
    const raffle = await getRaffleById(raffleId);
    if (!raffle) {
      return NextResponse.json(
        { error: 'Raffle not found' },
        { status: 404 }
      );
    }

    // Check raffle is active
    if (raffle.status !== 'active') {
      return NextResponse.json(
        { error: 'Raffle is not active' },
        { status: 400 }
      );
    }

    // Check max tickets limit
    if (raffle.maxTickets) {
      const currentTicketCount = await getTicketCount(raffleId);
      if (currentTicketCount + quantity > raffle.maxTickets) {
        return NextResponse.json(
          { error: `Not enough tickets available. Only ${raffle.maxTickets - currentTicketCount} tickets remaining.` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const totalAmount = raffle.ticketPrice * quantity;
    const purchaseDate = new Date();

    // Create PENDING_PAYMENT transaction (no tickets yet)
    // Tickets will be created after admin approves payment
    const transactionData = {
      userId,
      raffleId,
      ticketIds: [], // Empty until admin approves
      quantity,
      totalAmount,
      transactionDate: purchaseDate,
      status: 'pending_payment' as const,
    };
    const transaction = await createTransaction(transactionData);

    // Optimistically update raffle currentAmount for glass visualization
    // Note: ticketsSold is NOT incremented yet - only after admin approval
    await updateRaffle(raffleId, {
      currentAmount: raffle.currentAmount + totalAmount,
    });

    return NextResponse.json(
      {
        transaction,
        success: true,
        message: 'Complete payment via Yape to confirm your purchase'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error purchasing tickets:', error);
    return NextResponse.json(
      { error: 'Failed to purchase tickets' },
      { status: 500 }
    );
  }
}

// GET /api/tickets - Fetch user's tickets
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const raffleId = searchParams.get('raffleId');
    const userId = searchParams.get('userId');

    if (!raffleId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: raffleId, userId' },
        { status: 400 }
      );
    }

    const tickets = await getTicketsByUserId(userId, raffleId);

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
