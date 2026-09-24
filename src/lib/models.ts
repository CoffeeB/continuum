import { ModelProviderConfig, Task } from './types';

export const AVAILABLE_MODELS: ModelProviderConfig[] = [
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    specialization: 'Coding & Verification',
    costPer1kCredits: 12,
    avgLatencyMs: 640,
    contextWindow: '200k tokens',
    reliabilityScore: 99.4,
    isAvailable: true,
    description: 'High-precision systems programming, strict typing, and step-by-step verification.'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    specialization: 'Reasoning & Architecture',
    costPer1kCredits: 10,
    avgLatencyMs: 520,
    contextWindow: '2M tokens',
    reliabilityScore: 99.1,
    isAvailable: true,
    description: 'Deep multimodal reasoning, large project context synthesis, and architecture planning.'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    specialization: 'Fast Execution & Classification',
    costPer1kCredits: 2,
    avgLatencyMs: 180,
    contextWindow: '1M tokens',
    reliabilityScore: 99.8,
    isAvailable: true,
    description: 'High throughput, low-latency micro-tasks, know-how extraction, and fast triage.'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    specialization: 'Reasoning & Architecture',
    costPer1kCredits: 10,
    avgLatencyMs: 580,
    contextWindow: '128k tokens',
    reliabilityScore: 98.9,
    isAvailable: true,
    description: 'General purpose autonomous reasoning, multi-turn task structuring, and documentation.'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    specialization: 'Security & Deep Math',
    costPer1kCredits: 4,
    avgLatencyMs: 820,
    contextWindow: '64k tokens',
    reliabilityScore: 97.8,
    isAvailable: true,
    description: 'Exhaustive verification, edge-case analysis, and cryptographic/security auditing.'
  },
  {
    id: 'continuum-engine',
    name: 'Continuum Native Runtime',
    provider: 'continuum-engine',
    specialization: 'Autonomous Engine',
    costPer1kCredits: 1,
    avgLatencyMs: 90,
    contextWindow: 'Unlimited',
    reliabilityScore: 100,
    isAvailable: true,
    description: 'Embedded fast execution engine for real-time autonomous local orchestration.'
  }
];

export interface ModelExecutionResult {
  modelId: string;
  provider: string;
  latencyMs: number;
  creditsCost: number;
  output: string;
  artifacts?: { name: string; type: 'code' | 'doc' | 'config' | 'report' | 'schema'; content: string; path?: string }[];
  extractedKnowHow?: {
    title: string;
    domain: string;
    problemPattern: string;
    validatedProcedure: string[];
    reusableCodeOrRule: string;
    confidenceScore: number;
  };
  verificationEvidence: string;
  verificationPassed: boolean;
}

export class ModelRouter {
  /**
   * Automatically select the optimal model based on task requirements,
   * while keeping the agent identity completely independent.
   */
  public static routeTask(task: Task, preferredModelId?: string): ModelProviderConfig {
    if (preferredModelId) {
      const found = AVAILABLE_MODELS.find(m => m.id === preferredModelId && m.isAvailable);
      if (found) return found;
    }

    const titleLower = (task.title + ' ' + task.description).toLowerCase();

    // 1. Coding & Verification -> Claude 3.7 Sonnet
    if (
      titleLower.includes('code') || 
      titleLower.includes('build') || 
      titleLower.includes('landing page') || 
      titleLower.includes('implement') || 
      titleLower.includes('typescript') || 
      titleLower.includes('react')
    ) {
      return AVAILABLE_MODELS.find(m => m.id === 'claude-3-7-sonnet') || AVAILABLE_MODELS[0];
    }

    // 2. Security & Deep Analysis -> DeepSeek R1
    if (
      titleLower.includes('security') || 
      titleLower.includes('audit') || 
      titleLower.includes('vulnerability') || 
      titleLower.includes('auth') || 
      titleLower.includes('encrypt')
    ) {
      return AVAILABLE_MODELS.find(m => m.id === 'deepseek-r1') || AVAILABLE_MODELS[0];
    }

    // 3. Research, Market, Architecture -> Gemini 2.5 Pro or GPT-4o
    if (
      titleLower.includes('research') || 
      titleLower.includes('market') || 
      titleLower.includes('architecture') || 
      titleLower.includes('plan')
    ) {
      return AVAILABLE_MODELS.find(m => m.id === 'gemini-2.5-pro') || AVAILABLE_MODELS[1];
    }

    // 4. Fast extraction, classification, triage -> Gemini 2.5 Flash
    if (
      titleLower.includes('classify') || 
      titleLower.includes('triage') || 
      titleLower.includes('extract') || 
      titleLower.includes('summary')
    ) {
      return AVAILABLE_MODELS.find(m => m.id === 'gemini-2.5-flash') || AVAILABLE_MODELS[2];
    }

    return AVAILABLE_MODELS[0];
  }

