import { Db } from 'mongodb';

// High-performance short-lived in-memory cache (60s) to absorb heavy load / viral referral spikes
const codeCache = new Map<string, { walletAddress: string; expiresAt: number }>();

export type ReferralValidationResult =
  | { valid: true; referralCode: string; referrerWallet: string }
  | { valid: false; error: string; status: number };

/**
 * Validates a referral code against format rules, cache, and MongoDB.
 * Checks for self-referral and enforces covered index queries for heavy load.
 */
export async function validateReferralCode(
  rawCode: string,
  userWallet: string | null,
  db: Db
): Promise<ReferralValidationResult> {
  if (!rawCode || !rawCode.trim()) {
    return { valid: false, error: 'Referral code is required', status: 400 };
  }

  const code = rawCode.trim().toUpperCase();

  // Fast-path format validation: alphanumeric between 4 and 16 characters
  if (!/^[A-Z0-9_-]{4,16}$/.test(code)) {
    return { valid: false, error: 'Invalid referral code format', status: 400 };
  }

  const now = Date.now();
  const cached = codeCache.get(code);
  let referrerWallet: string | null = null;

  if (cached && cached.expiresAt > now) {
    referrerWallet = cached.walletAddress;
  } else {
    // Covered index query: only project walletAddress & referralCode
    const referrer = await db.collection('users').findOne(
      { referralCode: code },
      { projection: { _id: 0, walletAddress: 1, referralCode: 1 } }
    );

    if (!referrer || !referrer.walletAddress) {
      return { valid: false, error: 'Referral code does not exist', status: 404 };
    }

    const wallet = String(referrer.walletAddress);
    referrerWallet = wallet;

    // Cache valid code for 60 seconds (purge oldest if cache grows > 10,000 entries)
    if (codeCache.size > 10000) {
      const firstKey = codeCache.keys().next().value;
      if (firstKey) codeCache.delete(firstKey);
    }
    codeCache.set(code, { walletAddress: wallet, expiresAt: now + 60_000 });
  }

  // Check self-referral
  if (userWallet && referrerWallet && referrerWallet.toLowerCase() === userWallet.toLowerCase()) {
    return { valid: false, error: 'You cannot use your own referral code', status: 400 };
  }

  return { valid: true, referralCode: code, referrerWallet };
}
