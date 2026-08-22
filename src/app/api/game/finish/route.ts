import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { jwtVerify } from 'jose';
import { nanoid } from 'nanoid';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'bunny-hop-session-secret-2024'
);

// Minimum time (ms) per carrot to prevent instant bot submissions
const MIN_MS_PER_CARROT = 2000; // 2 seconds per carrot minimum
// Minimum run time in ms (even 0 carrots should take a few seconds)
const MIN_RUN_DURATION_MS = 3000;

function computeRewardTier(carrots: number): 'none' | 'fcfs' | 'guaranteed' {
  if (carrots >= 9) return 'guaranteed';
  if (carrots >= 5) return 'fcfs';
  return 'none';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionToken, score, carrots, address } = body;

    if (!sessionToken || typeof score !== 'number' || typeof carrots !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify JWT session token
    let payload: {
      sessionId: string;
      ip: string;
      address: string | null;
      maxCarrots: number;
      startTime: number;
    };
    try {
      const { payload: decoded } = await jwtVerify(sessionToken, JWT_SECRET);
      payload = decoded as typeof payload;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired session token' }, { status: 401 });
    }

    const elapsedMs = Date.now() - payload.startTime;
    const { sessionId, maxCarrots } = payload;

    // Anti-bot: minimum run duration check
    if (elapsedMs < MIN_RUN_DURATION_MS) {
      return NextResponse.json({ error: 'Run duration too short (bot suspected)' }, { status: 400 });
    }

    // Anti-bot: speed check — minimum time per carrot
    if (carrots > 0 && elapsedMs / carrots < MIN_MS_PER_CARROT) {
      return NextResponse.json({ error: 'Carrot collection rate too fast (bot suspected)' }, { status: 400 });
    }

    // Carrot cap validation
    const clampedCarrots = Math.min(carrots, maxCarrots);

    const db = await getDb();
    const rewardTier = computeRewardTier(clampedCarrots);

    if (db) {
      // Mark session as completed
      await db.collection('game_sessions').updateOne(
        { sessionId },
        { $set: { completed: true, endTime: new Date(), finalCarrots: clampedCarrots, finalScore: score } }
      );

      // Update user if wallet is connected
      const wallet = address ? address.toLowerCase() : payload.address;
      if (wallet) {
        const user = await db.collection('users').findOne({ walletAddress: wallet });
        if (user) {
          const updateFields: Record<string, unknown> = {
            updatedAt: new Date(),
          };

          // Always add carrots to the bank
          updateFields.carrots = (user.carrots || 0) + clampedCarrots;

          // Add reward entry if qualified
          if (rewardTier !== 'none') {
            const rewardEntry = {
              id: nanoid(10),
              tier: rewardTier,
              carrotsCollected: clampedCarrots,
              runScore: score,
              txHash: null,
              claimCode: null,
              claimedAt: null,
              earnedAt: new Date(),
            };

            // Two separate updates to avoid MongoDB driver generic typing issues
            await db.collection('users').updateOne(
              { walletAddress: wallet },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { $set: updateFields } as any
            );
            await db.collection('users').updateOne(
              { walletAddress: wallet },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { $push: { rewards: rewardEntry } } as any
            );
          } else {
            await db.collection('users').updateOne(
              { walletAddress: wallet },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { $set: updateFields } as any
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      rewardTier,
      clampedCarrots,
      maxCarrots,
    });
  } catch (err) {
    console.error('POST /api/game/finish error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