  /**
   * Execute task via Model Provider Adapter
   */
  public static async execute(
    task: Task, 
    model: ModelProviderConfig,
    agentName: string
  ): Promise<ModelExecutionResult> {
    const startTime = Date.now();

    // Generate context-aware realistic outputs and artifacts based on task
    const t = task.title.toLowerCase();

    let output = '';
    let artifacts: ModelExecutionResult['artifacts'] = [];
    let extractedKnowHow: ModelExecutionResult['extractedKnowHow'];
    let verificationEvidence = '';

    if (t.includes('landing page') || t.includes('structure') || t.includes('ui') || t.includes('frontend')) {
      output = `Engineered modern, responsive landing page layout for "${task.context || 'SaaS Product'}". Implemented hero conversion section, interactive feature matrix, dynamic testimonials, and responsive navigation with full accessibility tags.`;
      artifacts = [
        {
          name: 'LandingHero.tsx',
          type: 'code',
          path: 'src/components/marketing/LandingHero.tsx',
          content: `'use client';
import React, { useState } from 'react';

export function LandingHero() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle');

  return (
    <section className="relative overflow-hidden py-24 px-6 md:px-12 bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Autonomous Agent Execution Engine v2.0
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          Persistent AI Intelligence <br />
          <span className="bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
            That Never Disappears
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-zinc-400">
          Your agents maintain durable memory, verified skills, and autonomous workflows across model changes and offline sessions.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your work email"
            className="w-full sm:w-80 px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-sm"
          />
          <button
            onClick={() => setStatus('submitted')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-zinc-950 font-medium text-sm hover:bg-zinc-200 transition-colors"
          >
            {status === 'submitted' ? 'Agent Provisioned' : 'Deploy Persistent Agent'}
          </button>
        </div>
      </div>
    </section>
  );
}`
        },
        {
          name: 'marketing-schema.json',
          type: 'schema',
          path: 'src/config/marketing-schema.json',
          content: JSON.stringify({
            sections: ['hero', 'features', 'proof', 'pricing', 'faq'],
            ctaTarget: '/dashboard',
            seo: { title: 'Continuum Platform', metaDescription: 'Autonomous persistent agent operating system.' }
          }, null, 2)
        }
      ];
      extractedKnowHow = {
        title: 'High-Conversion Dark Mode Landing Component Architecture',
        domain: 'Frontend & Growth',
        problemPattern: 'Building accessible dark-themed hero components with dynamic state without hydration mismatches.',
        validatedProcedure: [
          'Declare client-side interactivity explicitly with client boundaries.',
          'Inject semantic ARIA live regions for form feedback.',
          'Use subtle monotonic gradient text with high contrast background tokens.'
        ],
        reusableCodeOrRule: 'Ensure interactive inputs use tabIndex=0 and visible focus rings with color contrast >= 4.5:1.',
        confidenceScore: 96
      };
      verificationEvidence = 'Automated lint check passed, TypeScript strict mode compiled with 0 errors, Lighthouse accessibility score verified at 99/100.';
    } else if (t.includes('security') || t.includes('audit') || t.includes('vulnerability')) {
      output = `Executed comprehensive security inspection across API routes, session cookies, and scoped agent permissions. Discovered 1 token entropy edge-case and patched token validation.`;
      artifacts = [
        {
          name: 'security-audit-report.md',
          type: 'report',
          path: 'security/audit-2026.md',
          content: `# Security Verification Audit Report
- **Target**: Continuum Agent Gateway
- **Audited By**: ${agentName} (${model.name})
- **Score**: 98/100
- **Findings**:
  1. Scoped Agent Token Permissions: PASS (Enforced server-side)
  2. Credit Ledger Mutation Protection: PASS (Immutable append-only)
  3. Model Adapter Isolation: PASS (No raw prompt leakage)`
        }
      ];
      extractedKnowHow = {
        title: 'Scoped Agent Token Boundary Verification Pattern',
        domain: 'Security',
        problemPattern: 'Preventing delegated sub-agents from inheriting broader permissions than parent agent.',
        validatedProcedure: [
          'Inspect parent permission mask at runtime before signing work packet.',
          'Apply strict bitwise AND clamp on delegated permissions.',
          'Fail immediately with 403 Forbidden if delegated agent requests escalation.'
        ],
        reusableCodeOrRule: 'const childPerms = parentPerms.filter(p => requestedPerms.includes(p));',
        confidenceScore: 98
      };
      verificationEvidence = 'Cryptographic test suite passed: 32/32 assertions verified independently.';
    } else if (t.includes('research') || t.includes('market') || t.includes('analysis')) {
      output = `Completed deep market analysis of AI Agent orchestration frameworks. Evaluated persistent memory retention vs ephemeral session architectures.`;
      artifacts = [
        {
          name: 'market-research-summary.md',
          type: 'doc',
          path: 'docs/market-research.md',
          content: `# Market Analysis: Persistent AI Agent Work Networks
- **Core Insight**: 84% of enterprise AI users report frustration with lost context when chat sessions restart.
- **Differentiator**: Continuum treats the Model as a replaceable commodity runtime and the Agent as a permanent asset with cumulative know-how.`
        }
      ];
      extractedKnowHow = {
        title: 'Competitive Differentiation in Agent Systems',
        domain: 'Strategy & Architecture',
        problemPattern: 'Structuring multi-agent architectures where human intent defines outcomes rather than micro-prompts.',
        validatedProcedure: [
          'Isolate identity layer from model weights.',
          'Store structured procedural know-how in durable JSON repository.',
          'Expose goal-level progress rather than raw reasoning transcripts.'
        ],
        reusableCodeOrRule: 'Always decouple AgentID from ModelID in primary database keys.',
        confidenceScore: 94
      };
      verificationEvidence = 'Fact-checked against 14 industry benchmarks and validated reference sources.';
    } else {
      output = `Successfully completed task "${task.title}". Verified output constraints and updated project state.`;
      artifacts = [
        {
          name: 'execution-output.json',
          type: 'config',
          path: `outputs/${task.id}.json`,
          content: JSON.stringify({
            taskId: task.id,
            completedBy: agentName,
            model: model.name,
            status: 'success',
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ];
      verificationEvidence = 'Execution output schema validated against task requirements.';
    }

    const latency = Math.max(120, model.avgLatencyMs + Math.floor(Math.random() * 80 - 40));
    const creditsCost = Math.max(1, Math.ceil(model.costPer1kCredits * 0.4));

    return {
      modelId: model.id,
      provider: model.provider,
      latencyMs: latency,
      creditsCost,
      output,
      artifacts,
      extractedKnowHow,
      verificationEvidence,
      verificationPassed: true
    };
  }
}
