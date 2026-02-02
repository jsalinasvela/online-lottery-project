import { NextRequest, NextResponse } from 'next/server';
import {
  getRaffleById,
  updateRaffle,
  getTicketsByRaffleId,
  updateTicket,
  createWinner,
  getUserById,
} from '@/lib/data/store';
import { requireAdmin, isErrorResponse } from '@/lib/auth/middleware';
import { Ticket, Winner } from '@/types/lottery';

// POST /api/execute-raffle - Execute raffle and select winner(s)
export async function POST(request: NextRequest) {
  // Require admin authentication
  const sessionOrError = await requireAdmin();
  if (isErrorResponse(sessionOrError)) return sessionOrError;

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

    // Get winner count (default 1 for backwards compatibility)
    const winnerCount = raffle.winnerCount ?? 1;

    // Validate enough tickets sold for the number of winners
    if (tickets.length === 0) {
      return NextResponse.json(
        { error: 'Cannot execute raffle with no tickets sold' },
        { status: 400 }
      );
    }

    if (tickets.length < winnerCount) {
      return NextResponse.json(
        { error: `Not enough tickets sold. Need at least ${winnerCount} tickets to select ${winnerCount} winner(s), but only ${tickets.length} sold.` },
        { status: 400 }
      );
    }

    // Calculate prize/platform split
    const prizePercentage = raffle.prizePercentage ?? 0.70;
    const totalPrizeAmount = raffle.currentAmount * prizePercentage;
    const platformAmount = raffle.currentAmount * (1 - prizePercentage);
    const prizePerWinner = totalPrizeAmount / winnerCount;

    // Winner Selection Algorithm - Select N unique winning tickets
    const selectedTickets: Ticket[] = [];
    const availableTickets = [...tickets];

    for (let i = 0; i < winnerCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableTickets.length);
      const winningTicket = availableTickets.splice(randomIndex, 1)[0];
      selectedTickets.push(winningTicket);
    }

    // Process each winner
    const executedAt = new Date();
    const winners: Winner[] = [];
    const winnerUsers: { id: string; name: string; email: string; position: number }[] = [];

    for (let i = 0; i < selectedTickets.length; i++) {
      const winningTicket = selectedTickets[i];
      const position = i + 1;

      // Mark ticket as winner
      await updateTicket(winningTicket.id, { isWinner: true });

      // Get winner user info
      const winnerUser = await getUserById(winningTicket.userId);

      // Create winner record
      const winnerData = {
        raffleId,
        userId: winningTicket.userId,
        ticketId: winningTicket.id,
        prizeAmount: prizePerWinner,
        announcedAt: executedAt,
        position,
      };
      const winner = await createWinner(winnerData);
      winners.push(winner);

      if (winnerUser) {
        winnerUsers.push({
          id: winnerUser.id,
          name: winnerUser.name,
          email: winnerUser.email,
          position,
        });
      }
    }

    // Update raffle status (store first winner's info for backwards compatibility)
    const firstWinningTicket = selectedTickets[0];
    const firstWinnerUser = winnerUsers.find(u => u.position === 1);
    await updateRaffle(raffleId, {
      status: 'completed',
      winnerId: firstWinningTicket.userId,
      winningTicketId: firstWinningTicket.id,
      winningTicketNumber: firstWinningTicket.ticketNumber,
      winnerName: firstWinnerUser?.name || 'Anonymous',
      executedAt,
    });

    // Get updated raffle
    const updatedRaffle = await getRaffleById(raffleId);

    // Build response message
    const winnerNames = winnerUsers.map(u => u.name).join(', ');
    const message = winnerCount === 1
      ? `Winner selected! ${winnerNames} won with ticket #${firstWinningTicket.ticketNumber}!`
      : `${winnerCount} winners selected! ${winnerNames}`;

    return NextResponse.json({
      success: true,
      winners,
      winningTickets: selectedTickets.map(t => ({ ...t, isWinner: true })),
      winnerUsers,
      raffle: updatedRaffle,
      // Prize split info
      prizeSplit: {
        totalPool: raffle.currentAmount,
        prizePercentage,
        totalPrizeAmount,
        prizePerWinner,
        platformAmount,
        winnerCount,
        causeName: raffle.causeName,
      },
      message,
      // Backwards compatibility - single winner fields
      winner: winners[0],
      winningTicket: { ...selectedTickets[0], isWinner: true },
      winnerUser: winnerUsers[0] || null,
    });
  } catch (error) {
    console.error('Error executing raffle:', error);
    return NextResponse.json(
      { error: 'Failed to execute raffle' },
      { status: 500 }
    );
  }
}
