'use client';

import React from 'react';
import { 
  Play, 
  Pause, 
  FastForward, 
  Moon, 
  Coins, 
  ShieldAlert, 
  Clock, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { ContinuumState } from '@/lib/types';

interface HeaderProps {
  state: ContinuumState;
  onStep: () => void;
  onToggleAuto: (running: boolean) => void;
  onOpenAwayModal: () => void;
  onOpenGoalModal: () => void;
  onResetState: () => void;
  isExecutingStep: boolean;
}

export function Header({
  state,
  onStep,
  onToggleAuto,
  onOpenAwayModal,
  onOpenGoalModal,
  onResetState,
  isExecutingStep
}: HeaderProps) {
  const approvalsList = state.approvals || [];
  const agentsList = state.agents || [];
  const pendingApprovals = approvalsList.filter(a => a.status === 'pending');
  const activeAgents = agentsList.filter(a => a.status === 'working' || a.status === 'learning' || a.status === 'verifying');
  const totalCredits = agentsList.reduce((acc, a) => acc + (a.credits || 0), 0);
  const completedTasksCount = state.awayDigest?.completedTasksCount || 0;

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Persistent Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-bold text-sm tracking-tighter shadow-sm">
            C∞
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">CONTINUUM</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                OS v2.4
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-zinc-800 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800">
            <span className={`w-2 h-2 rounded-full ${state.isRunningAutonomous ? 'bg-emerald-400 animate-subtle-pulse' : 'bg-amber-400'}`} />
            <span className="font-mono text-[11px]">
              {state.isRunningAutonomous ? 'Autonomous Engine Active' : 'Engine Paused'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-zinc-500">Active:</span>
            <span className="font-mono text-zinc-200">{activeAgents.length} Agents</span>
          </div>
        </div>
      </div>

      {/* Action Controls & Digested Alerts */}
      <div className="flex items-center gap-2">
        {/* Offline Summary / While You Were Away */}
        <button
          onClick={onOpenAwayModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/80 text-xs font-medium text-zinc-300 transition-all hover:text-white group"
          title="See autonomous progress made while you were away"
        >
          <Clock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400" />
          <span className="hidden sm:inline">While You Were Away</span>
          <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-mono font-semibold border border-blue-500/30">
            +{completedTasksCount}
          </span>
        </button>

        {/* Approvals notification */}
        {pendingApprovals.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-300 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono">{pendingApprovals.length} Approval{pendingApprovals.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Global Agent Credits */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300">
          <Coins className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-mono">{totalCredits.toLocaleString()} Credits</span>
        </div>

        {/* Step Runner & Toggle */}
        <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={onStep}
            disabled={isExecutingStep}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors disabled:opacity-50"
            title="Execute one autonomous loop step"
          >
            <FastForward className={`w-3.5 h-3.5 text-emerald-400 ${isExecutingStep ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Step Loop</span>
          </button>

          <button
            onClick={() => onToggleAuto(!state.isRunningAutonomous)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              state.isRunningAutonomous 
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
            title="Toggle autonomous background ticker"
          >
            {state.isRunningAutonomous ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Auto ON</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Auto OFF</span>
              </>
            )}
          </button>
        </div>

        {/* New Goal Button */}
        <button
          onClick={onOpenGoalModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold tracking-tight transition-colors shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
          <span>New Goal</span>
        </button>

        {/* Reset State Helper */}
        <button
          onClick={onResetState}
          className="p-1.5 rounded-lg border border-zinc-800/80 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          title="Reset Continuum OS state to default benchmark"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
