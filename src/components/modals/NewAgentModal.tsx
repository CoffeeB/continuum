'use client';

import React, { useState } from 'react';
import { X, Bot, Shield, Cpu, Coins, Plus, Check } from 'lucide-react';
import { ContinuumState } from '@/lib/types';
import { AVAILABLE_MODELS } from '@/lib/models';

interface NewAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ContinuumState;
  onSubmitAgent: (data: {
    name: string;
    purpose: string;
    specialization: string;
    initialCredits: number;
    initialModelId: string;
  }) => Promise<void>;
}

export function NewAgentModal({
  isOpen,
  onClose,
  onSubmitAgent
}: NewAgentModalProps) {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [specialization, setSpecialization] = useState('Full-Stack Software Development');
  const [initialCredits, setInitialCredits] = useState(1000);
  const [initialModelId, setInitialModelId] = useState('claude-3-7-sonnet');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !purpose.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitAgent({
        name: name.trim(),
        purpose: purpose.trim(),
        specialization,
        initialCredits,
        initialModelId
      });
      onClose();
      setName('');
      setPurpose('');
    } catch (err) {
      console.error('Failed to create agent:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white tracking-tight">Register Persistent AI Agent</h3>
              <p className="text-xs text-zinc-400">
                Create a persistent autonomous entity owned by your account.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Agent Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Agent Identity Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Orion, Cipher, Sentinel, Aegis"
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 font-sans"
            />
          </div>

          {/* Primary Specialization */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Core Specialization Domain
            </label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
            >
              <option value="Full-Stack Software Development">Full-Stack Software Development</option>
              <option value="Application Security & Cryptography">Application Security & Cryptography</option>
              <option value="Autonomous Market & Tech Research">Autonomous Market & Tech Research</option>
              <option value="Computer Vision & Multimodal Assets">Computer Vision & Multimodal Assets</option>
              <option value="DevOps & System Reliability">DevOps & System Reliability</option>
              <option value="Data Pipeline & Analytical Synthesis">Data Pipeline & Analytical Synthesis</option>
            </select>
          </div>

          {/* Core Purpose */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Mission / Purpose Definition
            </label>
            <textarea
              rows={3}
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Describe what this persistent agent is dedicated to accomplishing..."
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 resize-none font-sans"
            />
          </div>

          {/* Initial Model Runtime (Decoupled from Agent Identity) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                Initial Model Runtime
              </label>
              <select
                value={initialModelId}
                onChange={(e) => setInitialModelId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-500 mt-1">
                Model is replaceable anytime without erasing agent memory.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                Initial Credit Endowment
              </label>
              <input
                type="number"
                min="100"
                max="50000"
                step="100"
                value={initialCredits}
                onChange={(e) => setInitialCredits(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-white focus:outline-none focus:border-zinc-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Funded by your account ledger balance.
              </p>
            </div>
          </div>

          {/* Principle Reminder */}
          <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-900/60 text-xs text-zinc-400 space-y-1">
            <div className="font-medium text-zinc-300">Durable Identity Principle</div>
            <p className="text-[11px] text-zinc-400">
              This agent receives a stable UUID. Its accumulated know-how, skill certifications, memories, and reputation stay with the agent permanently regardless of model changes.
            </p>
          </div>

          {/* Submit */}
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
              disabled={isSubmitting || !name.trim() || !purpose.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold tracking-tight transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Registering...' : 'Register Agent'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
