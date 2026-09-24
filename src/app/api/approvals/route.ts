import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const approvals = db.getApprovals();
  return NextResponse.json({ success: true, approvals });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, decision } = body;

    if (!id || !['approved', 'rejected'].includes(decision)) {
      return NextResponse.json({ success: false, error: 'Valid id and decision (approved/rejected) required' }, { status: 400 });
    }

    const resolved = db.resolveApproval(id, decision);
    if (!resolved) {
      return NextResponse.json({ success: false, error: 'Approval item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, approval: resolved });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
