/**
 * MongoDB Index Definitions & Initialization
 * Run once on startup via /api/admin/init or call ensureIndexes() in middleware.
 *
 * Collections:
 *  - users          : walletAddress (unique), twitterHandle
 *  - game_sessions  : sessionId (unique), walletAddress, ip, startTime (TTL 48h)
 *  - ip_rate_limits : ip (unique), windowStart
 *  - tasks          : walletAddress + taskId (compound unique)
 */

import { getDb } from './mongodb';

export async function ensureIndexes() {
  const db = await getDb();
  if (!db) {
    console.warn('ensureIndexes: DB unavailable, skipping');
    return;
  }

  try {
    // ── users ──
    const users = db.collection('users');
    await users.createIndex({ walletAddress: 1 }, { unique: true, background: true });
    await users.createIndex({ twitterHandle: 1 }, { sparse: true, background: true });
    await users.createIndex({ referralCode: 1 }, { unique: true, background: true });
    await users.createIndex({ createdAt: -1 }, { background: true });

    // ── game_sessions ──
    const sessions = db.collection('game_sessions');
    await sessions.createIndex({ sessionId: 1 }, { unique: true, background: true });
    await sessions.createIndex({ walletAddress: 1 }, { background: true });
    await sessions.createIndex({ ip: 1, startTime: -1 }, { background: true });
    // TTL: auto-delete sessions older than 48 hours
    await sessions.createIndex(
      { startTime: 1 },
      { expireAfterSeconds: 172800, background: true }
    );

    // ── ip_rate_limits ──
    const ipLimits = db.collection('ip_rate_limits');
    await ipLimits.createIndex({ ip: 1 }, { unique: true, background: true });
    await ipLimits.createIndex({ windowStart: 1 }, { background: true });
    // TTL: auto-delete IP records after 2 hours (rate limit window)
    await ipLimits.createIndex(
      { windowStart: 1 },
      { expireAfterSeconds: 7200, background: true, name: 'ip_ttl_idx' }
    );
    // Also index for DoS detection
    await ipLimits.createIndex({ suspicionScore: -1 }, { sparse: true, background: true });
    await ipLimits.createIndex({ isBanned: 1 }, { sparse: true, background: true });

    // ── tasks (new dedicated collection) ──
    const tasks = db.collection('tasks');
    await tasks.createIndex(
      { walletAddress: 1, taskId: 1 },
      { unique: true, background: true }
    );
    await tasks.createIndex({ walletAddress: 1 }, { background: true });
    await tasks.createIndex({ completedAt: -1 }, { background: true });

    // ── rewards ──
    const rewards = db.collection('rewards');
    await rewards.createIndex({ walletAddress: 1 }, { background: true });
    await rewards.createIndex({ tier: 1, claimedAt: 1 }, { background: true });
    await rewards.createIndex({ earnedAt: -1 }, { background: true });

    console.log('✅ MongoDB indexes ensured');
  } catch (err) {
    // Don't crash the app if index creation fails (e.g., indexes already exist)
    console.error('ensureIndexes error (non-fatal):', err);
  }
}

// Singleton: only run once per process lifetime
let indexesEnsured = false;
export async function ensureIndexesOnce() {
  if (!indexesEnsured) {
    indexesEnsured = true;
    await ensureIndexes();
  }
}
