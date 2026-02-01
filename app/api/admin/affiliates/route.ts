import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/auth/middleware';
import {
  getAllAffiliates,
  createAffiliate,
  getAffiliateByCode,
} from '@/lib/data/store';

// GET /api/admin/affiliates - List all affiliates
export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (isErrorResponse(session)) {
    return session;
  }

  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const affiliates = await getAllAffiliates(includeInactive);

    return NextResponse.json({
      affiliates,
      count: affiliates.length,
    });
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliates' },
      { status: 500 }
    );
  }
}

// POST /api/admin/affiliates - Create new affiliate
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (isErrorResponse(session)) {
    return session;
  }

  try {
    const body = await request.json();
    const { code, name, email, commissionRate } = body;

    // Validation
    if (!code || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, email' },
        { status: 400 }
      );
    }

    // Validate code format (alphanumeric, no spaces)
    if (!/^[A-Za-z0-9_-]+$/.test(code)) {
      return NextResponse.json(
        { error: 'Code must be alphanumeric (letters, numbers, underscores, hyphens only)' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await getAffiliateByCode(code);
    if (existing) {
      return NextResponse.json(
        { error: 'An affiliate with this code already exists' },
        { status: 409 }
      );
    }

    // Validate commission rate if provided
    const rate = commissionRate !== undefined ? parseFloat(commissionRate) : 0.05;
    if (isNaN(rate) || rate < 0 || rate > 1) {
      return NextResponse.json(
        { error: 'Commission rate must be between 0 and 1 (e.g., 0.05 for 5%)' },
        { status: 400 }
      );
    }

    const affiliate = await createAffiliate({
      code: code.toUpperCase(),
      name,
      email,
      commissionRate: rate,
      active: true,
    });

    return NextResponse.json(
      { affiliate, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to create affiliate' },
      { status: 500 }
    );
  }
}
