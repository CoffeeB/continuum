import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const tasks = db.getTasks();
  return NextResponse.json({ success: true, tasks });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Task ID required' }, { status: 400 });
    }
    const updated = db.updateTask(id, updates);
    return NextResponse.json({ success: true, task: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
