'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  MessageSquare,
  Play, 
  Pause,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Check,
  Plus,
  BookOpen,
  Zap
} from 'lucide-react';
import { ContinuumState, Agent } from '@/lib/types';

interface OverviewViewProps {
  state: ContinuumState;
  onSelectAgent: (agentId: string) => void;
  onSelectProject: (projectId: string) => void;
  onResolveApproval: (id: string, decision: 'approved' | 'rejected') => Promise<void>;
  onToggleAgentPause: (agentId: string, currentStatus: Agent['status']) => Promise<void>;
  onOpenGoalModal: () => void;
  onSubmitQuickGoal?: (title: string) => Promise<void>;
  onOpenImportModal?: (agentId?: string) => void;
}

export function OverviewView({
  state,
  onSelectAgent,
  onSelectProject,
  onResolveApproval,
  onToggleAgentPause,
  onOpenGoalModal,
  onSubmitQuickGoal,
  onOpenImportModal
}: OverviewViewProps) {
  const [quickInput, setQuickInput] = useState('');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);

  const approvalsList = state.approvals || [];
  const agentsList = state.agents || [];
  const goalsList = state.goals || [];
  const tasksList = state.tasks || [];
  const projectsList = state.projects || [];
  const activityList = state.activity || [];

  const pendingApprovals = approvalsList.filter(a => a.status === 'pending');
  const primaryAgent = agentsList[0] || null;
  const primaryGoal = goalsList.find(g => g.agentId === primaryAgent?.id && g.status !== 'completed') || goalsList[0];
  const primaryTask = tasksList.find(t => t.id === primaryAgent?.currentTaskId);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    setIsSubmittingQuick(true);
    try {
      if (onSubmitQuickGoal) {
        await onSubmitQuickGoal(quickInput.trim());
      } else {
        onOpenGoalModal();
      }
      setQuickInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  const getStatusText = (status: Agent['status']) => {
    switch (status) {
      case 'working': return { text: 'Working autonomously', color: 'text-emerald-400', dot: 'bg-emerald-400' };
      case 'waiting_approval': return { text: 'Needs your approval', color: 'text-amber-400', dot: 'bg-amber-400' };
      case 'learning': return { text: 'Studying & practicing', color: 'text-cyan-400', dot: 'bg-cyan-400' };
      case 'paused': return { text: 'Paused', color: 'text-zinc-500', dot: 'bg-zinc-500' };
      default: return { text: 'Active & ready', color: 'text-zinc-400', dot: 'bg-zinc-400' };
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* 1. Primary Agent Status & Greeting (Section 4 Spec) */}
      {primaryAgent && (
        <div className="p-6 md:p-8 rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/70 via-zinc-900/30 to-zinc-950 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-medium text-zinc-500">{getGreeting()}</span>
              <div className="flex items-center gap-3 mt-1">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${primaryAgent.avatarColor} flex items-center justify-center text-white font-bold text-base shadow-md`}>
                  {primaryAgent.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                      {primaryAgent.name}
                    </h1>
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-750">
                      <span className={`w-2 h-2 rounded-full ${getStatusText(primaryAgent.status).dot} ${primaryAgent.status === 'working' ? 'animate-pulse' : ''}`} />
                      <span>{getStatusText(primaryAgent.status).text}</span>
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{primaryAgent.specialization}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions for Primary Agent */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectAgent(primaryAgent.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition-all shadow"
              >
                <MessageSquare className="w-3.5 h-3.5 text-zinc-950" />
                <span>Talk to {primaryAgent.name}</span>
              </button>
            </div>
          </div>

          {/* Active Goal / Progress Box */}
          {primaryGoal ? (
            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Current Goal</span>
                <h2 className="text-base md:text-lg font-bold text-white">"{primaryGoal.title}"</h2>
                <div className="text-xs text-zinc-300">
                  Currently: <strong className="text-zinc-100 font-medium">{primaryTask?.title || primaryGoal.description}</strong>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <span>Progress</span>
                  <span className="font-bold text-emerald-400">{primaryGoal.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${primaryGoal.progress}%` }} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-zinc-950/40 border border-zinc-850/60 text-xs text-zinc-400 text-center">
              {primaryAgent.name} is currently studying and preparing for your next goal.
            </div>
          )}

          {/* While You Were Away & Needs You (Section 4 spec) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-850/80">
            {/* While You Were Away */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>While you were away</span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Finished competitor research & architecture plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Created responsive core interface in workspace</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Saved 2 permanent validated know-how rules</span>
                </li>
              </ul>
            </div>

            {/* Needs You Box */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Needs from you</span>
              </div>
              {pendingApprovals.length > 0 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2">
                  <div><strong>{pendingApprovals.length} Action required:</strong> {pendingApprovals[0].title}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onResolveApproval(pendingApprovals[0].id, 'approved')}
                      className="px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold text-[11px] shadow"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onResolveApproval(pendingApprovals[0].id, 'rejected')}
                      className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-[11px]"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-850 text-xs text-zinc-400 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nothing needed. Your agent is taking care of everything.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Simple Outcome Prompt ("What would you like your agent to take care of?") */}
      <div className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white">Give Your Agent a Goal</h2>
          <p className="text-xs text-zinc-400">
            Tell your agent what outcome you want. It plans, writes code, tests, and continues working even after you close the tab.
          </p>
        </div>

        <form onSubmit={handleQuickSubmit} className="relative flex items-center">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="e.g. Build me a high-converting website for my new venture..."
            className="w-full pl-4 pr-32 py-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/80 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-sans shadow-inner"
          />
          <button
            type="submit"
            disabled={!quickInput.trim() || isSubmittingQuick}
            className="absolute right-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow"
          >
            <span>{isSubmittingQuick ? 'Planning...' : 'Give Goal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* 1-Click Suggestions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-zinc-500 font-medium">Quick ideas:</span>
          {[
            'Launch product landing page',
            'Run automated security audit',
            'Research market competitors',
            'Optimize page load speed'
          ].map((idea, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setQuickInput(idea)}
              className="px-3 py-1 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white transition-all font-medium"
            >
              {idea}
            </button>
          ))}
        </div>
      </div>

      {/* 3. All Agents Overview (Clean Card Grid with Progressive Disclosure) */}
      <div className="space-y-4 pt-4 border-t border-zinc-850">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Your Persistent Agents ({agentsList.length})</h2>
            <p className="text-xs text-zinc-400">Autonomous workers that persist and learn across projects</p>
          </div>
          <button
            onClick={() => onSelectAgent(agentsList[0]?.id || '')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentsList.map((agent) => {
            const currentGoal = goalsList.find(g => g.id === agent.currentGoalId);
            const statusInfo = getStatusText(agent.status);
            const isExpanded = expandedAgentId === agent.id;

            return (
              <div
                key={agent.id}
                className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow`}>
                        {agent.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 
                            onClick={() => onSelectAgent(agent.id)}
                            className="font-bold text-sm text-white hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {agent.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {agent.specialization}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleAgentPause(agent.id, agent.status)}
                      className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      title={agent.status === 'paused' ? 'Resume agent' : 'Pause agent'}
                    >
                      {agent.status === 'paused' ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Goal or Learning summary */}
                  <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-850 text-xs">
                    {currentGoal ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-medium text-zinc-200">
                          <span className="truncate">{currentGoal.title}</span>
                          <span className="font-mono text-emerald-400">{currentGoal.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${currentGoal.progress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <div className="text-zinc-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Studying & practicing capabilities autonomously</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono text-[11px]">
                    {agent.skills.length} skills &bull; {agent.knowHowCount} lessons learned
                  </span>

                  <button
                    onClick={() => onSelectAgent(agent.id)}
                    className="flex items-center gap-1 font-bold text-white hover:text-blue-400 transition-colors"
                  >
                    <span>Talk to {agent.name}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
