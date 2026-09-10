import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { verifyMessage, isAddress } from 'viem';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'bunny-hop-session-secret-2024'
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, message, signature } = body;

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Valid Ethereum address required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || !signature || typeof signature !== 'string') {
      return NextResponse.json({ error: 'Message and cryptographic signature are required' }, { status: 400 });
    }

    const wallet = address.toLowerCase();

    // 1. Cryptographic signature check using viem (ECDSA ecrecover)
    let isValidSignature = false;
    try {
      isValidSignature = await verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });
    } catch (sigErr) {
      console.error('Signature verification error:', sigErr);
      return NextResponse.json({ error: 'Failed to verify cryptographic signature' }, { status: 401 });
    }

    if (!isValidSignature) {
      return NextResponse.json({ error: 'Invalid wallet signature. Spoofed wallets are blocked.' }, { status: 401 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // 2. Validate nonce against DB and delete it (single-use anti-replay)
    const nonceRecord = await db.collection('auth_nonces').findOne({ address: wallet });
    if (!nonceRecord || !message.includes(nonceRecord.nonce)) {
      return NextResponse.json(
        { error: 'Authentication challenge expired or invalid. Please sign again.' },
        { status: 401 }
      );
    }

    // Burn nonce immediately
    await db.collection('auth_nonces').deleteOne({ address: wallet });

    // 3. Find or create verified user
    let user = await db.collection('users').findOne({ walletAddress: wallet });
    if (!user) {
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
        isWalletVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const insertResult = await db.collection('users').insertOne(newUser);
      user = { _id: insertResult.insertedId, ...newUser };
    } else if (!user.isWalletVerified) {
      await db.collection('users').updateOne(
        { walletAddress: wallet },
        { $set: { isWalletVerified: true, updatedAt: new Date() } }
      );
      user.isWalletVerified = true;
    }

    // 4. Issue session token (7-day duration)
    const token = await new SignJWT({
      wallet,
      verified: true,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      verified: true,
      user,
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'pongpong_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('POST /api/auth/verify error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
