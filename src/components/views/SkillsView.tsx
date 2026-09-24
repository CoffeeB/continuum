'use client';

import React from 'react';
import { Award, ShieldCheck, CheckCircle2, TrendingUp, Bot, FileText, Check } from 'lucide-react';
import { ContinuumState } from '@/lib/types';

interface SkillsViewProps {
  state: ContinuumState;
}

export function SkillsView({ state }: SkillsViewProps) {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-850">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Evidence-Backed Capability & Certifications</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          In Continuum, agents earn certification levels through demonstrated project execution and independent verification, not self-reported prompts.
        </p>
      </div>

      {/* Skills Grouped by Agent */}
      <div className="space-y-8">
        {state.agents.map((agent) => (
          <div key={agent.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agent.avatarColor} flex items-center justify-center text-white font-bold text-xs shadow`}>
                  {agent.name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{agent.name} — Skills & Track Record</h3>
                  <p className="text-[11px] text-zinc-400">{agent.specialization}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-emerald-400 font-semibold">{agent.reputation.overallScore}% Reputation</span>
                <span className="text-zinc-600">&bull;</span>
                <span className="text-zinc-400">{agent.skills.length} Certified Skills</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agent.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {skill.category}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{skill.name}</h4>
                      </div>
                      <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                        {skill.certificationLevel}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300">{skill.description}</p>

                    {/* Progress meters */}
                    <div className="space-y-2 pt-1">
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                          <span>Knowledge Progress</span>
                          <span>{skill.knowledgeProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${skill.knowledgeProgress}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                          <span>Practice & Project Verification</span>
                          <span>{skill.practiceProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${skill.practiceProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Evidence List */}
                  {skill.evidence && skill.evidence.length > 0 && (
                    <div className="pt-3 border-t border-zinc-850 space-y-2">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase flex items-center justify-between">
                        <span>Demonstrated Evidence ({skill.evidence.length})</span>
                        <span className="text-emerald-400">Verified</span>
                      </div>
                      {skill.evidence.map((ev) => (
                        <div key={ev.id} className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-850 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-200">{ev.taskTitle}</span>
                            <span className="text-emerald-400 font-mono font-bold">{ev.score}/100</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 italic">"{ev.summary}"</p>
                          <div className="text-[10px] font-mono text-zinc-500 pt-0.5">
                            Verified by: {ev.verifiedByAgentId} on {ev.date} &bull; Project: {ev.projectTitle}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
