import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'bunny-hop-session-secret-2024'
);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get('pongpong_session')?.value;
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = cookie || authHeader;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.wallet || !payload.verified) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      address: payload.wallet,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
