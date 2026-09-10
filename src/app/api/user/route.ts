import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { nanoid } from 'nanoid';
import { isAddress, verifyMessage } from 'viem';
import { jwtVerify } from 'jose';
import { validateReferralCode } from '@/lib/services/referralService';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'bunny-hop-session-secret-2024'
);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: 'Valid Ethereum address is required' }, { status: 400 });
  }
  const wallet = address.toLowerCase();

  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const user = await db.collection('users').findOne({ walletAddress: wallet });
    if (!user) {
      return NextResponse.json({ success: true, user: null, exists: false });
    }

    return NextResponse.json({ success: true, user, exists: true });
  } catch (err) {
    console.error('GET /api/user error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, twitterHandle, twitterId, referredBy, signature, message } = body;

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Valid Ethereum address is required' }, { status: 400 });
    }
    const wallet = address.toLowerCase();

    // ── Check signature or active verified session cookie ──
    const sessionCookie = req.cookies.get('pongpong_session')?.value;
    let isVerified = false;

    if (sessionCookie) {
      try {
        const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
        if (payload.wallet === wallet && payload.verified) {
          isVerified = true;
        }
      } catch {}
    }

    if (!isVerified && signature && message) {
      try {
        const validSig = await verifyMessage({
          address: address as `0x${string}`,
          message,
          signature: signature as `0x${string}`,
        });
        if (validSig) {
          isVerified = true;
        }
      } catch {}
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // ── Strict Referral Code Validation (Optimized with shared service) ──
    let validReferralCode: string | null = null;
    let referrerWallet: string | null = null;

    if (referredBy && typeof referredBy === 'string' && referredBy.trim()) {
      const valResult = await validateReferralCode(referredBy, wallet, db);
      if (!valResult.valid) {
        return NextResponse.json({ error: valResult.error }, { status: 400 });
      }
      validReferralCode = valResult.referralCode;
      referrerWallet = valResult.referrerWallet;
    }

    const existing = await db.collection('users').findOne({ walletAddress: wallet });

    if (!existing) {
      const newUser = {
        walletAddress: wallet,
        twitterHandle: twitterHandle ? String(twitterHandle).replace('@', '').trim() : null,
        twitterId: twitterId || null,
        lives: 5,
        carrots: 0,
        rewards: [],
        completedTasks: [],
        referralCode: nanoid(8).toUpperCase(),
        referredBy: validReferralCode,
        referralCount: 0,
        ipHistory: [],
        isBanned: false,
        isWalletVerified: isVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection('users').insertOne(newUser);

      // Award referrer atomically if valid
      if (referrerWallet) {
        await db.collection('users').updateOne(
          { walletAddress: referrerWallet },
          {
            $inc: { carrots: 10, referralCount: 1 },
            $set: { updatedAt: new Date() },
          }
        );
      }

      return NextResponse.json({ success: true, created: true, user: newUser });
    }

    // Update existing user
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (isVerified && !existing.isWalletVerified) {
      update.isWalletVerified = true;
    }
    if (twitterHandle && !existing.twitterHandle) {
      update.twitterHandle = String(twitterHandle).replace('@', '').trim();
    }
    if (twitterId && !existing.twitterId) {
      update.twitterId = twitterId;
    }

    // If existing user never had a referrer, and now supplies a valid one
    if (validReferralCode && !existing.referredBy && referrerWallet) {
      update.referredBy = validReferralCode;
      await db.collection('users').updateOne(
        { walletAddress: referrerWallet },
        {
          $inc: { carrots: 10, referralCount: 1 },
          $set: { updatedAt: new Date() },
        }
      );
    }

    const updated = await db.collection('users').findOneAndUpdate(
      { walletAddress: wallet },
      { $set: update },
      { returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, created: false, user: updated });
  } catch (err) {
    console.error('POST /api/user error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
