import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { nanoid } from 'nanoid';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'address is required' }, { status: 400 });
  }
  const wallet = address.toLowerCase();

  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let user: any = await db.collection('users').findOne({ walletAddress: wallet });
    if (!user) {
      // Auto-create on first lookup
      const newUser = {
        walletAddress: wallet,
        twitterHandle: null,
        twitterId: null,
        lives: 5,
        carrots: 0,
        rewards: [],
        completedTasks: [],
        referralCode: nanoid(8).toUpperCase(),
        referredBy: null,
        referralCount: 0,
        ipHistory: [],
        isBanned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection('users').insertOne(newUser);
      user = newUser;
    }
    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('GET /api/user error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, twitterHandle, twitterId, referredBy } = body;
    if (!address) {
      return NextResponse.json({ error: 'address is required' }, { status: 400 });
    }
    const wallet = address.toLowerCase();
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
    }

    const existing = await db.collection('users').findOne({ walletAddress: wallet });
    if (!existing) {
      const newUser = {
        walletAddress: wallet,
        twitterHandle: twitterHandle || null,
        twitterId: twitterId || null,
        lives: 5,
        carrots: 0,
        rewards: [],
        completedTasks: [],
        referralCode: nanoid(8).toUpperCase(),
        referredBy: referredBy || null,
        referralCount: 0,
        ipHistory: [],
        isBanned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection('users').insertOne(newUser);
      return NextResponse.json({ success: true, created: true, user: newUser });
    }

    // Update twitter if provided
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (twitterHandle && !existing.twitterHandle) update.twitterHandle = twitterHandle;
    if (twitterId && !existing.twitterId) update.twitterId = twitterId;

    await db.collection('users').updateOne({ walletAddress: wallet }, { $set: update });
    const updated = await db.collection('users').findOne({ walletAddress: wallet });
    return NextResponse.json({ success: true, created: false, user: updated });
  } catch (err) {
    console.error('POST /api/user error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
