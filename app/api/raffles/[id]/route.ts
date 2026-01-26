import { NextRequest, NextResponse } from 'next/server';
import { getRaffleById, updateRaffle, getWinnerByRaffleId } from '@/lib/data/store';
import { requireAdmin, isErrorResponse } from '@/lib/auth/middleware';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/raffles/[id] - Fetch specific raffle
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const raffle = await getRaffleById(id);

    if (!raffle) {
      return NextResponse.json(
        { error: 'Raffle not found' },
        { status: 404 }
      );
    }

    // Include winner info if raffle is completed
    let winner = null;
    if (raffle.status === 'completed') {
      winner = await getWinnerByRaffleId(id);
    }

    return NextResponse.json({ raffle, winner });
  } catch (error) {
    console.error('Error fetching raffle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch raffle' },
      { status: 500 }
    );
  }
}

// PATCH /api/raffles/[id] - Update raffle (admin)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  // Require admin authentication
  const sessionOrError = await requireAdmin();
  if (isErrorResponse(sessionOrError)) return sessionOrError;

  try {
    const { id } = await params;
    const raffle = await getRaffleById(id);

    if (!raffle) {
      return NextResponse.json(
        { error: 'Raffle not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, endDate, status } = body;

    // Validation: cannot change critical fields if tickets have been sold
    if (raffle.ticketsSold > 0 && (body.ticketPrice || body.goalAmount)) {
      return NextResponse.json(
        { error: 'Cannot change ticketPrice or goalAmount after tickets are sold' },
        { status: 400 }
      );
    }

    // Update raffle
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (endDate !== undefined) updates.endDate = new Date(endDate);
    if (status !== undefined) updates.status = status;

    const updatedRaffle = await updateRaffle(id, updates);

    return NextResponse.json({ raffle: updatedRaffle, success: true });
  } catch (error) {
    console.error('Error updating raffle:', error);
    return NextResponse.json(
      { error: 'Failed to update raffle' },
      { status: 500 }
    );
  }
}

// DELETE /api/raffles/[id] - Cancel raffle (admin)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  // Require admin authentication
  const sessionOrError = await requireAdmin();
  if (isErrorResponse(sessionOrError)) return sessionOrError;

  try {
    const { id } = await params;
    const raffle = await getRaffleById(id);

    if (!raffle) {
      return NextResponse.json(
        { error: 'Raffle not found' },
        { status: 404 }
      );
    }

    // Cannot delete completed raffles
    if (raffle.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot delete completed raffle' },
        { status: 400 }
      );
    }

    // In a real app, you would refund all tickets here
    // For now, just mark as cancelled
    await updateRaffle(id, { status: 'cancelled' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting raffle:', error);
    return NextResponse.json(
      { error: 'Failed to delete raffle' },
      { status: 500 }
    );
  }
}
