'use client';

import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  Code,
  GitBranch,
  FolderLock,
  FileText,
  Layers,
  Info
} from 'lucide-react';
import { ContinuumState, KnowHow, Memory, ImportedSource, HumanContext } from '@/lib/types';

interface KnowledgeViewProps {
  state: ContinuumState;
  onOpenImportModal?: () => void;
}

export function KnowledgeView({ state, onOpenImportModal }: KnowledgeViewProps) {
  const [activeLayer, setActiveLayer] = useState<'knowhow' | 'imported' | 'human_context' | 'memory'>('knowhow');
  const [searchQuery, setSearchQuery] = useState('');

  const knowHowList = state.knowHow || [];
  const importedSourcesList = state.importedSources || [];
  const humanContextsList = state.humanContexts || [];
  const memoriesList = state.memories || [];
  const agentsList = state.agents || [];

  const filteredKnowHow = knowHowList.filter(kh => 
    kh.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    kh.problemPattern.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSources = importedSourcesList.filter(src => 
    src.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    src.originalAuthor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (src.technologies || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredContexts = humanContextsList.filter(ctx => 
    ctx.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ctx.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMemories = memoriesList.filter(mem => 
    mem.summary.toLowerCase().includes(searchQuery.toLowerCase()) || 
    mem.eventType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header & Three Layers Concept */}
      <div className="pb-4 border-b border-zinc-850 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <BrainCircuit className="w-5 h-5 text-cyan-400" />
              <span>Agent Brain & Three-Layer Knowledge Base</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Strict separation between <strong>Human Context</strong>, <strong>Imported Material (Studied)</strong>, and <strong>Agent Validated Know-How</strong>.
            </p>
          </div>

          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-750 shrink-0"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>+ Import GitHub / Docs</span>
            </button>
          )}
        </div>

        {/* Layer Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2">
          {[
            { id: 'knowhow', label: `Validated Know-How (${knowHowList.length})`, icon: BookOpen, color: 'text-cyan-400' },
            { id: 'imported', label: `Imported Knowledge (${importedSourcesList.length})`, icon: GitBranch, color: 'text-purple-400' },
            { id: 'human_context', label: `Human Context (${humanContextsList.length})`, icon: FolderLock, color: 'text-blue-400' },
            { id: 'memory', label: `Episodic Memory (${memoriesList.length})`, icon: Clock, color: 'text-zinc-400' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeLayer === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveLayer(tab.id as typeof activeLayer)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search patterns, repositories, rules, contexts..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
        />
      </div>

      {/* Layer Content */}
      <div className="space-y-4">
        {/* Layer 1: Validated Know-How */}
        {activeLayer === 'knowhow' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-cyan-500/20 bg-cyan-950/10 text-xs text-cyan-300">
              <strong>Validated Know-How:</strong> Knowledge the agent has successfully applied and verified through execution. Reusable across all projects.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredKnowHow.map((kh) => {
                const agent = agentsList.find(a => a.id === kh.agentId);
                return (
                  <div key={kh.id} className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {kh.domain}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{kh.confidenceScore}% Validated</span>
                      </div>
                      <h3 className="font-bold text-sm text-white">{kh.title}</h3>
                      <p className="text-xs text-zinc-300">{kh.problemPattern}</p>
                      {kh.reusableCodeOrRule && (
                        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                          {kh.reusableCodeOrRule}
                        </div>
                      )}
                    </div>
                    <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>Agent: {agent?.name}</span>
                      <span>Times Applied: {kh.timesApplied}x</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Layer 2: Imported Sources */}
        {activeLayer === 'imported' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-950/10 text-xs text-purple-300">
              <strong>Imported Knowledge:</strong> External material (GitHub repos, documentation, research papers) studied by the agent. (Not agent-created projects).
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSources.map((source) => {
                const agent = agentsList.find(a => a.id === source.agentId);
                return (
                  <div key={source.id} className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          <GitBranch className="w-4 h-4 text-purple-400" />
                          <span>{source.title}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">Author: {source.originalAuthor}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase">
                        {source.relationship}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {source.technologies.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300">
                          {t}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-zinc-400 italic bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                      "{source.provenanceSummary}"
                    </p>

                    <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>Studied by: <strong className="text-zinc-300">{agent?.name}</strong></span>
                      <span>Imported: {new Date(source.importedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Layer 3: Human Context */}
        {activeLayer === 'human_context' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-950/10 text-xs text-blue-300">
              <strong>Human Context:</strong> Information provided by you (company documents, preferences, project constraints) to guide agents without becoming their experience.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContexts.map((ctx) => (
                <div key={ctx.id} className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{ctx.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-blue-400 uppercase">
                      {ctx.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">{ctx.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layer 4: Episodic Memory */}
        {activeLayer === 'memory' && (
          <div className="space-y-2.5">
            {filteredMemories.map((mem) => {
              const agent = agentsList.find(a => a.id === mem.agentId);
              return (
                <div key={mem.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300">
                        {mem.eventType}
                      </span>
                      <span className="text-xs font-semibold text-white">{agent?.name}</span>
                    </div>
                    <p className="text-xs text-zinc-300">{mem.summary}</p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">{new Date(mem.timestamp).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
