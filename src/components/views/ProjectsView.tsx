'use client';

import React, { useState } from 'react';
import { 
  FolderKanban, 
  FileCode, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Copy, 
  Check, 
  Bot, 
  Coins, 
  Folder, 
  Sparkles,
  Plus
} from 'lucide-react';
import { ContinuumState, Project, ProjectFile } from '@/lib/types';

interface ProjectsViewProps {
  state: ContinuumState;
  onOpenGoalModal: () => void;
}

export function ProjectsView({ state, onOpenGoalModal }: ProjectsViewProps) {
  const projectsList = state.projects || [];
  const agentsList = state.agents || [];
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectsList[0]?.id || '');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const currentProject = projectsList.find(p => p.id === selectedProjectId) || projectsList[0];
  const activeFile = (currentProject?.files || []).find(f => f.id === selectedFileId) || (currentProject?.files || [])[0];

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  if (!currentProject) {
    return (
      <div className="p-12 text-center text-zinc-500">
        No active projects found.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left Projects & Files Explorer */}
      <div className="w-full lg:w-80 border-r border-zinc-800 bg-zinc-950/60 flex flex-col shrink-0 overflow-y-auto">
        {/* Project Selector Header */}
        <div className="p-4 border-b border-zinc-850 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-500">Project Workspace</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400">
              {currentProject.status}
            </span>
          </div>

          <select
            value={currentProject.id}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedFileId(null);
            }}
            className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-semibold text-white focus:outline-none focus:border-zinc-500"
          >
            {projectsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <p className="text-[11px] text-zinc-400 line-clamp-2">
            {currentProject.description}
          </p>

          <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-500">
            <span>Spent: <strong className="text-yellow-400">{currentProject.spentCredits} cr</strong></span>
            <span>Budget: {currentProject.budget} cr</span>
          </div>
        </div>

        {/* Generated Workspace Files Tree */}
        <div className="p-3 space-y-1 flex-1">
          <div className="px-2 py-1.5 text-[11px] font-mono uppercase text-zinc-500 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-blue-400" />
            <span>Generated Workspace Files ({(currentProject.files || []).length})</span>
          </div>

          {(currentProject.files || []).map((file) => {
            const isSelected = activeFile?.id === file.id;
            const creatorAgent = agentsList.find(a => a.id === file.createdByAgentId);

            return (
              <button
                key={file.id}
                onClick={() => setSelectedFileId(file.id)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start justify-between gap-2 border ${
                  isSelected
                    ? 'bg-zinc-850 border-zinc-700 text-white shadow-sm'
                    : 'bg-zinc-900/40 border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`} />
                  <div className="truncate">
                    <div className="font-mono text-xs truncate">{file.name}</div>
                    <div className="text-[10px] text-zinc-500 truncate mt-0.5">{file.path}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                  {creatorAgent?.name.slice(0, 4)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Assigned Collaborating Agents */}
        <div className="p-4 border-t border-zinc-850 bg-zinc-950 space-y-2">
          <div className="text-[11px] font-mono uppercase text-zinc-500">Collaborating Agents</div>
          <div className="flex flex-wrap gap-1.5">
            {(currentProject.assignedAgentIds || []).map((agentId) => {
              const agent = agentsList.find(a => a.id === agentId);
              return (
                <span
                  key={agentId}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300"
                >
                  <Bot className="w-3 h-3 text-indigo-400" />
                  <span>{agent?.name || agentId}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right File Code Viewer & Decisions Log */}
      <div className="flex-1 flex flex-col bg-zinc-950 overflow-y-auto">
        {activeFile ? (
          <div className="flex-1 flex flex-col">
            {/* File Viewer Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="font-mono text-xs font-semibold text-white">{activeFile.path}</span>
                  <span className="text-[10px] text-zinc-400 block">
                    Created by agent <code className="text-zinc-300 font-mono">{activeFile.createdByAgentId}</code> on {new Date(activeFile.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(activeFile.content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy File</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="p-6 flex-1 bg-zinc-950 overflow-x-auto">
              <pre className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-200 leading-relaxed overflow-x-auto">
                <code>{activeFile.content}</code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-500">
            Select a generated file from the explorer to inspect code and architecture.
          </div>
        )}

        {/* Architectural Decisions Log */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Persistent Architectural Decisions Log ({currentProject.decisions.length})</span>
            </h3>
            <span className="text-[11px] text-zinc-500">Decisions persist across model changes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentProject.decisions.map((dec) => {
              const agent = state.agents.find(a => a.id === dec.agentId);
              return (
                <div key={dec.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{dec.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase">
                      {dec.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {dec.rationale}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-850 text-[10px] font-mono text-zinc-500">
                    <span>Agent: {agent?.name} ({dec.modelUsed})</span>
                    <span>{new Date(dec.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
