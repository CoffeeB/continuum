'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Cpu, 
  Bot, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { ContinuumState, Task, TaskStatus } from '@/lib/types';

interface TasksViewProps {
  state: ContinuumState;
  onOpenGoalModal: () => void;
}

export function TasksView({ state, onOpenGoalModal }: TasksViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const filteredTasks = state.tasks.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const activeTask = state.tasks.find(t => t.id === selectedTaskId) || state.tasks[0];

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">completed</span>;
      case 'executing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">executing</span>;
      case 'waiting':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">waiting approval</span>;
      case 'queued':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400">queued</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Task List Panel */}
      <div className="w-full lg:w-96 border-r border-zinc-800 bg-zinc-950/60 flex flex-col shrink-0 overflow-y-auto">
        {/* Header & Filter */}
        <div className="p-4 border-b border-zinc-850 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white">Task System</h2>
            <button
              onClick={onOpenGoalModal}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              + Define Goal
            </button>
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['all', 'executing', 'queued', 'waiting', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono capitalize transition-colors shrink-0 ${
                  filterStatus === st
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div className="p-3 space-y-2 flex-1">
          {filteredTasks.map((task) => {
            const isSelected = activeTask?.id === task.id;
            const assignedAgent = state.agents.find(a => a.id === task.assignedAgentId);

            return (
              <button
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className={`w-full text-left p-3.5 rounded-xl transition-all border space-y-2 ${
                  isSelected
                    ? 'bg-zinc-850 border-zinc-700 text-white shadow-md'
                    : 'bg-zinc-900/40 border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="mt-0.5">
                      {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {task.status === 'executing' && <Clock className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                      {task.status === 'queued' && <Clock className="w-3.5 h-3.5 text-zinc-500" />}
                      {task.status === 'waiting' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div className="font-semibold text-xs text-white truncate">{task.title}</div>
                  </div>
                  {getStatusBadge(task.status)}
                </div>

                <div className="text-[11px] text-zinc-400 line-clamp-2">
                  {task.description}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
                  <span>Agent: <strong className="text-zinc-300">{assignedAgent?.name}</strong></span>
                  <span>{task.costCredits} / {task.budget} cr</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Details & Verification Card */}
      <div className="flex-1 flex flex-col bg-zinc-950 overflow-y-auto p-6 space-y-6">
        {activeTask ? (
          <div className="space-y-6 max-w-4xl">
            {/* Task Title & State Header */}
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-500">ID: {activeTask.id}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                      Priority: {activeTask.priority}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-white tracking-tight mt-1">{activeTask.title}</h1>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(activeTask.status)}
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {activeTask.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] font-mono text-zinc-400">
                <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-850">
                  <span className="text-zinc-500 block text-[10px]">Assigned Agent</span>
                  <span className="text-zinc-200 font-semibold">{state.agents.find(a => a.id === activeTask.assignedAgentId)?.name}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-850">
                  <span className="text-zinc-500 block text-[10px]">Model Runtime</span>
                  <span className="text-purple-400 font-semibold">{activeTask.modelUsed}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-850">
                  <span className="text-zinc-500 block text-[10px]">Credit Consumption</span>
                  <span className="text-yellow-400 font-semibold">{activeTask.costCredits} / {activeTask.budget} cr</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-850">
                  <span className="text-zinc-500 block text-[10px]">Verification State</span>
                  <span className="text-emerald-400 font-semibold uppercase">{activeTask.verificationState}</span>
                </div>
              </div>
            </div>

            {/* Requirements & Constraints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Requirements</h3>
                <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1 pl-1">
                  {activeTask.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Constraints & Scope Bounds</h3>
                <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1 pl-1">
                  {activeTask.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Task Execution Result & Verification Evidence */}
            {activeTask.result && (
              <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Execution Output & Evidence</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {activeTask.result}
                </p>
                {activeTask.verificationEvidence && (
                  <div className="p-3 rounded-lg bg-zinc-950/80 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
                    Evidence: {activeTask.verificationEvidence}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-500">
            Select a task to inspect execution state and verification.
          </div>
        )}
      </div>
    </div>
  );
}
