'use client';

import React from 'react';
import { Cpu, CheckCircle2, Zap, DollarSign, Shield, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { ContinuumState } from '@/lib/types';

interface ModelsViewProps {
  state: ContinuumState;
}

export function ModelsView({ state }: ModelsViewProps) {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-850">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-purple-400" />
          <span>Model Provider Adapter & Router Layer</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Principle 3 & Section 20: The AI model is NOT the agent. The model is an exchangeable execution runtime. When models change, agent identity, memory, skills, and projects remain 100% intact.
        </p>
      </div>

      {/* Principle 20 Demonstration Box */}
      <div className="p-5 rounded-xl border border-purple-500/30 bg-purple-950/15 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>The Independence Principle</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span className="text-zinc-400 font-mono text-[10px] uppercase">Day 1</span>
            <div className="font-semibold text-white">Agent Uses Claude 3.7 Sonnet</div>
            <p className="text-zinc-400 text-[11px]">Decomposes landing page architecture, creates TypeScript component tree.</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span className="text-zinc-400 font-mono text-[10px] uppercase">Day 20</span>
            <div className="font-semibold text-amber-400">Claude Provider Unavailable</div>
            <p className="text-zinc-400 text-[11px]">Model Router seamlessly falls back to GPT-4o or DeepSeek R1.</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span className="text-zinc-400 font-mono text-[10px] uppercase">Result</span>
            <div className="font-semibold text-emerald-400">Zero Memory Loss</div>
            <p className="text-zinc-400 text-[11px]">Agent retains exact project state, past decisions, verified skills, and know-how.</p>
          </div>
        </div>
      </div>

      {/* Model Adapters Matrix */}
      <div className="space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Configured Model Provider Adapters ({state.modelProviders.length})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.modelProviders.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300">
                      {m.provider}
                    </span>
                    <h3 className="font-bold text-sm text-white mt-1.5">{m.name}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{m.reliabilityScore}%</span>
                  </span>
                </div>

                <div className="text-xs font-medium text-purple-300">
                  {m.specialization}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {m.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-zinc-400 border-t border-zinc-850">
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Avg Latency</span>
                    <span className="text-zinc-200">{m.avgLatencyMs} ms</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Execution Cost</span>
                    <span className="text-yellow-400">{m.costPer1kCredits} cr / 1k</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Context: {m.contextWindow}</span>
                <span className="text-emerald-400">Runtime Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
