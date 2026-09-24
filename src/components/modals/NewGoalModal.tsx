'use client';

import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, Layers, Bot, FolderPlus } from 'lucide-react';
import { ContinuumState } from '@/lib/types';

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ContinuumState;
  onSubmitGoal: (data: { agentId: string; title: string; description: string; projectId: string }) => Promise<void>;
}

export function NewGoalModal({
  isOpen,
  onClose,
  state,
  onSubmitGoal
}: NewGoalModalProps) {
  const [selectedAgentId, setSelectedAgentId] = useState(state.agents[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState(state.projects[0]?.id || '');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const quickTemplates = [
    {
      title: 'Build landing page for new company',
      desc: 'Research market benchmarks, engineer responsive Next.js hero, conduct security audit, and generate deploy package.'
    },
    {
      title: 'Perform comprehensive application security audit',
      desc: 'Verify permission tokens, test sandboxed agent execution boundaries, and sign verification compliance certificate.'
    },
    {
      title: 'Research AI agent economies and credit clearing models',
      desc: 'Synthesize market data, evaluate credit escrow mechanisms, and produce executive architecture brief.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitGoal({
        agentId: selectedAgentId,
        title: goalTitle.trim(),
        description: goalDescription.trim() || goalTitle.trim(),
        projectId: selectedProjectId
      });
      onClose();
      setGoalTitle('');
      setGoalDescription('');
    } catch (err) {
      console.error('Failed to create goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/10">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white tracking-tight">Define Human Outcome (New Goal)</h3>
              <p className="text-xs text-zinc-400">
                You define the outcome. The persistent agent determines tasks, tools, models, and execution order.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Quick Outcome Templates */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Quick Intent Templates
            </label>
            <div className="grid grid-cols-1 gap-2">
              {quickTemplates.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setGoalTitle(t.title);
                    setGoalDescription(t.desc);
                  }}
                  className="text-left p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-850 hover:border-zinc-700 transition-all text-xs group"
                >
                  <div className="font-medium text-zinc-200 group-hover:text-white">{t.title}</div>
                  <div className="text-zinc-400 text-[11px] line-clamp-1 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Persistent Agent & Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                Assign Persistent Agent
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                {state.agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} — {agent.specialization} ({agent.credits} cr)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
                Project Workspace
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                {state.projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Goal Outcome Title */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Desired Outcome (What do you want achieved?)
            </label>
            <input
              type="text"
              required
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Build me a high-converting landing page with security verification"
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 font-sans"
            />
          </div>

          {/* Goal Context / Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Requirements, Constraints & Strategic Context
            </label>
            <textarea
              rows={3}
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="Provide constraints, brand requirements, budget limits, or target deliverables..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 resize-none font-sans"
            />
          </div>

          {/* Principle Note */}
          <div className="p-3 rounded-lg border border-blue-900/40 bg-blue-950/20 text-xs text-blue-300/90 flex items-start gap-2">
            <Layers className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>Principle 1 in Action:</strong> Continuum's Execution Engine will immediately decompose this outcome into a structured task graph, assign optimal model runtimes, and execute continuously in the background.
            </span>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !goalTitle.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold tracking-tight transition-colors disabled:opacity-50 shadow-md"
            >
              <span>{isSubmitting ? 'Decomposing Goal...' : 'Launch Autonomous Goal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
