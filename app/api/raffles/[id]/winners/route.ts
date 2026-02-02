import { NextRequest, NextResponse } from 'next/server';
import { getWinnersByRaffleId, getUserById } from '@/lib/data/store';

// GET /api/raffles/[id]/winners - Get all winners for a raffle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: raffleId } = await params;

    const winners = await getWinnersByRaffleId(raffleId);

    // Enrich winners with user info
    const enrichedWinners = await Promise.all(
      winners.map(async (winner) => {
        const user = await getUserById(winner.userId);
        return {
          ...winner,
          userName: user?.name || 'Anonymous',
        };
      })
    );

    return NextResponse.json({ winners: enrichedWinners });
  } catch (error) {
    console.error('Error fetching winners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winners' },
      { status: 500 }
    );
  }
}
