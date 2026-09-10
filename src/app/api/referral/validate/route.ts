import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

// High-performance short-lived cache (60s) to absorb heavy load / viral referral spikes
const codeCache = new Map<string, { walletAddress: string; expiresAt: number }>();

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const codeParam = req.nextUrl.searchParams.get('code');
    const addressParam = req.nextUrl.searchParams.get('address');

    if (!codeParam || !codeParam.trim()) {
      return NextResponse.json({ valid: false, error: 'Referral code is required' }, { status: 400 });
    }

    const code = codeParam.trim().toUpperCase();
    const userWallet = addressParam ? addressParam.trim().toLowerCase() : null;

    // Fast-path format validation: alphanumeric between 4 and 16 characters
    if (!/^[A-Z0-9_-]{4,16}$/.test(code)) {
      return NextResponse.json(
        { valid: false, error: 'Invalid referral code format' },
        { status: 400 }
      );
    }

    // Check memory cache first
    const now = Date.now();
    const cached = codeCache.get(code);
    let referrerWallet: string | null = null;

    if (cached && cached.expiresAt > now) {
      referrerWallet = cached.walletAddress;
    } else {
      const db = await getDb();
      if (!db) {
        return NextResponse.json({ valid: false, error: 'Database unavailable' }, { status: 503 });
      }

      // Covered index query: only project walletAddress & referralCode
      const referrer = await db.collection('users').findOne(
        { referralCode: code },
        { projection: { _id: 0, walletAddress: 1, referralCode: 1 } }
      );

      if (!referrer || !referrer.walletAddress) {
        return NextResponse.json(
          { valid: false, error: 'Referral code does not exist' },
          { status: 404 }
        );
      }

      const wallet = String(referrer.walletAddress);
      referrerWallet = wallet;
      // Cache valid code for 60 seconds (purge oldest if cache grows > 10,000 entries)
      if (codeCache.size > 10000) {
        const firstKey = codeCache.keys().next().value;
        if (firstKey) codeCache.delete(firstKey);
      }
      codeCache.set(code, { walletAddress: wallet, expiresAt: now + 60_000 });
    }

    // Check self-referral
    if (userWallet && referrerWallet && referrerWallet.toLowerCase() === userWallet) {
      return NextResponse.json(
        { valid: false, error: 'You cannot use your own referral code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      referralCode: code,
    });
  } catch (err) {
    console.error('GET /api/referral/validate error:', err);
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 });
  }
}
