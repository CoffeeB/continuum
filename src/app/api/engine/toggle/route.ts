import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { running } = body;
    db.setAutonomousRunning(Boolean(running));
    return NextResponse.json({ success: true, isRunningAutonomous: Boolean(running) });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
