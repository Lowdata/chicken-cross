import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, highScore, totalCarrots, unlockedSkins, selectedSkin } = body;

    if (!address) {
      return NextResponse.json({ error: 'Address is required for cloud sync' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: true, synced: false, reason: 'No Mongo connection' });
    }

    const playersCol = db.collection('players');

    await playersCol.updateOne(
      { address: address.toLowerCase() },
      {
        $set: {
          address: address.toLowerCase(),
          highScore: highScore || 0,
          totalCarrots: totalCarrots || 0,
          unlockedSkins: unlockedSkins || ['classic'],
          selectedSkin: selectedSkin || 'classic',
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, synced: true });
  } catch (error) {
    console.error('Player sync error:', error);
    return NextResponse.json({ success: false, error: 'Failed to sync player' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, reason: 'No Mongo connection' });
    }

    const player = await db.collection('players').findOne({ address: address.toLowerCase() });

    return NextResponse.json({ success: true, player });
  } catch (error) {
    console.error('Player GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch player' }, { status: 500 });
  }
}
