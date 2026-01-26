import { NextRequest, NextResponse } from 'next/server';
import {
  getRaffleById,
  updateRaffle,
  getTicketsByRaffleId,
  updateTicket,
  createWinner,
  getUserById,
} from '@/lib/data/store';

// POST /api/execute-raffle - Execute raffle and select winner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raffleId } = body;

    // Validation
    if (!raffleId) {
      return NextResponse.json(
        { error: 'Missing required field: raffleId' },
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
        { error: `Raffle is ${raffle.status}, cannot execute` },
        { status: 400 }
      );
    }

    // Get all tickets for this raffle
    const tickets = await getTicketsByRaffleId(raffleId);

    // Validate at least one ticket sold
    if (tickets.length === 0) {
      return NextResponse.json(
        { error: 'Cannot execute raffle with no tickets sold' },
        { status: 400 }
      );
    }

    // Winner Selection Algorithm
    // Generate random number between 1 and total tickets (inclusive)
    const winningNumber = Math.floor(Math.random() * tickets.length) + 1;

    // Find ticket with that sequential number
    const winningTicket = tickets.find((t) => t.ticketNumber === winningNumber);

    if (!winningTicket) {
      return NextResponse.json(
        { error: 'Failed to select winning ticket' },
        { status: 500 }
      );
    }

    // Mark ticket as winner
    await updateTicket(winningTicket.id, { isWinner: true });

    // Get winner user info
    const winnerUser = await getUserById(winningTicket.userId);

    // Update raffle status
    const executedAt = new Date();
    await updateRaffle(raffleId, {
      status: 'completed',
      winnerId: winningTicket.userId,
      winningTicketId: winningTicket.id,
      winningTicketNumber: winningTicket.ticketNumber,
      winnerName: winnerUser?.name || 'Anonymous',
      executedAt,
    });

    // Create winner record (Prisma will generate the ID)
    const winnerData = {
      raffleId,
      userId: winningTicket.userId,
      ticketId: winningTicket.id,
      prizeAmount: raffle.currentAmount,
      announcedAt: executedAt,
    };
    const winner = await createWinner(winnerData);

    // Get updated raffle
    const updatedRaffle = await getRaffleById(raffleId);

    return NextResponse.json({
      success: true,
      winner,
      winningTicket: {
        ...winningTicket,
        isWinner: true,
      },
      winnerUser: winnerUser
        ? { id: winnerUser.id, name: winnerUser.name, email: winnerUser.email }
        : null,
      raffle: updatedRaffle,
      message: `Winner selected! ${winnerUser?.name || 'User'} won with ticket #${winningTicket.ticketNumber}!`,
    });
  } catch (error) {
    console.error('Error executing raffle:', error);
    return NextResponse.json(
      { error: 'Failed to execute raffle' },
      { status: 500 }
    );
  }
}
