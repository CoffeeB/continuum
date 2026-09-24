import { NextResponse } from 'next/server';
import { ContinuumExecutionEngine } from '@/lib/executionEngine';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const result = await ContinuumExecutionEngine.executeNextStep();
    return NextResponse.json({
      success: true,
      result,
      state: db.getState()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
