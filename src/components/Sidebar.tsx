'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  FolderKanban, 
  BrainCircuit, 
  Network, 
  Plus,
  Sparkles,
  Zap
} from 'lucide-react';
import { ContinuumState, Agent } from '@/lib/types';

export type NavTab = 
  | 'overview' 
  | 'agents' 
  | 'projects' 
  | 'knowledge' 
  | 'activity';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  onOpenAgentModal: () => void;
  onOpenGoalModal: () => void;
  state: ContinuumState;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  selectedAgentId,
  onSelectAgent,
  onOpenAgentModal,
  onOpenGoalModal,
  state
}: SidebarProps) {
  const approvalsList = state.approvals || [];
  const agentsList = state.agents || [];
  const projectsList = state.projects || [];
  const knowHowList = state.knowHow || [];
  const activityList = state.activity || [];
  const pendingApprovals = approvalsList.filter(a => a.status === 'pending');

  const navItems = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard, badge: pendingApprovals.length > 0 ? `${pendingApprovals.length} need approval` : undefined },
    { id: 'agents', label: 'My Agents', icon: Bot, count: agentsList.length },
    { id: 'projects', label: 'Work & Projects', icon: FolderKanban, count: projectsList.length },
    { id: 'knowledge', label: 'Knowledge Base', icon: BrainCircuit, count: knowHowList.length + (state.importedSources?.length || 0) },
    { id: 'activity', label: 'Activity Timeline', icon: Zap, count: activityList.length },
  ];

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'working': return 'bg-emerald-400';
      case 'waiting_approval': return 'bg-amber-400';
      case 'learning': return 'bg-cyan-400';
      case 'verifying': return 'bg-purple-400';
      case 'paused': return 'bg-zinc-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <aside className="w-60 border-r border-zinc-800/80 bg-zinc-950 flex flex-col justify-between select-none shrink-0 h-[calc(100vh-3.5rem)]">
      {/* Top Navigation */}
      <div className="p-3 space-y-5 overflow-y-auto">
        {/* Quick Goal Trigger Button */}
        <button
          onClick={onOpenGoalModal}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all shadow-sm group"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-950 group-hover:rotate-12 transition-transform" />
          <span>New Goal for Agent</span>
        </button>

        {/* Primary Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !selectedAgentId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id as NavTab);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-850 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    item.badge.includes('alert') 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {!item.badge && item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Persistent Agents Quick List */}
        <div className="space-y-1 pt-3 border-t border-zinc-850">
          <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            <span>Your Agents</span>
            <button
              onClick={onOpenAgentModal}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Add a new persistent agent"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {agentsList.map((agent) => {
              const isSelected = selectedAgentId === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => onSelectAgent(agent.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    isSelected
                      ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(agent.status)}`} />
                    <span className="truncate">{agent.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {agent.credits} cr
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Quiet Info */}
      <div className="p-3 border-t border-zinc-900">
        <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-850/60 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Persistent Agent Cloud</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
            Work continues automatically even when you close the browser.
          </p>
        </div>
      </div>
    </aside>
  );
}
