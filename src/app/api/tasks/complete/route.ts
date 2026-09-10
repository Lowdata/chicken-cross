import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { jwtVerify } from 'jose';
import { validateReferralCode } from '@/lib/services/referralService';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'bunny-hop-session-secret-2024'
);

export const dynamic = 'force-dynamic';

// Task definitions with rewards
const TASK_REWARDS: Record<string, { lives: number; carrots: number; label: string }> = {
  link_twitter: { lives: 2, carrots: 10, label: 'Link Twitter' },
  like_post: { lives: 1, carrots: 5, label: 'Like Post' },
  retweet_post: { lives: 1, carrots: 5, label: 'Retweet Post' },
  refer_friend: { lives: 3, carrots: 20, label: 'Refer a Friend' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, task, twitterHandle, referralCode } = body;

    if (!address || !task) {
      return NextResponse.json({ error: 'address and task are required' }, { status: 400 });
    }

    const reward = TASK_REWARDS[task];
    if (!reward) {
      return NextResponse.json({ error: 'Unknown task' }, { status: 400 });
    }

    const wallet = address.toLowerCase();

    // ── Enforce wallet session authentication ──
    const sessionCookie = req.cookies.get('pongpong_session')?.value;
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = sessionCookie || authHeader;

    let isAuthorized = false;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.wallet && String(payload.wallet).toLowerCase() === wallet && payload.verified) {
          isAuthorized = true;
        }
      } catch {}
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid wallet session required to complete tasks' },
        { status: 401 }
      );
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
    }

    const user = await db.collection('users').findOne({ walletAddress: wallet });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if task already completed in the tasks collection
    const existingTask = await db.collection('tasks').findOne({ walletAddress: wallet, taskId: task });
    if (existingTask) {
      return NextResponse.json({ error: 'Task already completed', alreadyDone: true });
    }

    // Task-specific validation
    if (task === 'link_twitter' && !twitterHandle) {
      return NextResponse.json({ error: 'twitterHandle required for link_twitter task' }, { status: 400 });
    }

    if (task === 'refer_friend') {
      if (!referralCode) {
        return NextResponse.json({ error: 'referralCode required for refer_friend task' }, { status: 400 });
      }
      const valResult = await validateReferralCode(referralCode, wallet, db);
      if (!valResult.valid) {
        return NextResponse.json({ error: valResult.error }, { status: 400 });
      }

      // Award referrer too
      await db.collection('users').updateOne(
        { walletAddress: valResult.referrerWallet },
        {
          $inc: { carrots: 10, referralCount: 1 },
          $set: { updatedAt: new Date() },
        }
      );
    }

    // Build user update
    const update: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    const incFields: Record<string, number> = {
      carrots: reward.carrots,
      lives: reward.lives,
    };

    if (task === 'link_twitter' && twitterHandle) {
      update.twitterHandle = twitterHandle;
    }
    if (task === 'refer_friend' && referralCode) {
      update.referredBy = referralCode.toUpperCase();
    }

    // Insert into tasks collection
    await db.collection('tasks').insertOne({
      walletAddress: wallet,
      taskId: task,
      completedAt: new Date(),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.collection('users').updateOne(
      { walletAddress: wallet },
      {
        $set: update,
        $inc: incFields,
        $push: { completedTasks: task },
      }
    ) as any);

    const updatedUser = await db.collection('users').findOne({ walletAddress: wallet });

    return NextResponse.json({
      success: true,
      task,
      reward,
      user: updatedUser,
    });
  } catch (err) {
    console.error('POST /api/tasks/complete error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
