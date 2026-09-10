import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({
        success: true,
        source: 'local_fallback',
        leaderboard: [
          { name: 'HopperChamp 🐰', score: 128, carrots: 42, skin: 'golden', createdAt: new Date() },
          { name: 'FluffyNinja 🥷', score: 96, carrots: 31, skin: 'ninja', createdAt: new Date() },
          { name: 'CyberRabbit ⚡', score: 84, carrots: 24, skin: 'cyber', createdAt: new Date() },
          { name: 'CottonTail 🌸', score: 62, carrots: 18, skin: 'sakura', createdAt: new Date() },
          { name: 'Barnaby 🥕', score: 45, carrots: 12, skin: 'classic', createdAt: new Date() },
        ],
      });
    }

    const leaderboard = await db
      .collection('scores')
      .find({}, { projection: { name: 1, score: 1, carrots: 1, skin: 1, createdAt: 1, address: 1 } })
      .sort({ score: -1, createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      leaderboard,
    });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, address, score, carrots, goldenCarrots, skin } = body;

    if (typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: true, saved: false, reason: 'No Mongo connection' });
    }

    const entry = {
      name: name || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Anonymous Bunny'),
      address: address || null,
      score,
      carrots: carrots || 0,
      goldenCarrots: goldenCarrots || 0,
      skin: skin || 'classic',
      createdAt: new Date(),
    };

    const result = await db.collection('scores').insertOne(entry);

    return NextResponse.json({
      success: true,
      saved: true,
      id: result.insertedId,
    });
  } catch (error) {
    console.error('Leaderboard POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit score' }, { status: 500 });
  }
}
