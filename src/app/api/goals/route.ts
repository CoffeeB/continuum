import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ContinuumExecutionEngine } from '@/lib/executionEngine';

export async function GET() {
  const goals = db.getGoals();
  return NextResponse.json({ success: true, goals });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agentId, title, description, projectId } = body;

    if (!agentId || !title) {
      return NextResponse.json({ success: false, error: 'agentId and title are required.' }, { status: 400 });
    }

    let pId = projectId;
    if (!pId) {
      // Use first active project or create one
      const projects = db.getProjects();
      if (projects.length > 0) {
        pId = projects[0].id;
      } else {
        const newProj = db.addProject({
          id: `proj_${Date.now()}`,
          name: 'Primary Autonomous Workspace',
          description: 'Default project workspace for autonomous goals',
          ownerId: 'usr_human_primary',
          assignedAgentIds: [agentId],
          status: 'active',
          origin: 'continuum_agent',
          budget: 1000,
          spentCredits: 0,
          files: [],
          decisions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        pId = newProj.id;
      }
    }

    const goal = await ContinuumExecutionEngine.decomposeGoal(
      agentId,
      title,
      description || title,
      pId
    );

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
