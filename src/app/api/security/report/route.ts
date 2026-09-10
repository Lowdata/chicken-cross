/**
 * Admin Security Report Endpoint
 * GET /api/security/report?secret=ADMIN_SECRET
 *
 * Returns:
 *  - Top suspicious IPs by suspicion score
 *  - Active bans
 *  - Country breakdown of requests
 *  - DoS attempts in the last hour
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Protect with admin secret (from header or query parameter)
  const adminSecret = process.env.ADMIN_SECRET;
  const secret = req.headers.get('x-admin-secret') || req.nextUrl.searchParams.get('secret');

  if (!adminSecret || !secret || secret !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Top suspicious IPs
    const suspiciousIps = await db.collection('ip_rate_limits')
      .find({ suspicionScore: { $gt: 20 } })
      .sort({ suspicionScore: -1 })
      .limit(30)
      .project({ ip: 1, country: 1, suspicionScore: 1, requestCount: 1, totalRequests: 1, isBanned: 1, banExpiresAt: 1, userAgents: 1, lastRequestAt: 1 })
      .toArray();

    // Active bans
    const activeBans = await db.collection('ip_rate_limits')
      .find({ isBanned: true, banExpiresAt: { $gt: now } })
      .sort({ suspicionScore: -1 })
      .toArray();

    // Country breakdown (last hour from game_sessions)
    const countryBreakdown = await db.collection('game_sessions')
      .aggregate([
        { $match: { startTime: { $gte: oneHourAgo } } },
        { $group: { _id: '$country', sessions: { $sum: 1 } } },
        { $sort: { sessions: -1 } },
        { $limit: 20 },
      ])
      .toArray();

    // Total sessions last hour
    const sessionsLastHour = await db.collection('game_sessions')
      .countDocuments({ startTime: { $gte: oneHourAgo } });

    // Unique IPs last hour
    const uniqueIpsLastHour = await db.collection('game_sessions')
      .distinct('ip', { startTime: { $gte: oneHourAgo } });

    // Total users
    const totalUsers = await db.collection('users').countDocuments();

    return NextResponse.json({
      success: true,
      generatedAt: now.toISOString(),
      summary: {
        totalUsers,
        sessionsLastHour,
        uniqueIpsLastHour: uniqueIpsLastHour.length,
        activeBans: activeBans.length,
        flaggedIps: suspiciousIps.length,
      },
      suspiciousIps,
      activeBans,
      countryBreakdown: countryBreakdown.map((c: any) => ({ country: c._id, sessions: c.sessions })),
    });
  } catch (err) {
    console.error('GET /api/security/report error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
