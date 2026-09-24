import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AgentPermissions } from '@/lib/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = db.getAgentById(id);
  if (!agent) {
    return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, agent });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = db.updateAgent(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, agent: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = db.getAgentById(id);
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'pause') {
      db.updateAgent(id, { status: 'paused' });
      db.addActivityEvent({
        id: `act_${Date.now()}`,
        agentId: id,
        type: 'AGENT_PAUSED',
        title: `Agent "${agent.name}" Paused`,
        description: `Human owner paused autonomous execution for this agent.`,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ success: true, message: `Agent ${agent.name} paused.` });
    }

    if (action === 'resume') {
      const hasTasks = db.getTasks().some(t => t.assignedAgentId === id && (t.status === 'executing' || t.status === 'queued'));
      const newStatus = hasTasks ? 'working' : 'idle';
      db.updateAgent(id, { status: newStatus });
      db.addActivityEvent({
        id: `act_${Date.now()}`,
        agentId: id,
        type: 'AGENT_RESUMED',
        title: `Agent "${agent.name}" Resumed`,
        description: `Autonomous execution resumed. Status updated to ${newStatus}.`,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ success: true, message: `Agent ${agent.name} resumed.` });
    }

    if (action === 'change_model') {
      const { modelId } = body;
      const oldModel = agent.currentModelId;
      db.updateAgent(id, { currentModelId: modelId });
      
      db.addMemory({
        id: `mem_${Date.now()}`,
        agentId: id,
        projectId: null,
        goalId: null,
        taskId: null,
        eventType: 'MODEL_SWITCHED',
        summary: `Model runtime switched from ${oldModel} to ${modelId}. Persistent agent identity, memory, skills, and project context preserved 100%.`,
        importance: 'high',
        timestamp: new Date().toISOString()
      });

      db.addActivityEvent({
        id: `act_${Date.now()}`,
        agentId: id,
        type: 'MODEL_SWITCH',
        title: `${agent.name} switched model runtime to ${modelId}`,
        description: `Model changed. Agent identity, skills, and know-how remain intact.`,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: `Model switched to ${modelId}` });
    }

    if (action === 'update_permissions') {
      const { permissions } = body as { permissions: AgentPermissions };
      db.updateAgent(id, { permissions });
      db.addActivityEvent({
        id: `act_${Date.now()}`,
        agentId: id,
        type: 'PERMISSIONS_UPDATED',
        title: `Permissions updated for ${agent.name}`,
        description: `Max credits/task: ${permissions.maxCreditsPerTask}, Hire agents: ${permissions.hireAgents ? 'Allowed' : 'Disallowed'}`,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ success: true, message: 'Permissions updated.' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
