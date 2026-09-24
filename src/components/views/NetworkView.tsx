'use client';

import React, { useState } from 'react';
import { 
  Network, 
  Bot, 
  Send, 
  ShieldCheck, 
  Coins, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  FileCode,
  Lock,
  Layers
} from 'lucide-react';
import { ContinuumState, WorkPacket } from '@/lib/types';

interface NetworkViewProps {
  state: ContinuumState;
  onSendWorkPacket: (packetData: {
    requestingAgentId: string;
    requestedAgentId: string;
    taskTitle: string;
    context: string;
    constraints: string[];
    expectedOutput: string;
    budget: number;
  }) => Promise<{ requiresApproval: boolean; message?: string }>;
}

export function NetworkView({ state, onSendWorkPacket }: NetworkViewProps) {
  const agentsList = state.agents || [];
  const workPacketsList = state.workPackets || [];
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>('agent_aegis_sec');
  const [requestingAgentId, setRequestingAgentId] = useState<string>(agentsList[0]?.id || '');
  const [taskTitle, setTaskTitle] = useState('');
  const [context, setContext] = useState('');
  const [budget, setBudget] = useState(30);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'warn' } | null>(null);

  const specialists = [
    {
      id: 'agent_aegis_sec',
      name: 'Aegis',
      specialization: 'Security & Permission Boundary Auditing',
      rating: 99,
      verifiedProjects: 44,
      costPerTask: 30,
      description: 'Independent OWASP Top 10 vulnerability detection and cryptographic token verification.'
    },
    {
      id: 'agent_vortex_perf',
      name: 'Vortex',
      specialization: 'Runtime Performance & Bundle Optimization',
      rating: 98,
      verifiedProjects: 38,
      costPerTask: 25,
      description: 'Zero-overhead memory profiling, React Server Component bundle minimization, and V8 optimization.'
    },
    {
      id: 'agent_cipher_crypto',
      name: 'Cipher',
      specialization: 'Zero-Knowledge & Cryptographic Protocol Architect',
      rating: 97,
      verifiedProjects: 29,
      costPerTask: 40,
      description: 'End-to-end encryption proofs, deterministic key derivation, and multi-tenant isolation.'
    }
  ];

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsSending(true);
    setFeedback(null);
    try {
      const res = await onSendWorkPacket({
        requestingAgentId,
        requestedAgentId: selectedSpecialistId,
        taskTitle: taskTitle.trim(),
        context: context.trim(),
        constraints: ['Read-only workspace scope', 'Cryptographic evidence required'],
        expectedOutput: 'Verified artifact report and signed compliance certificate.',
        budget
      });

      if (res.requiresApproval) {
        setFeedback({
          type: 'warn',
          text: 'WorkPacket exceeds autonomous threshold: Queued for Human Approval before releasing credits.'
        });
      } else {
        setFeedback({
          type: 'success',
          text: `WorkPacket dispatched to ${selectedSpecialistId}. ${budget} credits escrowed successfully.`
        });
      }

      setTaskTitle('');
      setContext('');
    } catch (err) {
      console.error('WorkPacket error:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-850">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Network className="w-5 h-5 text-indigo-400" />
          <span>Agent Network & Structured WorkPacket Protocol</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Section 15 & 16: Agents collaborate across the network through formal JSON WorkPackets, credit escrows, and verified output exchanges rather than informal chat prompts.
        </p>
      </div>

      {/* Grid: Dispatch Form (Left) & Specialist Directory (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Form (1 col) */}
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400">
            <Send className="w-4 h-4" />
            <span>Dispatch WorkPacket</span>
          </div>

          {feedback && (
            <div className={`p-3 rounded-lg text-xs leading-relaxed ${
              feedback.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
            }`}>
              {feedback.text}
            </div>
          )}

          <form onSubmit={handleDispatch} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Requesting Agent (Sender)</label>
              <select
                value={requestingAgentId}
                onChange={(e) => setRequestingAgentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white"
              >
                {agentsList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.credits} cr available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Target Specialist Agent</label>
              <select
                value={selectedSpecialistId}
                onChange={(e) => setSelectedSpecialistId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white"
              >
                {specialists.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Work Title</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Audit permission boundaries and AST tokens"
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Work Context & Parameters</label>
              <textarea
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Provide constraints, target repo paths, expected schema..."
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 font-sans resize-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Escrow Credit Budget</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white font-mono"
                />
                <span className="text-zinc-400">credits</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending || !taskTitle.trim()}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Dispatching...' : 'Dispatch WorkPacket'}</span>
            </button>
          </form>
        </div>

        {/* Specialist Directory & Active WorkPackets (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specialist Directory */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Verified Network Specialists</span>
              <span className="text-emerald-400 font-mono text-[11px]">Continuum Open Network</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {specialists.map((spec) => (
                <div
                  key={spec.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    selectedSpecialistId === spec.id
                      ? 'border-indigo-500/50 bg-indigo-950/10'
                      : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{spec.name}</h4>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{spec.specialization}</div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{spec.rating}% Rep</span>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2">
                    {spec.description}
                  </p>

                  <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>{spec.verifiedProjects} Verified Projects</span>
                    <span className="text-yellow-400 font-semibold">{spec.costPerTask} cr / task</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active / Historical WorkPackets */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              WorkPacket Transaction Records ({workPacketsList.length})
            </div>

            <div className="space-y-2">
              {workPacketsList.map((wp) => (
                <div
                  key={wp.id}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-400">{wp.id}</span>
                      <span className="text-xs font-semibold text-white">{wp.taskTitle}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {wp.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                    <span>Sender: <strong className="text-zinc-300">{wp.requestingAgentId}</strong> &rarr; Receiver: <strong className="text-zinc-300">{wp.requestedAgentId}</strong></span>
                    <span className="text-yellow-400 font-semibold">{wp.budget} credits in escrow</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
