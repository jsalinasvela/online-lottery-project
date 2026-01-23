import { NextResponse } from 'next/server';

// GET /api/raffles/[id] - Fetch specific raffle
export async function GET() {
  // TODO: Implement
  return NextResponse.json({ message: 'GET raffle by ID - TODO' });
}

// PATCH /api/raffles/[id] - Update raffle (admin)
export async function PATCH() {
  // TODO: Implement
  return NextResponse.json({ message: 'PATCH raffle - TODO' });
}

// DELETE /api/raffles/[id] - Cancel raffle (admin)
export async function DELETE() {
  // TODO: Implement
  return NextResponse.json({ message: 'DELETE raffle - TODO' });
}
