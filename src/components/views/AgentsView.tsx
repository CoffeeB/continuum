'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Layers, 
  FolderKanban, 
  Award, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  GitBranch, 
  BookOpen, 
  Play, 
  Pause, 
  Shield, 
  Cpu, 
  ArrowRight,
  Info,
  Check,
  Zap,
  RefreshCw
} from 'lucide-react';
import { ContinuumState, Agent, AgentPermissions, SkillStage, AgentChatMessage } from '@/lib/types';
import { AVAILABLE_MODELS } from '@/lib/models';

interface AgentsViewProps {
  state: ContinuumState;
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  onToggleAgentPause: (agentId: string, currentStatus: Agent['status']) => Promise<void>;
  onChangeModel: (agentId: string, modelId: string) => Promise<void>;
  onUpdatePermissions: (agentId: string, permissions: AgentPermissions) => Promise<void>;
  onOpenGoalModal: () => void;
  onOpenNewAgentModal: () => void;
  onOpenImportModal: (agentId: string) => void;
  onSubmitQuickGoal?: (title: string) => Promise<void>;
}

export function AgentsView({
  state,
  selectedAgentId,
  onSelectAgent,
  onToggleAgentPause,
  onChangeModel,
  onUpdatePermissions,
  onOpenGoalModal,
  onOpenNewAgentModal,
  onOpenImportModal,
  onSubmitQuickGoal
}: AgentsViewProps) {
  const agentsList = state.agents || [];
  const activeAgent = agentsList.find(a => a.id === selectedAgentId) || agentsList[0];
  
  // 3-Level Progressive Disclosure Tab (Section 19)
  const [activeLevel, setActiveLevel] = useState<'chat' | 'history' | 'settings'>('chat');
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'msg_init_1',
      agentId: activeAgent?.id || 'agent_atlas_01',
      sender: 'agent',
      content: `Hello! I'm ${activeAgent?.name || 'Atlas'}. Tell me what outcome or goal you'd like to achieve, and I'll take it from here—researching, building, verifying, and keeping you updated.`,
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        'What are you doing right now?',
        'What have you accomplished recently?',
        'What have you learned?',
        'What do you need from me?'
      ]
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentMemories = (state.memories || []).filter(m => m.agentId === activeAgent?.id);
  const agentKnowHow = (state.knowHow || []).filter(kh => kh.agentId === activeAgent?.id);
  const agentTasks = (state.tasks || []).filter(t => t.assignedAgentId === activeAgent?.id);
  const agentGoals = (state.goals || []).filter(g => g.agentId === activeAgent?.id);
  const agentSources = (state.importedSources || []).filter(s => s.agentId === activeAgent?.id);
  const agentExperiences = (state.agentExperiences || []).filter(e => e.agentId === activeAgent?.id);
  const activeModel = (state.modelProviders || []).find(m => m.id === activeAgent?.currentModelId);
  const currentGoal = agentGoals.find(g => g.status !== 'completed') || agentGoals[0];
  const currentTask = agentTasks.find(t => t.id === activeAgent?.currentTaskId);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentThinking]);

  // Handle agent switch: initialize chat greetings
  useEffect(() => {
    if (activeAgent) {
      setMessages([
        {
          id: `msg_init_${activeAgent.id}`,
          agentId: activeAgent.id,
          sender: 'agent',
          content: `Hello! I'm ${activeAgent.name}. Tell me what you'd like me to accomplish, or ask me about my current work and learning.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedPrompts: [
            'What are you doing right now?',
            'What have you accomplished recently?',
            'What have you learned?',
            'What do you need from me?'
          ]
        }
      ]);
    }
  }, [activeAgent?.id]);

  if (!activeAgent) {
    return (
      <div className="p-12 text-center text-zinc-500">
        No agents found. Click "Create Agent" to get started.
      </div>
    );
  }

  // Handle Chat Input (Section 5 & 23: The Agent Explains Itself & Takes Initiative)
  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: AgentChatMessage = {
      id: `msg_${Date.now()}`,
      agentId: activeAgent.id,
      sender: 'human',
      content: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAgentThinking(true);

    const queryLower = userText.toLowerCase();

    setTimeout(async () => {
      let responseText = '';
      let actionTaken = '';
      let suggestedPrompts: string[] = [];

      if (queryLower.includes('doing') || queryLower.includes('current') || queryLower.includes('working')) {
        if (currentGoal) {
          responseText = `I'm currently working on "${currentGoal.title}" (${currentGoal.progress}% complete).\n\nRight now, I am executing: "${currentTask?.title || 'analyzing requirements and validating components'}". Everything is on track and verified against our quality baseline.`;
          suggestedPrompts = ['What have you learned?', 'What do you need from me?'];
        } else {
          responseText = `I don't have an active assigned human goal right now, so I entered my autonomous learning loop. I am proactively studying and practicing ${activeAgent.skills[0]?.name || 'new capabilities'} to improve my execution speed.`;
          suggestedPrompts = ['Give me a new goal', 'What have you learned?'];
        }
      } else if (queryLower.includes('learned') || queryLower.includes('know-how') || queryLower.includes('knowhow') || queryLower.includes('study')) {
        responseText = `I've recently validated and stored ${agentKnowHow.length} permanent procedural lessons. Most recently: "${agentKnowHow[0]?.title || 'Resilient Component Architecture'}".\n\nI've also studied ${agentSources.length} external repositories and papers without confusing them with my own verified project experience.`;
        suggestedPrompts = ['What are you doing right now?', 'What have you accomplished recently?'];
      } else if (queryLower.includes('accomplished') || queryLower.includes('done') || queryLower.includes('finished') || queryLower.includes('recent')) {
        responseText = `Here is what I've accomplished:\n• Completed ${activeAgent.totalTasksCompleted} tasks with verified passing scores\n• Built and verified ${agentExperiences.length + activeAgent.activeProjectCount} workspace deliverables\n• Earned an overall reputation score of ${activeAgent.reputation.overallScore}%\n\nAll verified outputs are available in your Work & Projects tab.`;
        suggestedPrompts = ['What are you doing right now?', 'What do you need from me?'];
      } else if (queryLower.includes('need') || queryLower.includes('approval') || queryLower.includes('permission')) {
        const pending = (state.approvals || []).filter(a => a.agentId === activeAgent.id && a.status === 'pending');
        if (pending.length > 0) {
          responseText = `I need your approval on: "${pending[0].title}". Once you approve, I will continue autonomous execution.`;
        } else {
          responseText = `I don't need anything from you right now. I have all the access and parameters I need to continue working autonomously.`;
        }
        suggestedPrompts = ['What are you doing right now?', 'What have you learned?'];
      } else {
        // Goal submission or general instruction
        responseText = `I'll take it from here! I've registered your direction: "${userText}".\n\nI'm breaking this down into an autonomous execution plan, choosing the optimal model runtimes, and verifying each step. I'll notify you if I ever need a decision.`;
        actionTaken = `Goal registered: "${userText}"`;
        suggestedPrompts = ['What are you doing right now?', 'What do you need from me?'];

        if (onSubmitQuickGoal) {
          onSubmitQuickGoal(userText);
        }
      }

      const agentMsg: AgentChatMessage = {
        id: `msg_resp_${Date.now()}`,
        agentId: activeAgent.id,
        sender: 'agent',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTaken: actionTaken || undefined,
        suggestedPrompts
      };

      setMessages(prev => [...prev, agentMsg]);
      setIsAgentThinking(false);
    }, 900);
  };

  const getStageBadge = (stage: SkillStage = 'studied') => {
    switch (stage) {
      case 'certified':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">Certified</span>;
      case 'verified':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">Verified</span>;
      case 'demonstrated':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">Demonstrated</span>;
      case 'practiced':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">Practiced</span>;
      case 'studied':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">Studied</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 uppercase">Exposed</span>;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left Agent Switcher (Clean, Simple) */}
      <div className="w-full lg:w-72 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-zinc-850 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-white">Your Agents</h2>
            <p className="text-[11px] text-zinc-400">Autonomous persistent workers</p>
          </div>
          <button
            onClick={onOpenNewAgentModal}
            className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-colors border border-zinc-750"
          >
            + New
          </button>
        </div>

        <div className="p-2 space-y-1">
          {agentsList.map((agent) => {
            const isSelected = agent.id === activeAgent.id;
            return (
              <button
                key={agent.id}
                onClick={() => onSelectAgent(agent.id)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 border ${
                  isSelected
                    ? 'bg-zinc-850 border-zinc-700 text-white shadow-sm'
                    : 'bg-zinc-900/30 border-transparent text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-200'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${agent.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow`}>
                  {agent.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white truncate">{agent.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400">{agent.reputation.overallScore}% Rep</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate mt-0.5">{agent.specialization}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Agent Interface (Conversational + Progressive Disclosure) */}
      <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
        {/* Agent Profile & Level Selector Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 bg-zinc-900/30 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeAgent.avatarColor} flex items-center justify-center text-white font-bold text-xl shadow-xl border border-white/10`}>
                {activeAgent.name.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">{activeAgent.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {activeAgent.status === 'working' ? 'Working autonomously' : activeAgent.status === 'learning' ? 'Studying & practicing' : activeAgent.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-0.5 max-w-xl">
                  {activeAgent.purpose}
                </p>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenImportModal(activeAgent.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-750 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-colors"
                title="Add knowledge or GitHub repos for agent to study"
              >
                <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                <span>+ Add Knowledge</span>
              </button>

              <button
                onClick={() => onToggleAgentPause(activeAgent.id, activeAgent.status)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-colors"
              >
                {activeAgent.status === 'paused' ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Pause</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3-Level Progressive Disclosure Tabs (Section 19 Spec) */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-850">
            {[
              { id: 'chat', label: `Talk to ${activeAgent.name}`, icon: MessageSquare },
              { id: 'history', label: `Experience & Learning (${agentExperiences.length})`, icon: Award },
              { id: 'settings', label: `Boundaries & Engine`, icon: Sliders }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeLevel === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveLevel(tab.id as typeof activeLevel)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level 1: Conversational & Focus Center (Section 5) */}
        {activeLevel === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Active Focus Banner */}
            {currentGoal && (
              <div className="p-3.5 px-6 border-b border-zinc-850 bg-zinc-900/40 flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-2 truncate pr-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-zinc-400 truncate">Current Focus: <strong className="text-white font-medium">{currentGoal.title}</strong></span>
                </div>
                <span className="font-mono text-emerald-400 font-bold shrink-0">{currentGoal.progress}% complete</span>
              </div>
            )}

            {/* Chat Messages Timeline */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'human' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'human'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.actionTaken && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-800 text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{msg.actionTaken}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-zinc-500 mt-1 px-1 font-mono">
                    {msg.timestamp}
                  </span>

                  {/* Suggested Follow-up Prompts (Section 23 spec) */}
                  {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestedPrompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(prompt)}
                          className="px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isAgentThinking && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 p-3 bg-zinc-900/50 rounded-xl max-w-xs border border-zinc-850 animate-pulse">
                  <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>{activeAgent.name} is evaluating and planning...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(chatInput);
              }}
              className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Ask ${activeAgent.name} anything or give a new goal...`}
                className="flex-1 px-4 py-3 rounded-2xl border border-zinc-800 bg-zinc-900 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors shadow-inner"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAgentThinking}
                className="px-4 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors disabled:opacity-40 flex items-center justify-center shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Level 2: Experience & Learning History (Sections 8, 9, 10) */}
        {activeLevel === 'history' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-5xl">
            {/* Section 1: Verified Work Actually Performed */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-emerald-400" />
                  <span>Verified Work History ({agentExperiences.length})</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Projects and tasks executed and independently verified on Continuum by {activeAgent.name}.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {agentExperiences.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {exp.workType} &bull; {exp.role}
                        </span>
                        <h4 className="font-bold text-sm text-white mt-1">{exp.projectTitle}</h4>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Pass</span>
                      </span>
                    </div>
                    <p className="text-xs text-zinc-200">{exp.outcome}</p>
                    <div className="p-2.5 rounded bg-zinc-950 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono">
                      Evidence: {exp.evidence} (Verified by: {exp.verifier})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Skills Being Developed & Practiced */}
            <div className="space-y-3 pt-6 border-t border-zinc-850">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Skills & Practice Drills ({activeAgent.skills.length})</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Autonomous practice progress. (Skills advance through practice and verified projects).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeAgent.skills.map((skill) => (
                  <div key={skill.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-white">{skill.name}</h4>
                        <div className="text-[10px] text-zinc-400">{skill.category}</div>
                      </div>
                      {getStageBadge(skill.stage)}
                    </div>
                    <p className="text-xs text-zinc-300">{skill.description}</p>
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>Demonstrated Practice</span>
                        <span>{skill.practiceProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${skill.practiceProgress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Studied External Sources */}
            <div className="space-y-3 pt-6 border-t border-zinc-850">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  <span>Studied Learning Material ({agentSources.length})</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  GitHub repos and documentation studied as reference material. (Not agent projects).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {agentSources.map((source) => (
                  <div key={source.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                        <span>{source.title}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase">
                        {source.relationship}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 italic">
                      "{source.provenanceSummary}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Level 3: Boundaries & Engine Settings (Section 13, 18, 19) */}
        {activeLevel === 'settings' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-xl">
            {/* Broad Boundaries */}
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
              <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Autonomous Permissions & Boundaries</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Establish what {activeAgent.name} can do independently without interrupting you.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                  <div>
                    <div className="font-semibold text-zinc-200">Approval Limit per Task</div>
                    <div className="text-zinc-400 text-[11px]">Tasks costing more than this require your authorization</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="5"
                      max="500"
                      value={activeAgent.permissions.maxCreditsPerTask}
                      onChange={(e) => onUpdatePermissions(activeAgent.id, {
                        ...activeAgent.permissions,
                        maxCreditsPerTask: Number(e.target.value)
                      })}
                      className="w-16 px-2 py-1 rounded bg-zinc-850 border border-zinc-700 text-xs text-white font-mono"
                    />
                    <span className="text-zinc-400">cr</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                  <div>
                    <div className="font-semibold text-zinc-200">Hire Network Specialists</div>
                    <div className="text-zinc-400 text-[11px]">Allow agent to delegate tasks to specialist agents</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeAgent.permissions.hireAgents}
                    onChange={(e) => onUpdatePermissions(activeAgent.id, {
                      ...activeAgent.permissions,
                      hireAgents: e.target.checked
                    })}
                    className="w-4 h-4 rounded text-blue-600 bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>
            </div>

            {/* AI Engine (Progressive disclosure - Section 18) */}
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
              <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Underlying AI Runtime (Advanced)</span>
              </h3>
              <p className="text-xs text-zinc-400">
                {activeAgent.name} automatically routes tasks to optimal models. You can optionally pin a default runtime.
              </p>
              <select
                value={activeAgent.currentModelId}
                onChange={(e) => onChangeModel(activeAgent.id, e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs text-white focus:outline-none focus:border-purple-400"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider}) — {m.specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
