import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import { trackIpRequest, getCountryFromHeaders } from '@/lib/security/ipTracker';
import { ensureIndexesOnce } from '@/lib/db/ensureIndexes';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'bunny-hop-session-secret-2024'
);

const CF_TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.CF_TURNSTILE_SECRET_KEY;
  if (!secret || secret.startsWith('1x0000000000000000000000')) return true;
  if (token === 'dev-bypass') return true;

  const expectedAction = 'start_game';
  const expectedHostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? 'localhost,127.0.0.1')
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean)
  );

  if (
    typeof token !== 'string' ||
    token.length === 0 ||
    token.length > 2048 ||
    expectedHostnames.size === 0
  ) {
    return false;
  }

  let result;
  try {
    const r = await fetch(CF_TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    if (!r.ok) throw new Error(`siteverify ${r.status}`);
    result = await r.json();
  } catch {
    return false;
  }

  if (
    !result.success ||
    result.action !== expectedAction ||
    !expectedHostnames.has(result.hostname)
  ) {
    return false;
  }
  
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const country = getCountryFromHeaders(req.headers);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const body = await req.json();
    const { address, cfTurnstileToken } = body;

    // ── CAPTCHA ──
    if (!cfTurnstileToken) {
      return NextResponse.json({ error: 'CAPTCHA verification required' }, { status: 400 });
    }
    const captchaValid = await verifyTurnstile(cfTurnstileToken, ip);
    if (!captchaValid) {
      return NextResponse.json({ error: 'CAPTCHA verification failed. Are you a bot? 🤖' }, { status: 403 });
    }

    const db = await getDb();

    // Ensure indexes exist (runs once per process lifetime)
    if (db) ensureIndexesOnce().catch(console.error);

    if (!db) {
      // Offline mode — no DB checks
      const maxCarrots = Math.random() < 0.01 ? 9 : 8;
      const sessionId = nanoid(16);
      const token = await new SignJWT({
        sessionId, ip, address: address || null, maxCarrots, startTime: Date.now(),
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('2h')
        .sign(JWT_SECRET);
      return NextResponse.json({ success: true, sessionToken: token, maxCarrots, country });
    }

    // ── ENHANCED IP TRACKING (rate limit + DoS + country) ──
    const ipResult = await trackIpRequest(db, ip, country, userAgent);
    if (!ipResult.allowed) {
      const status = ipResult.isBanned ? 403 : 429;
      const headers: Record<string, string> = {
        'X-Suspicion-Score': String(ipResult.suspicionScore),
      };
      if (status === 429) headers['Retry-After'] = '3600';
      return NextResponse.json({ error: ipResult.reason }, { status, headers });
    }

    let completedTasks: string[] = [];
    if (address) {
      const user = await db.collection('users').findOne({ walletAddress: address.toLowerCase() });
      if (user?.isBanned) {
        return NextResponse.json({ error: 'Account is banned.' }, { status: 403 });
      }
      if (user?.completedTasks) {
        completedTasks = user.completedTasks;
      }
    }

    // ── 9TH CARROT ROLL (1 in 100) ──
    const ninthCarrotSpawns = Math.random() < 0.01;
    const maxCarrots = ninthCarrotSpawns ? 9 : 8;
    const sessionId = nanoid(16);
    const now = new Date();

    await db.collection('game_sessions').insertOne({
      sessionId,
      walletAddress: address ? address.toLowerCase() : null,
      ip,
      country,
      startTime: now,
      maxCarrots,
      ninthCarrotSpawned: ninthCarrotSpawns,
      captchaVerified: true,
      completed: false,
      endTime: null,
    });

    const token = await new SignJWT({
      sessionId, ip,
      address: address ? address.toLowerCase() : null,
      maxCarrots,
      startTime: Date.now(),
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('2h')
      .sign(JWT_SECRET);
    return NextResponse.json({ success: true, sessionToken: token, maxCarrots, country, completedTasks });
  } catch (err) {
    console.error('POST /api/game/start error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
