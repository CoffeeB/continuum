'use client';

import React from 'react';
import { X, Clock, CheckCircle, BookOpen, Share2, AlertTriangle, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { ContinuumState } from '@/lib/types';

interface WhileYouWereAwayModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ContinuumState;
  onReviewApprovals: () => void;
}

export function WhileYouWereAwayModal({
  isOpen,
  onClose,
  state,
  onReviewApprovals
}: WhileYouWereAwayModalProps) {
  if (!isOpen) return null;

  const { awayDigest } = state;
  const pendingApprovals = state.approvals.filter(a => a.status === 'pending');

  const getHighlightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'learning': return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'collab': return <Share2 className="w-4 h-4 text-indigo-400" />;
      case 'approval': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default: return <Zap className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-white tracking-tight">While You Were Away</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Persistent Runtime
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Summary of autonomous actions executed while the browser was closed.
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

        {/* Digest Overview Stats */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/60">
              <div className="text-[11px] font-mono text-zinc-500 uppercase">Tasks Completed</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">+{awayDigest.completedTasksCount}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Verified outputs</div>
            </div>

            <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/60">
              <div className="text-[11px] font-mono text-zinc-500 uppercase">Know-how Learned</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">+{awayDigest.knowHowLearnedCount}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Permanent patterns</div>
            </div>

            <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/60">
              <div className="text-[11px] font-mono text-zinc-500 uppercase">Credits Spent</div>
              <div className="text-xl font-bold text-yellow-400 mt-1">{awayDigest.creditsSpent} cr</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Model execution</div>
            </div>

            <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/60">
              <div className="text-[11px] font-mono text-zinc-500 uppercase">Awaiting Sign-off</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{pendingApprovals.length}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Human approvals</div>
            </div>
          </div>

          {/* Timeline of Offline Events */}
          <div className="space-y-2.5">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Autonomous Activity Stream</span>
              <span className="text-[11px] text-zinc-500">Last 24 Hours</span>
            </div>

            <div className="space-y-2">
              {awayDigest.highlights.map((h, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors"
                >
                  <div className="p-1.5 rounded-md bg-zinc-800/80 border border-zinc-700/50 mt-0.5">
                    {getHighlightIcon(h.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-200">
                        {h.agentName}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {h.timeAgo}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      {h.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approval Callout if any */}
          {pendingApprovals.length > 0 && (
            <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-amber-300">
                    {pendingApprovals.length} Action{pendingApprovals.length > 1 ? 's' : ''} Require Human Authorization
                  </div>
                  <div className="text-[11px] text-amber-400/80">
                    Agents paused high-stakes actions to respect your bounded permission policy.
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onReviewApprovals();
                }}
                className="px-3 py-1.5 rounded-md bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs transition-colors shrink-0"
              >
                Review Queue
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500">
            Continuum Runtime persists automatically on the server.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Dismiss Digest
          </button>
        </div>
      </div>
    </div>
  );
}
