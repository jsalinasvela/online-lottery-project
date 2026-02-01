import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/auth/middleware';
import { getAffiliateEarnings } from '@/lib/data/store';

// GET /api/admin/affiliates/earnings - Get affiliate earnings
export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (isErrorResponse(session)) {
    return session;
  }

  try {
    const { searchParams } = new URL(request.url);
    const raffleId = searchParams.get('raffleId') || undefined;

    const earnings = await getAffiliateEarnings(raffleId);

    // Calculate totals
    const totalSales = earnings.reduce((sum, e) => sum + e.totalSales, 0);
    const totalCommission = earnings.reduce((sum, e) => sum + e.commission, 0);

    return NextResponse.json({
      earnings,
      summary: {
        totalSales,
        totalCommission,
        affiliateCount: new Set(earnings.map(e => e.affiliateId)).size,
        raffleCount: new Set(earnings.map(e => e.raffleId)).size,
      },
    });
  } catch (error) {
    console.error('Error fetching affiliate earnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate earnings' },
      { status: 500 }
    );
  }
}
