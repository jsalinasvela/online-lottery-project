import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/auth/middleware';
import {
  getAffiliateById,
  updateAffiliate,
  deleteAffiliate,
  getAffiliateByCode,
} from '@/lib/data/store';

// GET /api/admin/affiliates/[id] - Get single affiliate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (isErrorResponse(session)) {
    return session;
  }

  try {
    const { id } = await params;
    const affiliate = await getAffiliateById(id);

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ affiliate });
  } catch (error) {
    console.error('Error fetching affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/affiliates/[id] - Update affiliate
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (isErrorResponse(session)) {
    return session;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { code, name, email, commissionRate, active } = body;

    // Check affiliate exists
    const existing = await getAffiliateById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // If changing code, check it's not already taken
    if (code && code !== existing.code) {
      const codeExists = await getAffiliateByCode(code);
      if (codeExists) {
        return NextResponse.json(
          { error: 'An affiliate with this code already exists' },
          { status: 409 }
        );
      }
    }

    // Validate commission rate if provided
    if (commissionRate !== undefined) {
      const rate = parseFloat(commissionRate);
      if (isNaN(rate) || rate < 0 || rate > 1) {
        return NextResponse.json(
          { error: 'Commission rate must be between 0 and 1 (e.g., 0.05 for 5%)' },
          { status: 400 }
        );
      }
    }

    const updates: Record<string, unknown> = {};
    if (code !== undefined) updates.code = code.toUpperCase();
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (commissionRate !== undefined) updates.commissionRate = parseFloat(commissionRate);
    if (active !== undefined) updates.active = active;

    const affiliate = await updateAffiliate(id, updates);

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Failed to update affiliate' },
        { status: 500 }
      );
    }

    return NextResponse.json({ affiliate, success: true });
  } catch (error) {
    console.error('Error updating affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to update affiliate' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/affiliates/[id] - Soft delete affiliate
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (isErrorResponse(session)) {
    return session;
  }

  try {
    const { id } = await params;

    // Check affiliate exists
    const existing = await getAffiliateById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    const success = await deleteAffiliate(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete affiliate' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to delete affiliate' },
      { status: 500 }
    );
  }
}
