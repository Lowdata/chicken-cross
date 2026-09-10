import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { validateReferralCode } from '@/lib/services/referralService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const codeParam = req.nextUrl.searchParams.get('code') || '';
    const addressParam = req.nextUrl.searchParams.get('address');

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ valid: false, error: 'Database unavailable' }, { status: 503 });
    }

    const result = await validateReferralCode(codeParam, addressParam, db);
    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      valid: true,
      referralCode: result.referralCode,
    });
  } catch (err) {
    console.error('GET /api/referral/validate error:', err);
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 });
  }
}
