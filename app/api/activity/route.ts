import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivities } from '@/lib/data/store';
import '@/lib/data/seed'; // Initialize data

// GET /api/activity - Fetch recent activity for a raffle
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const raffleId = searchParams.get('raffleId');
    const limitParam = searchParams.get('limit');

    if (!raffleId) {
      return NextResponse.json(
        { error: 'Missing required parameter: raffleId' },
        { status: 400 }
      );
    }

    const limit = limitParam ? parseInt(limitParam) : 20;
    const activities = getRecentActivities(raffleId, limit);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
