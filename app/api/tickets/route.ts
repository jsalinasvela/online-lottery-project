import { NextRequest, NextResponse } from 'next/server';
import {
  getRaffleById,
  updateRaffle,
  createTicket,
  createTransaction,
  getTicketsByUserId,
  getTicketCount,
  getUserById,
  generateId,
  addActivity,
} from '@/lib/data/store';
import '@/lib/data/seed'; // Initialize data
import { Ticket, PurchaseTransaction } from '@/types/lottery';
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
    const raffle = getRaffleById(raffleId);
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
      const currentTicketCount = getTicketCount(raffleId);
      if (currentTicketCount + quantity > raffle.maxTickets) {
        return NextResponse.json(
          { error: `Not enough tickets available. Only ${raffle.maxTickets - currentTicketCount} tickets remaining.` },
          { status: 400 }
        );
      }
    }

    // Get user (for activity feed name)
    const user = getUserById(userId);
    const userName = user ? user.name : 'Anonymous';

    // Calculate totals
    const totalAmount = raffle.ticketPrice * quantity;
    const purchaseDate = new Date();

    // Create tickets
    const ticketIds: string[] = [];
    const tickets: Ticket[] = [];
    const currentTicketCount = getTicketCount(raffleId);

    for (let i = 0; i < quantity; i++) {
      const ticket: Ticket = {
        id: generateId(),
        raffleId,
        userId,
        ticketNumber: currentTicketCount + i + 1,
        purchaseAmount: raffle.ticketPrice,
        purchaseDate,
        isWinner: false,
      };
      createTicket(ticket);
      tickets.push(ticket);
      ticketIds.push(ticket.id);
    }

    // Create transaction
    const transaction: PurchaseTransaction = {
      id: generateId(),
      userId,
      raffleId,
      ticketIds,
      quantity,
      totalAmount,
      transactionDate: purchaseDate,
      status: 'completed',
    };
    createTransaction(transaction);

    // Update raffle amounts
    updateRaffle(raffleId, {
      currentAmount: raffle.currentAmount + totalAmount,
      ticketsSold: raffle.ticketsSold + quantity,
    });

    // Add to activity feed
    addActivity({
      id: transaction.id,
      userId,
      userName,
      quantity,
      totalAmount,
      purchaseDate,
      raffleId,
    });

    return NextResponse.json(
      { tickets, transaction, success: true },
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

    const tickets = getTicketsByUserId(userId, raffleId);

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
