'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Sidebar, NavTab } from '@/components/Sidebar';
import { OverviewView } from '@/components/views/OverviewView';
import { AgentsView } from '@/components/views/AgentsView';
import { ProjectsView } from '@/components/views/ProjectsView';
import { KnowledgeView } from '@/components/views/KnowledgeView';
import { ActivityView } from '@/components/views/ActivityView';
import { NewGoalModal } from '@/components/modals/NewGoalModal';
import { NewAgentModal } from '@/components/modals/NewAgentModal';
import { WhileYouWereAwayModal } from '@/components/modals/WhileYouWereAwayModal';
import { ImportSourceModal } from '@/components/modals/ImportSourceModal';
import { ContinuumState, Agent, AgentPermissions } from '@/lib/types';

export default function ContinuumApp() {
  const [state, setState] = useState<ContinuumState | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isExecutingStep, setIsExecutingStep] = useState(false);

  // Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isAwayModalOpen, setIsAwayModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTargetAgentId, setImportTargetAgentId] = useState<string | undefined>(undefined);

  // Fetch state from server
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      if (data.success && data.state) {
        setState(data.state);
      }
    } catch (err) {
      console.error('Failed to fetch state:', err);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Background Autonomous Loop Heartbeat
  useEffect(() => {
    if (!state?.isRunningAutonomous) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/engine/step', { method: 'POST' });
        const data = await res.json();
        if (data.success && data.state) {
          setState(data.state);
        }
      } catch (e) {
        console.error('Autonomous step heartbeat error:', e);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [state?.isRunningAutonomous]);

  // Actions
  const handleStep = async () => {
    setIsExecutingStep(true);
    try {
      const res = await fetch('/api/engine/step', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.state) {
        setState(data.state);
      }
    } catch (err) {
      console.error('Step execution error:', err);
    } finally {
      setIsExecutingStep(false);
    }
  };

  const handleToggleAuto = async (running: boolean) => {
    try {
      await fetch('/api/engine/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ running })
      });
      if (state) {
        setState({ ...state, isRunningAutonomous: running });
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleResetState = async () => {
    if (confirm('Reset Continuum OS state to default benchmark?')) {
      try {
        const res = await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reset' })
        });
        const data = await res.json();
        if (data.success && data.state) {
          setState(data.state);
        }
      } catch (err) {
        console.error('Reset error:', err);
      }
    }
  };

  const handleResolveApproval = async (id: string, decision: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, decision })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Approval resolution error:', err);
    }
  };

  const handleToggleAgentPause = async (agentId: string, currentStatus: Agent['status']) => {
    const action = currentStatus === 'paused' ? 'resume' : 'pause';
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Pause/resume error:', err);
    }
  };

  const handleChangeModel = async (agentId: string, modelId: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_model', modelId })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Model change error:', err);
    }
  };

  const handleUpdatePermissions = async (agentId: string, permissions: AgentPermissions) => {
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_permissions', permissions })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Permissions update error:', err);
    }
  };

  const handleSubmitGoal = async (data: { agentId: string; title: string; description: string; projectId: string }) => {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      fetchState();
    }
  };

  const handleQuickGoalSubmit = async (title: string) => {
    const primaryAgent = state?.agents[0];
    if (!primaryAgent) return;

    await handleSubmitGoal({
      agentId: primaryAgent.id,
      title,
      description: title,
      projectId: state?.projects[0]?.id || 'proj_celly_v2'
    });
  };

  const handleSubmitAgent = async (data: {
    name: string;
    purpose: string;
    specialization: string;
    initialCredits: number;
    initialModelId: string;
  }) => {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const respData = await res.json();
      if (respData.agent) {
        setSelectedAgentId(respData.agent.id);
        setActiveTab('agents');
      }
      fetchState();
    }
  };

  const handleSendWorkPacket = async (packetData: {
    requestingAgentId: string;
    requestedAgentId: string;
    taskTitle: string;
    context: string;
    constraints: string[];
    expectedOutput: string;
    budget: number;
  }) => {
    const res = await fetch('/api/network/packet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packetData)
    });
    const data = await res.json();
    fetchState();
    return {
      requiresApproval: data.requiresApproval || false,
      message: data.message
    };
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING CONTINUUM OS RUNTIME...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        state={state}
        onStep={handleStep}
        onToggleAuto={handleToggleAuto}
        onOpenAwayModal={() => setIsAwayModalOpen(true)}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
        onResetState={handleResetState}
        isExecutingStep={isExecutingStep}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setSelectedAgentId(null);
          }}
          selectedAgentId={selectedAgentId}
          onSelectAgent={(agentId) => {
            setSelectedAgentId(agentId);
            setActiveTab('agents');
          }}
          onOpenAgentModal={() => setIsAgentModalOpen(true)}
          onOpenGoalModal={() => setIsGoalModalOpen(true)}
          state={state}
        />

        {/* Active Content Area */}
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          {activeTab === 'overview' && !selectedAgentId && (
            <OverviewView
              state={state}
              onSelectAgent={(agentId) => {
                setSelectedAgentId(agentId);
                setActiveTab('agents');
              }}
              onSelectProject={() => setActiveTab('projects')}
              onResolveApproval={handleResolveApproval}
              onToggleAgentPause={handleToggleAgentPause}
              onOpenGoalModal={() => setIsGoalModalOpen(true)}
              onSubmitQuickGoal={handleQuickGoalSubmit}
            />
          )}

          {activeTab === 'agents' && (
            <AgentsView
              state={state}
              selectedAgentId={selectedAgentId}
              onSelectAgent={(id) => setSelectedAgentId(id)}
              onToggleAgentPause={handleToggleAgentPause}
              onChangeModel={handleChangeModel}
              onUpdatePermissions={handleUpdatePermissions}
              onOpenGoalModal={() => setIsGoalModalOpen(true)}
              onOpenNewAgentModal={() => setIsAgentModalOpen(true)}
              onOpenImportModal={(agentId) => {
                setImportTargetAgentId(agentId);
                setIsImportModalOpen(true);
              }}
              onSubmitQuickGoal={handleQuickGoalSubmit}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              state={state}
              onOpenGoalModal={() => setIsGoalModalOpen(true)}
            />
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeView
              state={state}
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityView
              state={state}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <NewGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        state={state}
        onSubmitGoal={handleSubmitGoal}
      />

      <NewAgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        state={state}
        onSubmitAgent={handleSubmitAgent}
      />

      <WhileYouWereAwayModal
        isOpen={isAwayModalOpen}
        onClose={() => setIsAwayModalOpen(false)}
        state={state}
        onReviewApprovals={() => {
          setActiveTab('overview');
        }}
      />

      <ImportSourceModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        state={state}
        defaultAgentId={importTargetAgentId}
        onImportSuccess={fetchState}
      />
    </div>
  );
}
