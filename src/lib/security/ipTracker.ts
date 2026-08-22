/**
 * Enhanced IP Tracker — DoS detection, country tracking, velocity scoring
 *
 * Used in /api/game/start and other sensitive endpoints.
 * Stores richer data than the simple rate limiter:
 *  - country (from CF-IPCountry header)
 *  - userAgent
 *  - suspicion score (0-100)
 *  - burst detection (>10 req in 10s = flag)
 *  - auto-ban at score >= 80
 */

import type { Db } from 'mongodb';

interface IpRecord {
  ip: string;
  country: string;
  requestCount: number;
  windowStart: Date;
  lastRequestAt: Date;
  requestsLast10s: number;
  last10sWindowStart: Date;
  suspicionScore: number;
  isBanned: boolean;
  banExpiresAt: Date | null;
  userAgents: string[];
  totalRequests: number;
}

interface TrackResult {
  allowed: boolean;
  reason?: string;
  suspicionScore: number;
  country: string;
  isBanned: boolean;
}

const MAX_PER_HOUR = 60;
const MAX_PER_10S = 10;     // Burst threshold
const SCORE_THRESHOLD_BAN = 80;
const BAN_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Extract country from Cloudflare header or fallback
 */
export function getCountryFromHeaders(headers: Headers): string {
  return (
    headers.get('cf-ipcountry') ||
    headers.get('x-vercel-ip-country') ||
    headers.get('x-country') ||
    'XX' // Unknown
  );
}

/**
 * Track an IP request and compute threat level.
 * Returns whether the request should be allowed.
 */
export async function trackIpRequest(
  db: Db,
  ip: string,
  country: string,
  userAgent: string
): Promise<TrackResult> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const tenSecsAgo = new Date(now.getTime() - 10 * 1000);

  const collection = db.collection<IpRecord>('ip_rate_limits');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await collection.findOne({ ip }) as any;

  // ── CHECK EXISTING BAN ──
  if (existing?.isBanned) {
    if (existing.banExpiresAt && existing.banExpiresAt > now) {
      return { allowed: false, reason: 'IP temporarily banned', suspicionScore: 100, country, isBanned: true };
    }
    // Ban expired — reset
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await collection.updateOne({ ip }, { $set: { isBanned: false, banExpiresAt: null, suspicionScore: 20 } } as any);
  }

  let suspicionScore = existing?.suspicionScore || 0;
  let isBanned = false;

  // ── HOURLY RATE CHECK ──
  if (existing && existing.windowStart > oneHourAgo) {
    if (existing.requestCount >= MAX_PER_HOUR) {
      suspicionScore = Math.min(100, suspicionScore + 15);

      // Auto-ban if score is very high
      if (suspicionScore >= SCORE_THRESHOLD_BAN) {
        isBanned = true;
        const banExpiry = new Date(now.getTime() + BAN_DURATION_MS);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await collection.updateOne({ ip }, { $set: { isBanned: true, banExpiresAt: banExpiry, suspicionScore } } as any);
        return { allowed: false, reason: 'Rate limit exceeded — IP banned for 24h', suspicionScore, country, isBanned: true };
      }
      return { allowed: false, reason: 'Rate limit exceeded. Try again later.', suspicionScore, country, isBanned };
    }
  }

  // ── BURST / DoS DETECTION (10 req in 10s) ──
  if (existing) {
    const burstWindowValid = existing.last10sWindowStart && existing.last10sWindowStart > tenSecsAgo;
    const burstCount = burstWindowValid ? (existing.requestsLast10s || 0) : 0;

    if (burstCount >= MAX_PER_10S) {
      suspicionScore = Math.min(100, suspicionScore + 25); // Big penalty for burst
      if (suspicionScore >= SCORE_THRESHOLD_BAN) {
        isBanned = true;
        const banExpiry = new Date(now.getTime() + BAN_DURATION_MS);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await collection.updateOne({ ip }, { $set: { isBanned: true, banExpiresAt: banExpiry, suspicionScore } } as any);
        return { allowed: false, reason: 'DoS pattern detected — IP banned for 24h', suspicionScore, country, isBanned: true };
      }
      return { allowed: false, reason: 'Too many requests in a short window. Slow down.', suspicionScore, country, isBanned };
    }
  }

  // ── UPDATE RECORD ──
  const inHourWindow = existing && existing.windowStart > oneHourAgo;
  const in10sWindow = existing && existing.last10sWindowStart && existing.last10sWindowStart > tenSecsAgo;

  // Small decay on suspicion score for good behavior
  suspicionScore = Math.max(0, suspicionScore - 1);

  // Collect unique user agents (max 5 stored)
  const existingAgents: string[] = existing?.userAgents || [];
  const updatedAgents = Array.from(new Set([...existingAgents, userAgent])).slice(-5);

  // Multiple user-agents from same IP = bot signal
  if (updatedAgents.length >= 4) {
    suspicionScore = Math.min(100, suspicionScore + 10);
  }

  const updateDoc = {
    ip,
    country,
    lastRequestAt: now,
    suspicionScore,
    isBanned: false,
    userAgents: updatedAgents,
    totalRequests: (existing?.totalRequests || 0) + 1,
    // Hourly window
    windowStart: inHourWindow ? existing.windowStart : now,
    requestCount: inHourWindow ? (existing.requestCount || 0) + 1 : 1,
    // 10s burst window
    last10sWindowStart: in10sWindow ? existing.last10sWindowStart : now,
    requestsLast10s: in10sWindow ? (existing.requestsLast10s || 0) + 1 : 1,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await collection.replaceOne({ ip }, updateDoc as any, { upsert: true });

  return { allowed: true, suspicionScore, country, isBanned: false };
}

/**
 * Get top suspicious IPs for admin dashboard
 */
export async function getTopSuspiciousIps(db: Db, limit = 20) {
  return db.collection('ip_rate_limits')
    .find({ suspicionScore: { $gt: 30 } })
    .sort({ suspicionScore: -1 })
    .limit(limit)
    .toArray();
}
