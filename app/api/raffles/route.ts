import { NextRequest, NextResponse } from 'next/server';
import { getActiveRaffle, getAllRaffles, getRafflesByStatus, getMostRecentCompletedRaffle, createRaffle, generateId, updateRaffle } from '@/lib/data/store';
import '@/lib/data/seed'; // Initialize data
import { Raffle } from '@/types/lottery';

// GET /api/raffles - Fetch all raffles or active raffle
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    if (status === 'active') {
      // Fetch active raffle only
      const activeRaffle = getActiveRaffle();
      return NextResponse.json({ raffle: activeRaffle || null });
    } else if (status === 'recent-completed') {
      // Fetch most recent completed raffle with winner
      const recentCompleted = getMostRecentCompletedRaffle();
      return NextResponse.json({ raffle: recentCompleted || null });
    } else if (status) {
      // Fetch raffles by specific status
      const raffles = getRafflesByStatus(status);
      return NextResponse.json({ raffles });
    } else {
      // Fetch all raffles
      const raffles = getAllRaffles();
      return NextResponse.json({ raffles });
    }
  } catch (error) {
    console.error('Error fetching raffles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch raffles' },
      { status: 500 }
    );
  }
}

// POST /api/raffles - Create new raffle (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, ticketPrice, goalAmount, maxTickets, endDate } = body;

    // Validation
    if (!title || !ticketPrice || !goalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: title, ticketPrice, goalAmount' },
        { status: 400 }
      );
    }

    if (ticketPrice <= 0 || goalAmount <= 0) {
      return NextResponse.json(
        { error: 'ticketPrice and goalAmount must be positive' },
        { status: 400 }
      );
    }

    // Check if there's an existing active raffle
    const existingActiveRaffle = getActiveRaffle();
    if (existingActiveRaffle) {
      // Mark existing active raffle as cancelled
      updateRaffle(existingActiveRaffle.id, { status: 'cancelled' });
      console.log(`Cancelled previous active raffle: ${existingActiveRaffle.id}`);
    }

    // Create new raffle
    const newRaffle: Raffle = {
      id: generateId(),
      title,
      description: description || '',
      ticketPrice,
      goalAmount,
      currentAmount: 0,
      ticketsSold: 0,
      maxTickets: maxTickets || undefined,
      startDate: new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const raffle = createRaffle(newRaffle);

    return NextResponse.json({ raffle, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating raffle:', error);
    return NextResponse.json(
      { error: 'Failed to create raffle' },
      { status: 500 }
    );
  }
}
