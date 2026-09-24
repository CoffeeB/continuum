import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const state = db.getState();
    return NextResponse.json({ success: true, state });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'reset') {
      const state = db.resetState();
      return NextResponse.json({ success: true, state, message: 'Continuum state reset to factory benchmark.' });
    }
    return NextResponse.json({ success: true, state: db.getState() });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
