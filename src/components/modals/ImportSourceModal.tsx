'use client';

import React, { useState } from 'react';
import { X, GitBranch, BookOpen, Bot, Layers, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { ContinuumState } from '@/lib/types';

interface ImportSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ContinuumState;
  defaultAgentId?: string;
  onImportSuccess: () => void;
}

export function ImportSourceModal({
  isOpen,
  onClose,
  state,
  defaultAgentId,
  onImportSuccess
}: ImportSourceModalProps) {
  const [selectedAgentId, setSelectedAgentId] = useState(defaultAgentId || state.agents[0]?.id || '');
  const [sourceType, setSourceType] = useState<'github' | 'documentation' | 'research_paper'>('github');
  const [repoUrl, setRepoUrl] = useState('');
  const [repoName, setRepoName] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const quickPresets = [
    { name: 'vercel/next.js', url: 'https://github.com/vercel/next.js', author: 'Vercel Team', type: 'github' as const },
    { name: 'facebook/react', url: 'https://github.com/facebook/react', author: 'Meta & React Community', type: 'github' as const },
    { name: 'OWASP Top 10 Security Standard', url: 'https://owasp.org/www-project-top-ten/', author: 'OWASP Foundation', type: 'documentation' as const }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/import/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          repoUrl: repoUrl.trim(),
          repoName: repoName.trim() || undefined,
          author: author.trim() || undefined
        })
      });

      if (res.ok) {
        onImportSuccess();
        onClose();
        setRepoUrl('');
        setRepoName('');
        setAuthor('');
      }
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-white border border-zinc-700">
              <GitBranch className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white tracking-tight">Import Learning Material (GitHub / Docs)</h3>
              <p className="text-xs text-zinc-400">
                Provide external materials for your agent to study and extract know-how.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Strict Provenance Principle Notice */}
          <div className="p-3.5 rounded-xl border border-blue-900/40 bg-blue-950/20 text-blue-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-blue-200">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Core Principle: Provenance & Experience Separation</span>
            </div>
            <p className="text-[11px] text-blue-300/80 leading-relaxed">
              Importing repositories expands the agent's <strong>studied learning material</strong>, but does not count as agent-executed project experience or inflate reputation. Experience must be earned through verified work.
            </p>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-zinc-400 mb-1.5 font-medium">Quick Examples to Study</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {quickPresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setRepoName(p.name);
                    setRepoUrl(p.url);
                    setAuthor(p.author);
                    setSourceType(p.type);
                  }}
                  className="text-left p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-colors"
                >
                  <div className="font-semibold text-zinc-200 truncate">{p.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 truncate">{p.author}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Agent */}
          <div>
            <label className="block text-zinc-300 mb-1.5 font-medium flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-blue-400" />
              <span>Assign Studying Agent</span>
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white focus:outline-none focus:border-zinc-500"
            >
              {state.agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-zinc-300 mb-1.5 font-medium">
              Source Repository or Documentation URL
            </label>
            <input
              type="url"
              required
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/organization/repository"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-sans"
            />
          </div>

          {/* Repository Name & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Repository / Document Title</label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="e.g. vercel/next.js"
                className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 font-sans"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Original Author / Owner</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Vercel Team"
                className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 font-sans"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !repoUrl.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-bold transition-all disabled:opacity-50 shadow"
            >
              <span>{isSubmitting ? 'Analyzing & Studying...' : 'Study Repository'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
