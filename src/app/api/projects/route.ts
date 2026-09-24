import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Project } from '@/lib/types';

export async function GET() {
  const projects = db.getProjects();
  return NextResponse.json({ success: true, projects });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, assignedAgentIds = [], budget = 500 } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Project name is required' }, { status: 400 });
    }

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name,
      description: description || '',
      ownerId: 'usr_human_primary',
      assignedAgentIds,
      status: 'active',
      origin: 'continuum_agent',
      budget,
      spentCredits: 0,
      files: [],
      decisions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.addProject(newProject);
    return NextResponse.json({ success: true, project: newProject });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
