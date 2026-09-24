import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WorkPacket } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      requestingAgentId, 
      requestedAgentId, 
      taskTitle, 
      context, 
      constraints = [], 
      expectedOutput, 
      budget = 30,
      goalId,
      taskId
    } = body;

    if (!requestingAgentId || !requestedAgentId || !taskTitle) {
      return NextResponse.json({ success: false, error: 'Missing required WorkPacket parameters.' }, { status: 400 });
    }

    const reqAgent = db.getAgentById(requestingAgentId);
    if (!reqAgent) {
      return NextResponse.json({ success: false, error: 'Requesting agent not found' }, { status: 404 });
    }

    // Permission enforcement: Check if requesting agent is authorized to spend budget & hire agents
    if (!reqAgent.permissions.hireAgents) {
      return NextResponse.json({ success: false, error: 'Agent permission error: hireAgents is disabled for this agent.' }, { status: 403 });
    }

    if (budget > reqAgent.permissions.maxCreditsPerTask) {
      // Exceeds autonomous threshold -> Queue human approval item!
      const approval = {
        id: `appr_${Date.now()}`,
        agentId: requestingAgentId,
        title: `Authorize ${budget} Credits to hire ${requestedAgentId}`,
        description: `${reqAgent.name} requests to dispatch WorkPacket for "${taskTitle}" with budget ${budget} credits, which exceeds autonomous threshold (${reqAgent.permissions.maxCreditsPerTask} credits).`,
        actionType: 'SPEND_CREDITS' as const,
        creditsRequested: budget,
        targetEntity: requestedAgentId,
        payload: {
          taskTitle,
          context,
          budget
        },
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        resolvedAt: null
      };

      db.getState().approvals.unshift(approval);
      db.saveState();

      db.addActivityEvent({
        id: `act_${Date.now()}`,
        agentId: requestingAgentId,
        type: 'APPROVAL_REQUESTED',
        title: `${reqAgent.name} requested human approval for ${budget} credits`,
        description: `WorkPacket creation paused awaiting owner sign-off.`,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true, 
        requiresApproval: true, 
        approval, 
        message: 'WorkPacket requires human approval before credit escrow.' 
      });
    }

    // Within threshold -> Escrow credits & Create WorkPacket immediately
    const packetId = `wp_${Date.now()}`;
    const packet: WorkPacket = {
      id: packetId,
      goalId: goalId || 'goal_network_delegated',
      taskId: taskId || `task_${Date.now()}`,
      requestingAgentId,
      requestedAgentId,
      taskTitle,
      context: context || '',
      constraints,
      expectedOutput: expectedOutput || 'Verified output artifacts.',
      budget,
      status: 'accepted',
      result: null,
      escrowCredits: budget,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    db.getState().workPackets.unshift(packet);

    // Escrow transaction
    db.addTransaction({
      id: `tx_${Date.now()}`,
      senderId: requestingAgentId,
      receiverId: 'NETWORK_ESCROW',
      amount: budget,
      reason: `WorkPacket Escrow: ${taskTitle}`,
      taskId: packet.taskId,
      timestamp: new Date().toISOString(),
      status: 'escrowed'
    });

    db.addActivityEvent({
      id: `act_${Date.now()}`,
      agentId: requestingAgentId,
      type: 'WORK_PACKET_DISPATCHED',
      title: `${reqAgent.name} hired specialist for "${taskTitle}"`,
      description: `Dispatched structured WorkPacket. ${budget} credits held in secure escrow.`,
      timestamp: new Date().toISOString()
    });

    db.saveState();

    return NextResponse.json({ success: true, packet, requiresApproval: false });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
