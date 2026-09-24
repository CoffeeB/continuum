'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  BookOpen, 
  ShieldAlert, 
  Bot, 
  Clock, 
  Cpu, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ContinuumState } from '@/lib/types';

interface ActivityViewProps {
  state: ContinuumState;
}

export function ActivityView({ state }: ActivityViewProps) {
  const [filter, setFilter] = useState<'all' | 'work' | 'learning' | 'approvals'>('all');

  const activityList = state.activity || [];
  const agentsList = state.agents || [];

  const filteredActivity = activityList.filter((act) => {
    if (filter === 'work') return act.type.includes('TASK') || act.type.includes('GOAL');
    if (filter === 'learning') return act.type.includes('LEARN') || act.type.includes('KNOW_HOW');
    if (filter === 'approvals') return act.type.includes('APPROVAL');
    return true;
  });

  const getEventIcon = (type: string) => {
    if (type.includes('GOAL') || type.includes('COMPLETED')) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (type.includes('LEARN') || type.includes('KNOW_HOW')) return <BookOpen className="w-4 h-4 text-cyan-400" />;
    if (type.includes('APPROVAL')) return <ShieldAlert className="w-4 h-4 text-amber-400" />;
    if (type.includes('MODEL')) return <Cpu className="w-4 h-4 text-purple-400" />;
    return <Zap className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-850 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Activity Timeline</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live record of what your agents are accomplishing and learning in the background.
            </p>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'All Activity' },
              { id: 'work', label: 'Work & Goals' },
              { id: 'learning', label: 'Learning Cycles' },
              { id: 'approvals', label: 'Approvals' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as typeof filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  filter === tab.id
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3">
        {filteredActivity.length > 0 ? (
          filteredActivity.map((act) => {
            const agent = agentsList.find(a => a.id === act.agentId);

            return (
              <div
                key={act.id}
                className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 flex items-start justify-between gap-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0 mt-0.5">
                    {getEventIcon(act.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {agent ? agent.name : 'Continuum Engine'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                        {act.type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="font-medium text-xs text-zinc-200">
                      {act.title}
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      {act.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono text-[10px] text-zinc-500 pt-1">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
            No activity found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
