import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { nanoid } from 'nanoid';
import { isAddress } from 'viem';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address');
    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Valid Ethereum address required' }, { status: 400 });
    }

    const wallet = address.toLowerCase();
    const nonce = nanoid(24);
    const issuedAt = new Date().toISOString();

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Upsert nonce for this wallet (overwrites any previous pending nonce)
    await db.collection('auth_nonces').updateOne(
      { address: wallet },
      {
        $set: {
          address: wallet,
          nonce,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    const message = [
      'Welcome to PongPong!',
      '',
      'Sign this message to prove you own this wallet and access your PongPong bunny profile.',
      'This request is completely free and will not trigger a blockchain transaction.',
      '',
      `Wallet: ${address}`,
      `Nonce: ${nonce}`,
      `Issued At: ${issuedAt}`,
    ].join('\n');

    return NextResponse.json({
      success: true,
      nonce,
      message,
    });
  } catch (err) {
    console.error('GET /api/auth/nonce error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
