'use client';

import React from 'react';
import { Coins, ReceiptText, ShieldCheck, ArrowUpRight, ArrowDownLeft, Lock } from 'lucide-react';
import { ContinuumState } from '@/lib/types';

interface EconomyViewProps {
  state: ContinuumState;
}

export function EconomyView({ state }: EconomyViewProps) {
  const totalCirculation = state.agents.reduce((acc, a) => acc + a.credits, 0);
  const totalEscrowed = state.transactions.filter(t => t.status === 'escrowed').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-850">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <ReceiptText className="w-5 h-5 text-yellow-400" />
          <span>Internal Agent Economy & Immutable Credit Ledger</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Section 17: Continuum credits represent internal work/exchange units for model execution, specialist agent hiring, and verification rewards.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
          <div className="text-[11px] font-mono text-zinc-500 uppercase">Total Active Circulation</div>
          <div className="text-2xl font-bold text-yellow-400 font-mono">{totalCirculation.toLocaleString()} cr</div>
          <div className="text-[10px] text-zinc-500">Distributed across {state.agents.length} persistent agents</div>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
          <div className="text-[11px] font-mono text-zinc-500 uppercase">Funds in Escrow</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">{totalEscrowed} cr</div>
          <div className="text-[10px] text-zinc-500">Guaranteed for in-flight WorkPackets</div>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
          <div className="text-[11px] font-mono text-zinc-500 uppercase">Ledger Entries</div>
          <div className="text-2xl font-bold text-white font-mono">{state.transactions.length}</div>
          <div className="text-[10px] text-emerald-400">Append-only immutable audit</div>
        </div>
      </div>

      {/* Immutable Transactions Table */}
      <div className="space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Transaction Audit Journal ({state.transactions.length})
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] font-mono text-zinc-400 uppercase">
                <th className="p-3.5 pl-4">Tx ID</th>
                <th className="p-3.5">Sender</th>
                <th className="p-3.5">Receiver</th>
                <th className="p-3.5">Reason & Task</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 font-sans">
              {state.transactions.map((tx) => {
                const sender = state.agents.find(a => a.id === tx.senderId)?.name || tx.senderId;
                const receiver = state.agents.find(a => a.id === tx.receiverId)?.name || tx.receiverId;

                return (
                  <tr key={tx.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="p-3.5 pl-4 font-mono text-[11px] text-zinc-400">{tx.id}</td>
                    <td className="p-3.5 font-medium text-zinc-200">{sender}</td>
                    <td className="p-3.5 font-medium text-zinc-200">{receiver}</td>
                    <td className="p-3.5 text-zinc-300 max-w-md truncate">{tx.reason}</td>
                    <td className="p-3.5 font-mono font-bold text-yellow-400">
                      {tx.amount} cr
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        tx.status === 'settled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        tx.status === 'escrowed' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-4 text-right font-mono text-[11px] text-zinc-500">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
