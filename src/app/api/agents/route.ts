import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Agent } from '@/lib/types';

export async function GET() {
  const agents = db.getAgents();
  return NextResponse.json({ success: true, agents });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, purpose, specialization, initialCredits = 1000, initialModelId = 'claude-3-7-sonnet' } = body;

    if (!name || !purpose) {
      return NextResponse.json({ success: false, error: 'Name and purpose are required.' }, { status: 400 });
    }

    const agentId = `agent_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    
    // Choose vibrant aesthetic gradient
    const colorOptions = [
      'from-blue-600 to-indigo-600',
      'from-emerald-500 to-cyan-600',
      'from-amber-500 to-orange-600',
      'from-purple-600 to-violet-600',
      'from-rose-500 to-pink-600',
      'from-cyan-500 to-blue-600'
    ];
    const avatarColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];

    const newAgent: Agent = {
      id: agentId,
      name,
      ownerId: 'usr_human_primary',
      avatarColor,
      purpose,
      specialization: specialization || 'General Autonomous Engineering & Problem Solving',
      status: 'idle',
      currentGoalId: null,
      currentTaskId: null,
      currentModelId: initialModelId,
      credits: initialCredits,
      reputation: {
        overallScore: 90,
        deliveryConsistency: 92,
        qualityScore: 90,
        verificationPassRate: 90,
        categories: [
          { category: specialization || 'Autonomous Work', verifiedProjects: 1, successRate: 100, avgScore: 92 }
        ],
        recentEvents: [
          { id: `rep_init_${Date.now()}`, date: new Date().toISOString().split('T')[0], type: 'INITIALIZATION', delta: 0, reason: 'Persistent agent registered on Continuum' }
        ]
      },
      permissions: {
        projectFiles: 'read_write',
        internetAccess: true,
        hireAgents: true,
        maxCreditsPerTask: 50,
        deleteProject: false,
        externalMoney: false,
        signContracts: false
      },
      skills: [
        {
          id: `skill_${Date.now()}`,
          name: specialization || 'General Autonomous Problem Solving',
          category: 'Core Competency',
          description: `Foundational capability in ${purpose}`,
          stage: 'exposed',
          knowledgeProgress: 75,
          practiceProgress: 60,
          verifiedProjectsCount: 1,
          certificationLevel: 'Level 1: Novice',
          lastDemonstrated: new Date().toISOString().split('T')[0],
          evidence: []
        }
      ],
      knowHowCount: 0,
      memoriesCount: 1,
      totalTasksCompleted: 0,
      activeProjectCount: 0,
      studiedSourcesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastDemonstratedAt: new Date().toISOString()
    };

    db.addAgent(newAgent);

    // Give initial funding transaction
    db.addTransaction({
      id: `tx_${Date.now()}`,
      senderId: 'USER',
      receiverId: newAgent.id,
      amount: initialCredits,
      reason: 'Human Owner Initial Agent Endowment',
      taskId: null,
      timestamp: new Date().toISOString(),
      status: 'settled'
    });

    db.addMemory({
      id: `mem_${Date.now()}`,
      agentId: newAgent.id,
      projectId: null,
      goalId: null,
      taskId: null,
      eventType: 'AGENT_INITIALIZED',
      summary: `Persistent agent "${newAgent.name}" created with purpose: "${newAgent.purpose}". Runtime initially routed to ${initialModelId}.`,
      importance: 'high',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true, agent: newAgent });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
