import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'bunny-hop-session-secret-2024'
);

const MAX_REQUESTS_PER_IP_PER_HOUR = 60;
const CF_TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Returns true if valid, false otherwise.
 * In dev mode (no secret key set), always returns true.
 */
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.CF_TURNSTILE_SECRET_KEY;

  // Skip verification if no secret configured (local dev)
  if (!secret || secret.startsWith('1x0000000000000000000000')) {
    return true;
  }

  try {
    const res = await fetch(CF_TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip,
      }),
    });
    const data = await res.json() as { success: boolean; 'error-codes'?: string[] };
    return data.success === true;
  } catch {
    // If Cloudflare is unreachable, allow through (fail-open) to avoid blocking real users
    console.error('Turnstile verification failed (fail-open)');
    return true;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get IP from headers
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const body = await req.json();
    const { address, cfTurnstileToken } = body;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CAPTCHA CHECK — Cloudflare Turnstile
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!cfTurnstileToken) {
      return NextResponse.json(
        { error: 'CAPTCHA verification required' },
        { status: 400 }
      );
    }

    const captchaValid = await verifyTurnstile(cfTurnstileToken, ip);
    if (!captchaValid) {
      return NextResponse.json(
        { error: 'CAPTCHA verification failed. Are you a bot? 🤖' },
        { status: 403 }
      );
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const db = await getDb();
    if (!db) {
      // Offline mode: generate a simple session without DB checks
      const maxCarrots = Math.random() < 0.01 ? 9 : 8;
      const sessionId = nanoid(16);
      const token = await new SignJWT({
        sessionId,
        ip,
        address: address || null,
        maxCarrots,
        startTime: Date.now(),
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('2h')
        .sign(JWT_SECRET);

      return NextResponse.json({ success: true, sessionToken: token, maxCarrots });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // IP RATE LIMITING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const ipRecord = await db.collection('ip_rate_limits').findOne({ ip });

    if (ipRecord) {
      if (ipRecord.windowStart > oneHourAgo && ipRecord.requestCount >= MAX_REQUESTS_PER_IP_PER_HOUR) {
        return NextResponse.json(
          { error: 'Too many game sessions from your IP. Try again later.' },
          { status: 429 }
        );
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // BAN CHECK
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (address) {
      const wallet = address.toLowerCase();
      const user = await db.collection('users').findOne({ walletAddress: wallet });
      if (user?.isBanned) {
        return NextResponse.json({ error: 'Account is banned.' }, { status: 403 });
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 9TH CARROT ROLL (1 in 100)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const ninthCarrotSpawns = Math.random() < 0.01;
    const maxCarrots = ninthCarrotSpawns ? 9 : 8;
    const sessionId = nanoid(16);

    // Create session record in DB
    await db.collection('game_sessions').insertOne({
      sessionId,
      walletAddress: address ? address.toLowerCase() : null,
      ip,
      startTime: now,
      maxCarrots,
      ninthCarrotSpawned: ninthCarrotSpawns,
      captchaVerified: true,
      completed: false,
      endTime: null,
    });

    // Update IP rate limit
    if (ipRecord && ipRecord.windowStart > oneHourAgo) {
      await db.collection('ip_rate_limits').updateOne(
        { ip },
        { $inc: { requestCount: 1 }, $set: { lastRequestAt: now } }
      );
    } else {
      await db.collection('ip_rate_limits').replaceOne(
        { ip },
        { ip, requestCount: 1, windowStart: now, lastRequestAt: now },
        { upsert: true }
      );
    }

    // Sign JWT with session details
    const token = await new SignJWT({
      sessionId,
      ip,
      address: address ? address.toLowerCase() : null,
      maxCarrots,
      startTime: Date.now(),
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('2h')
      .sign(JWT_SECRET);

    return NextResponse.json({ success: true, sessionToken: token, maxCarrots });
  } catch (err) {
    console.error('POST /api/game/start error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

