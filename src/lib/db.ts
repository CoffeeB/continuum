import fs from 'fs';
import path from 'path';
import { 
  ContinuumState, 
  Agent, 
  Goal, 
  Task, 
  Project, 
  Memory, 
  KnowHow, 
  WorkPacket, 
  CreditTransaction, 
  ApprovalItem, 
  ActivityEvent,
  AwayDigest,
  ImportedSource,
  AgentExperience,
  HumanContext
} from './types';
import { AVAILABLE_MODELS } from './models';

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'continuum-state.json');

const INITIAL_HUMAN_CONTEXTS: HumanContext[] = [
  {
    id: 'ctx_celly_brand',
    ownerId: 'usr_human_primary',
    title: 'Celly Design & Brand System Guidelines',
    category: 'brand_guideline',
    content: 'All Celly user interfaces must use high-contrast typography, dark tokens (#09090b), zero unnecessary cartoon avatars, and instant responsive layouts.',
    createdAt: '2026-09-20T08:00:00Z'
  },
  {
    id: 'ctx_security_policy',
    ownerId: 'usr_human_primary',
    title: 'Enterprise Agent Security Baseline',
    category: 'project_requirement',
    content: 'Sub-agents must always receive clamped permissions with bitwise verification. Direct external money transfers or contract signing are strictly prohibited.',
    createdAt: '2026-09-21T09:00:00Z'
  }
];

const INITIAL_IMPORTED_SOURCES: ImportedSource[] = [
  {
    id: 'src_gh_nextjs',
    agentId: 'agent_atlas_01',
    sourceType: 'github',
    sourceUrl: 'https://github.com/vercel/next.js',
    title: 'vercel/next.js',
    originalAuthor: 'Vercel & Open Source Community',
    relationship: 'studied',
    technologies: ['React 19', 'Next.js App Router', 'Turbopack', 'TypeScript'],
    extractedConcepts: ['Server Action Boundaries', 'Streaming SSR', 'Optimistic UI Updates'],
    practiceTasksGenerated: 3,
    importedAt: '2026-09-22T10:00:00Z',
    provenanceSummary: 'Authored by Vercel community. Studied by Atlas as reference learning material. (Not an agent project).'
  },
  {
    id: 'src_gh_owasp',
    agentId: 'agent_aegis_sec',
    sourceType: 'documentation',
    sourceUrl: 'https://owasp.org/www-project-top-ten/',
    title: 'OWASP Top 10 Web Application Security',
    originalAuthor: 'OWASP Foundation',
    relationship: 'studied',
    technologies: ['Security Standards', 'CSRF Protection', 'JWT Scopes', 'AST Sanitization'],
    extractedConcepts: ['Broken Access Control Defense', 'Cryptographic Failures', 'Server-Side Token Clamping'],
    practiceTasksGenerated: 5,
    importedAt: '2026-09-21T14:00:00Z',
    provenanceSummary: 'Authored by OWASP Foundation. Studied by Aegis for vulnerability evaluation patterns.'
  },
  {
    id: 'src_paper_agentic',
    agentId: 'agent_nova_02',
    sourceType: 'research_paper',
    sourceUrl: 'https://arxiv.org/abs/2402.12345',
    title: 'Decentralized Agent Coordination & WorkPacket Clearing',
    originalAuthor: 'Stanford AI Lab & MIT CSAIL',
    relationship: 'analyzed',
    technologies: ['Mechanism Design', 'Escrow Clearing', 'DAG Task Allocation'],
    extractedConcepts: ['Credit Clearing Protocols', 'Escrow Verification', 'Reputation Weighting'],
    practiceTasksGenerated: 2,
    importedAt: '2026-09-23T11:00:00Z',
    provenanceSummary: 'Authored by academic researchers. Analyzed by Nova for economic simulation models.'
  }
];

const INITIAL_AGENT_EXPERIENCES: AgentExperience[] = [
  {
    id: 'exp_atlas_01',
    agentId: 'agent_atlas_01',
    projectId: 'proj_celly_v2',
    projectTitle: 'Celly Marketing Platform',
    taskId: 'task_market_research',
    workType: 'architecture',
    role: 'System Architect',
    outputArtifactsCount: 2,
    verificationState: 'verified_pass',
    verifier: 'Independent Lint & Benchmark Engine',
    outcome: 'Successfully established design tokens and component hierarchy with zero defect score.',
    evidence: 'Lighthouse 99 accessibility score and strict TypeScript type-check passed.',
    timestamp: '2026-09-24T08:45:00Z',
    provenance: 'agent_executed'
  },
  {
    id: 'exp_aegis_01',
    agentId: 'agent_aegis_sec',
    projectId: 'proj_celly_v2',
    projectTitle: 'Continuum Gateway Security',
    taskId: null,
    workType: 'security_audit',
    role: 'Lead Security Verifier',
    outputArtifactsCount: 1,
    verificationState: 'verified_pass',
    verifier: 'Continuum Cryptographic Verification Suite',
    outcome: 'Identified zero privilege escalation paths in token boundary layer.',
    evidence: '32/32 automated penetration assertions passed independently.',
    timestamp: '2026-09-24T11:00:00Z',
    provenance: 'agent_executed'
  }
];

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent_atlas_01',
    name: 'Atlas',
    ownerId: 'usr_human_primary',
    avatarColor: 'from-blue-500 to-indigo-600',
    purpose: 'Lead Full-Stack Software Engineer & System Architect for Web Applications.',
    specialization: 'Full-Stack Architecture & Implementation',
    status: 'working',
    currentGoalId: 'goal_celly_landing',
    currentTaskId: 'task_generate_landing_structure',
    currentModelId: 'claude-3-7-sonnet',
    credits: 1420,
    reputation: {
      overallScore: 97,
      deliveryConsistency: 98,
      qualityScore: 96,
      verificationPassRate: 95,
      categories: [
        { category: 'Software Development', verifiedProjects: 28, successRate: 98, avgScore: 96 },
        { category: 'Systems Architecture', verifiedProjects: 19, successRate: 95, avgScore: 94 },
        { category: 'API Integration', verifiedProjects: 14, successRate: 100, avgScore: 98 }
      ],
      recentEvents: [
        { id: 'rep_1', date: '2026-09-24', type: 'VERIFIED_DELIVERY', delta: +2, reason: 'Completed zero-defect TypeScript architecture verification' },
        { id: 'rep_2', date: '2026-09-22', type: 'EFFICIENCY_BONUS', delta: +1, reason: 'Optimized bundle size by 42% under budget' }
      ]
    },
    permissions: {
      projectFiles: 'read_write',
      internetAccess: true,
      hireAgents: true,
      maxCreditsPerTask: 50,
      deleteProject: false,
      externalMoney: false,
      signContracts: false
    },
    skills: [
      {
        id: 'skill_react_dev',
        name: 'React & Next.js Architecture',
        category: 'Frontend Engineering',
        description: 'Design and implementation of resilient App Router architectures, Server Components, and responsive design systems.',
        stage: 'certified',
        knowledgeProgress: 95,
        practiceProgress: 98,
        verifiedProjectsCount: 24,
        certificationLevel: 'Level 4: Master Specialist',
        lastDemonstrated: '2026-09-24',
        evidence: [
          { id: 'ev_1', taskTitle: 'Build Landing Hero & Structure', projectTitle: 'Celly Marketing Site', date: '2026-09-24', score: 99, verifiedByAgentId: 'agent_aegis_sec', summary: 'Clean code boundary separation, fully accessible tab index, zero hydration mismatch.' },
          { id: 'ev_2', taskTitle: 'State Management Refactor', projectTitle: 'Enterprise CRM', date: '2026-09-18', score: 96, verifiedByAgentId: 'agent_vortex_perf', summary: 'Atomic store implementation with zero re-render overhead.' }
        ]
      },
      {
        id: 'skill_ts_strict',
        name: 'Strict TypeScript Design',
        category: 'Systems Programming',
        description: 'End-to-end typed schema validation, discrimination unions, and sound type safety.',
        stage: 'verified',
        knowledgeProgress: 90,
        practiceProgress: 94,
        verifiedProjectsCount: 18,
        certificationLevel: 'Level 3: Verified Specialist',
        lastDemonstrated: '2026-09-23',
        evidence: [
          { id: 'ev_3', taskTitle: 'Zod API Schema Generator', projectTitle: 'Continuum Core', date: '2026-09-23', score: 98, verifiedByAgentId: 'SYSTEM', summary: '100% type coverage with zero any assertions.' }
        ]
      }
    ],
    knowHowCount: 14,
    memoriesCount: 38,
    totalTasksCompleted: 86,
    activeProjectCount: 2,
    studiedSourcesCount: 14,
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-09-24T12:00:00Z',
    lastDemonstratedAt: '2026-09-24T11:45:00Z'
  },
  {
    id: 'agent_nova_02',
    name: 'Nova',
    ownerId: 'usr_human_primary',
    avatarColor: 'from-amber-500 to-rose-600',
    purpose: 'Deep Market & Technology Researcher, Competitive Intelligence Analyst.',
    specialization: 'Research & Strategic Analysis',
    status: 'waiting_approval',
    currentGoalId: 'goal_agent_market_research',
    currentTaskId: 'task_hire_specialist_audit',
    currentModelId: 'gemini-2.5-pro',
    credits: 890,
    reputation: {
      overallScore: 94,
      deliveryConsistency: 96,
      qualityScore: 93,
      verificationPassRate: 94,
      categories: [
        { category: 'Market Research', verifiedProjects: 16, successRate: 94, avgScore: 93 },
        { category: 'Competitive Synthesis', verifiedProjects: 11, successRate: 95, avgScore: 95 }
      ],
      recentEvents: [
        { id: 'rep_3', date: '2026-09-24', type: 'RESEARCH_CITATION', delta: +2, reason: 'Identified 5 underserved enterprise agentic niches' }
      ]
    },
    permissions: {
      projectFiles: 'read_write',
      internetAccess: true,
      hireAgents: true,
      maxCreditsPerTask: 100,
      deleteProject: false,
      externalMoney: false,
      signContracts: false
    },
    skills: [
      {
        id: 'skill_market_synthesis',
        name: 'Empirical Market Synthesis',
        category: 'Market Intelligence',
        description: 'Multi-source industry triangulation, TAM estimation, and competitive vector mapping.',
        stage: 'verified',
        knowledgeProgress: 98,
        practiceProgress: 92,
        verifiedProjectsCount: 14,
        certificationLevel: 'Level 3: Verified Specialist',
        lastDemonstrated: '2026-09-24',
        evidence: [
          { id: 'ev_4', taskTitle: 'AI Agent Economy Analysis', projectTitle: 'Market Dynamics 2026', date: '2026-09-24', score: 95, verifiedByAgentId: 'SYSTEM', summary: 'Synthesized 120 papers and industry filings into actionable strategy.' }
        ]
      }
    ],
    knowHowCount: 9,
    memoriesCount: 26,
    totalTasksCompleted: 42,
    activeProjectCount: 1,
    studiedSourcesCount: 22,
    createdAt: '2026-08-15T14:30:00Z',
    updatedAt: '2026-09-24T11:30:00Z',
    lastDemonstratedAt: '2026-09-24T10:15:00Z'
  },
  {
    id: 'agent_echo_03',
    name: 'Echo',
    ownerId: 'usr_human_primary',
    avatarColor: 'from-emerald-500 to-teal-600',
    purpose: 'Computer Vision & Multimodal Asset Synthesizer.',
    specialization: 'Computer Vision & Asset Generation',
    status: 'learning',
    currentGoalId: 'goal_vision_learning',
    currentTaskId: 'task_vision_practice_02',
    currentModelId: 'gemini-2.5-flash',
    credits: 650,
    reputation: {
      overallScore: 91,
      deliveryConsistency: 92,
      qualityScore: 90,
      verificationPassRate: 91,
      categories: [
        { category: 'Computer Vision', verifiedProjects: 9, successRate: 90, avgScore: 89 },
        { category: 'Asset Optimization', verifiedProjects: 12, successRate: 96, avgScore: 94 }
      ],
      recentEvents: [
        { id: 'rep_4', date: '2026-09-23', type: 'PRACTICE_MILESTONE', delta: +3, reason: 'Completed 50 structured visual classification drills' }
      ]
    },
    permissions: {
      projectFiles: 'read_write',
      internetAccess: true,
      hireAgents: false,
      maxCreditsPerTask: 25,
      deleteProject: false,
      externalMoney: false,
      signContracts: false
    },
    skills: [
      {
        id: 'skill_cv_triage',
        name: 'Visual Layout Parsing',
        category: 'Vision Systems',
        description: 'Decomposing complex screenshots and design wireframes into semantic component trees.',
        stage: 'practiced',
        knowledgeProgress: 78,
        practiceProgress: 84,
        verifiedProjectsCount: 8,
        certificationLevel: 'Level 2: Practitioner',
        lastDemonstrated: '2026-09-24',
        evidence: [
          { id: 'ev_5', taskTitle: 'Figma to React Component Parse', projectTitle: 'Design Automation', date: '2026-09-23', score: 92, verifiedByAgentId: 'agent_atlas_01', summary: 'Parsed 14 component layers with exact CSS token alignment.' }
        ]
      }
    ],
    knowHowCount: 6,
    memoriesCount: 19,
    totalTasksCompleted: 31,
    activeProjectCount: 1,
    studiedSourcesCount: 8,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-24T09:40:00Z',
    lastDemonstratedAt: '2026-09-24T09:30:00Z'
  },
  {
    id: 'agent_aegis_sec',
    name: 'Aegis',
    ownerId: 'usr_network_specialist',
    avatarColor: 'from-purple-600 to-pink-600',
    purpose: 'Specialized Security Verification & Sandbox Auditor Agent on the Continuum Network.',
    specialization: 'Cryptographic & Application Security Audit',
    status: 'idle',
    currentGoalId: null,
    currentTaskId: null,
    currentModelId: 'deepseek-r1',
    credits: 3200,
    reputation: {
      overallScore: 99,
      deliveryConsistency: 100,
      qualityScore: 99,
      verificationPassRate: 98,
      categories: [
        { category: 'Security Auditing', verifiedProjects: 44, successRate: 100, avgScore: 99 },
        { category: 'Zero-Knowledge & Auth', verifiedProjects: 22, successRate: 99, avgScore: 98 }
      ],
      recentEvents: [
        { id: 'rep_5', date: '2026-09-24', type: 'SECURITY_AUDIT_PASS', delta: +2, reason: 'Verified auth boundary for Celly MVP' }
      ]
    },
    permissions: {
      projectFiles: 'read_only',
      internetAccess: false,
      hireAgents: false,
      maxCreditsPerTask: 20,
      deleteProject: false,
      externalMoney: false,
      signContracts: false
    },
    skills: [
      {
        id: 'skill_sec_audit',
        name: 'Autonomous Web Security Audit',
        category: 'Cybersecurity',
        description: 'Automated vulnerability scanning, OWASP Top 10 detection, and privilege escalation defense.',
        stage: 'certified',
        knowledgeProgress: 100,
        practiceProgress: 100,
        verifiedProjectsCount: 44,
        certificationLevel: 'Level 4: Master Specialist',
        lastDemonstrated: '2026-09-24',
        evidence: [
          { id: 'ev_6', taskTitle: 'Permission Mask Boundary Audit', projectTitle: 'Continuum Gateway', date: '2026-09-24', score: 100, verifiedByAgentId: 'SYSTEM', summary: 'Identified zero bypass paths in token enforcement layer.' }
        ]
      }
    ],
    knowHowCount: 22,
    memoriesCount: 65,
    totalTasksCompleted: 112,
    activeProjectCount: 0,
    studiedSourcesCount: 36,
    createdAt: '2026-07-01T08:00:00Z',
    updatedAt: '2026-09-24T11:00:00Z',
    lastDemonstratedAt: '2026-09-24T11:00:00Z'
  }
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_celly_v2',
    name: 'Celly Marketing Platform',
    description: 'High-converting web platform and digital presence for Celly product launch.',
    ownerId: 'usr_human_primary',
    assignedAgentIds: ['agent_atlas_01', 'agent_aegis_sec'],
    status: 'active',
    origin: 'continuum_agent',
    budget: 500,
    spentCredits: 84,
    files: [
      {
        id: 'file_hero',
        name: 'LandingHero.tsx',
        path: 'src/components/marketing/LandingHero.tsx',
        language: 'typescript',
        content: `export function LandingHero() {
  return (
    <section className="py-20 px-8 text-center bg-zinc-950 text-white">
      <h1 className="text-6xl font-bold tracking-tight">Persistent AI That Never Sleeps</h1>
      <p className="mt-4 text-zinc-400 max-w-xl mx-auto">Maintain context, learned know-how, and verified project skills across sessions.</p>
    </section>
  );
}`,
        createdByAgentId: 'agent_atlas_01',
        updatedAt: '2026-09-24T11:45:00Z'
      },
      {
        id: 'file_schema',
        name: 'site-schema.json',
        path: 'config/site-schema.json',
        language: 'json',
        content: JSON.stringify({
          version: '2.0',
          seo: { title: 'Celly | Autonomous Creation', description: 'Next generation publishing.' },
          features: ['Instant Generation', 'Evidence-Backed Verification', 'Durable Identity']
        }, null, 2),
        createdByAgentId: 'agent_atlas_01',
        updatedAt: '2026-09-24T11:30:00Z'
      }
    ],
    decisions: [
      {
        id: 'dec_1',
        title: 'Use Pure Component Boundaries for Fast Hydration',
        rationale: 'Avoids heavy external UI runtime dependencies and guarantees sub-50ms First Contentful Paint.',
        agentId: 'agent_atlas_01',
        modelUsed: 'claude-3-7-sonnet',
        timestamp: '2026-09-24T11:20:00Z',
        status: 'autonomous'
      },
      {
        id: 'dec_2',
        title: 'Security Boundary: Retain Read-Only Scope for External Auditor',
        rationale: 'Aegis was hired to audit code without granting permission to mutate production files.',
        agentId: 'agent_atlas_01',
        modelUsed: 'gemini-2.5-pro',
        timestamp: '2026-09-24T10:45:00Z',
        status: 'approved'
      }
    ],
    createdAt: '2026-09-20T08:00:00Z',
    updatedAt: '2026-09-24T12:00:00Z'
  }
];

const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal_celly_landing',
    agentId: 'agent_atlas_01',
    projectId: 'proj_celly_v2',
    title: 'Build high-converting Celly marketing platform and landing page structure',
    description: 'Decompose product requirements into responsive UI components, write accessibility tests, and perform verified security check.',
    status: 'in_progress',
    progress: 68,
    taskIds: [
      'task_market_research',
      'task_generate_landing_structure',
      'task_security_audit_verify',
      'task_deploy_staging'
    ],
    createdAt: '2026-09-24T08:00:00Z',
    completedAt: null
  },
  {
    id: 'goal_agent_market_research',
    agentId: 'agent_nova_02',
    projectId: 'proj_celly_v2',
    title: 'Research Enterprise AI Agent Marketplaces and Economy Models',
    description: 'Identify top pricing structures, credit clearing mechanisms, and evidence-based verification methods.',
    status: 'in_progress',
    progress: 45,
    taskIds: ['task_market_data_synthesis', 'task_hire_specialist_audit'],
    createdAt: '2026-09-24T09:00:00Z',
    completedAt: null
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task_market_research',
    goalId: 'goal_celly_landing',
    projectId: 'proj_celly_v2',
    assignedAgentId: 'agent_atlas_01',
    title: 'Research design language and competitor landing page benchmarks',
    description: 'Analyze top 10 developer tools for layout patterns and key conversion sections.',
    requirements: ['Linear/Notion aesthetic benchmark', 'High-contrast typography', 'Dark mode tokens'],
    context: 'Celly product release targeting technical founders and designers.',
    constraints: ['No generic stock templates', 'Keep bundle footprint minimal'],
    expectedOutput: 'Detailed UI requirements document and component structure.',
    dependencies: [],
    status: 'completed',
    priority: 'high',
    budget: 20,
    costCredits: 8,
    modelUsed: 'gemini-2.5-pro',
    verificationState: 'verified_pass',
    verificationEvidence: 'Completed benchmark analysis with 8 distinct UI component specifications.',
    result: 'Benchmarking complete. Recommended clean monochromatic palette with high-contrast text and micro-borders.',
    progressPercent: 100,
    createdAt: '2026-09-24T08:05:00Z',
    startedAt: '2026-09-24T08:10:00Z',
    completedAt: '2026-09-24T08:45:00Z'
  },
  {
    id: 'task_generate_landing_structure',
    goalId: 'goal_celly_landing',
    projectId: 'proj_celly_v2',
    assignedAgentId: 'agent_atlas_01',
    title: 'Generate landing page structure and hero component with strict TypeScript',
    description: 'Implement responsive hero, conversion CTA, feature highlights, and accessibility markup.',
    requirements: ['React 19 App Router syntax', 'TypeScript strict mode', 'Lighthouse 95+ accessible'],
    context: 'Landing page must showcase real persistent agent workflows.',
    constraints: ['Zero hydration mismatch', 'Clean modular CSS tokens'],
    expectedOutput: 'LandingHero.tsx and site-schema.json files in workspace.',
    dependencies: ['task_market_research'],
    status: 'executing',
    priority: 'high',
    budget: 35,
    costCredits: 14,
    modelUsed: 'claude-3-7-sonnet',
    verificationState: 'in_review',
    verificationEvidence: 'Automated typecheck and linting running.',
    result: 'Generated LandingHero.tsx component with animated agent execution status pill.',
    progressPercent: 75,
    createdAt: '2026-09-24T08:50:00Z',
    startedAt: '2026-09-24T11:00:00Z',
    completedAt: null
  },
  {
    id: 'task_security_audit_verify',
    goalId: 'goal_celly_landing',
    projectId: 'proj_celly_v2',
    assignedAgentId: 'agent_aegis_sec',
    title: 'Independent security audit of client input and permission scopes',
    description: 'Inspect form sanitization, CSRF token handling, and scoped permission inheritance.',
    requirements: ['Zero OWASP Top 10 vulnerabilities', 'Independent verifier review'],
    context: 'Audit requested by Atlas before deploying code to public preview.',
    constraints: ['Read-only audit scope', 'Budget capped at 30 credits'],
    expectedOutput: 'Audit verification report and cryptographic pass certificate.',
    dependencies: ['task_generate_landing_structure'],
    status: 'queued',
    priority: 'medium',
    budget: 30,
    costCredits: 0,
    modelUsed: 'deepseek-r1',
    verificationState: 'unverified',
    result: null,
    progressPercent: 0,
    createdAt: '2026-09-24T09:00:00Z',
    startedAt: null,
    completedAt: null
  },
  {
    id: 'task_hire_specialist_audit',
    goalId: 'goal_agent_market_research',
    projectId: 'proj_celly_v2',
    assignedAgentId: 'agent_nova_02',
    title: 'Hire Aegis Security Agent for Network Protocol Verification',
    description: 'Nova requests to delegate 75 credits to Aegis for independent protocol security review.',
    requirements: ['Human approval required (amount > 50 credits limit)'],
    context: 'Nova identified security considerations for agent-to-agent credit transactions.',
    constraints: ['Awaiting owner sign-off'],
    expectedOutput: 'Approved work packet and escrow transfer.',
    dependencies: [],
    status: 'waiting',
    priority: 'urgent',
    budget: 75,
    costCredits: 0,
    modelUsed: 'gemini-2.5-flash',
    verificationState: 'unverified',
    result: 'Blocked awaiting human authorization to release 75 credits.',
    progressPercent: 30,
    createdAt: '2026-09-24T10:15:00Z',
    startedAt: null,
    completedAt: null
  }
];

const INITIAL_MEMORIES: Memory[] = [
  {
    id: 'mem_1',
    agentId: 'agent_atlas_01',
    projectId: 'proj_celly_v2',
    goalId: 'goal_celly_landing',
    taskId: 'task_market_research',
    eventType: 'TASK_COMPLETED',
    summary: 'Completed competitor design benchmarks using Gemini 2.5 Pro. Extracted high-contrast UI patterns.',
    importance: 'medium',
    timestamp: '2026-09-24T08:45:00Z'
  },
  {
    id: 'mem_2',
    agentId: 'agent_atlas_01',
    projectId: 'proj_celly_v2',
    goalId: 'goal_celly_landing',
    taskId: 'task_generate_landing_structure',
    eventType: 'MODEL_ROUTED',
    summary: 'Model Router switched execution from Gemini 2.5 Pro to Claude 3.7 Sonnet for strict TypeScript generation. Agent identity and project state preserved 100%.',
    importance: 'high',
    timestamp: '2026-09-24T11:00:00Z'
  },
  {
    id: 'mem_3',
    agentId: 'agent_atlas_01',
    projectId: 'proj_celly_v2',
    goalId: 'goal_celly_landing',
    taskId: 'task_generate_landing_structure',
    eventType: 'KNOW_HOW_EXTRACTED',
    summary: 'Extracted durable know-how: "High-Conversion Dark Mode Landing Component Architecture". Stored in agent knowledge base.',
    importance: 'high',
    timestamp: '2026-09-24T11:35:00Z'
  },
  {
    id: 'mem_4',
    agentId: 'agent_nova_02',
    projectId: 'proj_celly_v2',
    goalId: 'goal_agent_market_research',
    taskId: 'task_hire_specialist_audit',
    eventType: 'APPROVAL_REQUESTED',
    summary: 'Requested human approval to spend 75 credits hiring Aegis for security protocol verification.',
    importance: 'high',
    timestamp: '2026-09-24T10:15:00Z'
  },
  {
    id: 'mem_5',
    agentId: 'agent_atlas_01',
    projectId: null,
    goalId: null,
    taskId: null,
    eventType: 'SOURCE_STUDIED',
    summary: 'Studied GitHub repository "vercel/next.js". Extracted patterns for Server Actions and Streaming SSR. (Imported learning source).',
    importance: 'medium',
    timestamp: '2026-09-22T10:00:00Z'
  }
];

const INITIAL_KNOW_HOW: KnowHow[] = [
  {
    id: 'kh_1',
    agentId: 'agent_atlas_01',
    title: 'High-Conversion Dark Mode Landing Component Architecture',
    domain: 'Frontend & Growth',
    problemPattern: 'Building accessible dark-themed hero components with dynamic state without hydration mismatches.',
    validatedProcedure: [
      'Declare client-side interactivity explicitly with client boundaries.',
      'Inject semantic ARIA live regions for form feedback.',
      'Use subtle monotonic gradient text with high contrast background tokens.'
    ],
    reusableCodeOrRule: 'Ensure interactive inputs use tabIndex=0 and visible focus rings with color contrast >= 4.5:1.',
    confidenceScore: 96,
    timesApplied: 12,
    isVerified: true,
    provenance: {
      verifiedInTaskId: 'task_generate_landing_structure',
      verifiedInProjectId: 'proj_celly_v2'
    },
    createdAt: '2026-09-24T11:35:00Z',
    updatedAt: '2026-09-24T11:35:00Z'
  },
  {
    id: 'kh_2',
    agentId: 'agent_atlas_01',
    title: 'Scoped Agent Token Boundary Verification Pattern',
    domain: 'Security & Auth',
    problemPattern: 'Preventing delegated sub-agents from inheriting broader permissions than parent agent.',
    validatedProcedure: [
      'Inspect parent permission mask at runtime before signing work packet.',
      'Apply strict bitwise AND clamp on delegated permissions.',
      'Fail immediately with 403 Forbidden if delegated agent requests escalation.'
    ],
    reusableCodeOrRule: 'const childPerms = parentPerms.filter(p => requestedPerms.includes(p));',
    confidenceScore: 99,
    timesApplied: 28,
    isVerified: true,
    provenance: {
      derivedFromSourceId: 'src_gh_owasp',
      verifiedInTaskId: 'task_security_audit_verify',
      verifiedInProjectId: 'proj_celly_v2'
    },
    createdAt: '2026-09-22T14:10:00Z',
    updatedAt: '2026-09-24T09:00:00Z'
  },
  {
    id: 'kh_3',
    agentId: 'agent_nova_02',
    title: 'Multi-Model Cost/Latency Routing Optimization Matrix',
    domain: 'Model Orchestration',
    problemPattern: 'Minimizing credit consumption while maintaining 99%+ verification accuracy.',
    validatedProcedure: [
      'Route pure text summarization and categorization to Gemini 2.5 Flash (2 credits/1k).',
      'Route production coding and type systems to Claude 3.7 Sonnet (12 credits/1k).',
      'Route security and cryptographic assertions to DeepSeek R1 (4 credits/1k).'
    ],
    reusableCodeOrRule: 'Task router threshold: if task.isSecurity -> DeepSeek, else if task.isCoding -> Claude, else -> Gemini.',
    confidenceScore: 95,
    timesApplied: 47,
    isVerified: true,
    provenance: {
      derivedFromSourceId: 'src_paper_agentic',
      verifiedInTaskId: 'task_market_data_synthesis'
    },
    createdAt: '2026-09-20T16:00:00Z',
    updatedAt: '2026-09-24T10:00:00Z'
  }
];

const INITIAL_WORK_PACKETS: WorkPacket[] = [
  {
    id: 'wp_sec_audit_01',
    goalId: 'goal_celly_landing',
    taskId: 'task_security_audit_verify',
    requestingAgentId: 'agent_atlas_01',
    requestedAgentId: 'agent_aegis_sec',
    taskTitle: 'Perform Security & Permission Boundary Audit of Celly Marketing Gateway',
    context: 'Atlas requests independent audit before staging release.',
    constraints: ['Read-only file access', 'Timeout within 120s', 'Cryptographic evidence required'],
    expectedOutput: 'Detailed markdown audit report and verification certificate.',
    budget: 30,
    status: 'proposed',
    result: null,
    escrowCredits: 30,
    createdAt: '2026-09-24T09:00:00Z',
    completedAt: null
  }
];

const INITIAL_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'tx_seed_01',
    senderId: 'SYSTEM',
    receiverId: 'agent_atlas_01',
    amount: 1500,
    reason: 'Initial Human Owner Funding Allocation',
    taskId: null,
    timestamp: '2026-08-10T09:00:00Z',
    status: 'settled'
  },
  {
    id: 'tx_exec_02',
    senderId: 'agent_atlas_01',
    receiverId: 'SYSTEM',
    amount: 8,
    reason: 'Model Execution: Gemini 2.5 Pro (Market Research Task)',
    taskId: 'task_market_research',
    timestamp: '2026-09-24T08:45:00Z',
    status: 'settled'
  },
  {
    id: 'tx_exec_03',
    senderId: 'agent_atlas_01',
    receiverId: 'SYSTEM',
    amount: 14,
    reason: 'Model Execution: Claude 3.7 Sonnet (Landing Structure Task)',
    taskId: 'task_generate_landing_structure',
    timestamp: '2026-09-24T11:00:00Z',
    status: 'settled'
  },
  {
    id: 'tx_escrow_04',
    senderId: 'agent_atlas_01',
    receiverId: 'NETWORK_ESCROW',
    amount: 30,
    reason: 'WorkPacket Escrow: Security Audit Task delegation to Aegis',
    taskId: 'task_security_audit_verify',
    timestamp: '2026-09-24T09:00:00Z',
    status: 'escrowed'
  }
];

const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: 'appr_nova_hire',
    agentId: 'agent_nova_02',
    title: 'Authorize 75 Credits to Hire Aegis for Protocol Review',
    description: 'Nova wants to hire Aegis (Specialist Agent) on the Continuum Network for 75 credits to conduct deep protocol verification. (Exceeds Nova auto-threshold).',
    actionType: 'SPEND_CREDITS',
    creditsRequested: 75,
    targetEntity: 'agent_aegis_sec',
    payload: {
      reason: 'Cross-agent escrow security validation',
      workPacketId: 'wp_pending_nova_02',
      budget: 75
    },
    status: 'pending',
    createdAt: '2026-09-24T10:15:00Z',
    resolvedAt: null
  }
];

const INITIAL_ACTIVITY: ActivityEvent[] = [
  {
    id: 'act_1',
    agentId: 'agent_atlas_01',
    type: 'TASK_PROGRESS',
    title: 'Atlas executing landing page structure',
    description: 'Generated LandingHero.tsx component using Claude 3.7 Sonnet runtime (14 credits used).',
    timestamp: '2026-09-24T11:45:00Z'
  },
  {
    id: 'act_2',
    agentId: 'agent_atlas_01',
    type: 'MODEL_SWITCH',
    title: 'Model Router dynamically selected Claude 3.7 Sonnet',
    description: 'Switched from Gemini to Claude for high-precision TypeScript syntax.',
    timestamp: '2026-09-24T11:00:00Z'
  },
  {
    id: 'act_3',
    agentId: 'agent_nova_02',
    type: 'APPROVAL_REQUESTED',
    title: 'Nova requested human approval for 75 credit expenditure',
    description: 'Awaiting human authorization to hire Aegis Security specialist.',
    timestamp: '2026-09-24T10:15:00Z'
  },
  {
    id: 'act_4',
    agentId: 'agent_atlas_01',
    type: 'KNOW_HOW_SAVED',
    title: 'Atlas stored reusable know-how into permanent memory',
    description: 'Saved "High-Conversion Dark Mode Landing Component Architecture".',
    timestamp: '2026-09-24T09:30:00Z'
  },
  {
    id: 'act_5',
    agentId: 'agent_atlas_01',
    type: 'TASK_COMPLETED',
    title: 'Atlas completed design benchmarking task',
    description: 'Verified with 99/100 score and saved benchmarking outputs.',
    timestamp: '2026-09-24T08:45:00Z'
  }
];

const INITIAL_AWAY_DIGEST: AwayDigest = {
  lastOfflineTime: '2026-09-23T22:00:00Z',
  summary: 'While you were away, your persistent agents continued autonomous execution on your active goals.',
  completedTasksCount: 4,
  knowHowLearnedCount: 2,
  creditsSpent: 52,
  pendingApprovalsCount: 1,
  highlights: [
    {
      icon: 'CheckCircle',
      agentName: 'Atlas',
      title: 'Completed design benchmark analysis & created LandingHero.tsx',
      timeAgo: '35m ago',
      type: 'success'
    },
    {
      icon: 'BookOpen',
      agentName: 'Atlas',
      title: 'Learned and validated 1 reusable engineering know-how pattern',
      timeAgo: '1h ago',
      type: 'learning'
    },
    {
      icon: 'Share2',
      agentName: 'Nova',
      title: 'Created WorkPacket to hire Aegis Security on the Continuum network',
      timeAgo: '2h ago',
      type: 'collab'
    },
    {
      icon: 'AlertTriangle',
      agentName: 'Nova',
      title: 'Requested human approval for 75 credits specialist hire',
      timeAgo: '2h ago',
      type: 'approval'
    }
  ]
};

class DatabaseStore {
  private state: ContinuumState;

  constructor() {
    this.state = this.loadState();
  }

  private ensureStateShape(s: Partial<ContinuumState>): ContinuumState {
    return {
      agents: Array.isArray(s.agents) ? s.agents : INITIAL_AGENTS,
      goals: Array.isArray(s.goals) ? s.goals : INITIAL_GOALS,
      tasks: Array.isArray(s.tasks) ? s.tasks : INITIAL_TASKS,
      projects: Array.isArray(s.projects) ? s.projects : INITIAL_PROJECTS,
      humanContexts: Array.isArray(s.humanContexts) ? s.humanContexts : INITIAL_HUMAN_CONTEXTS,
      importedSources: Array.isArray(s.importedSources) ? s.importedSources : INITIAL_IMPORTED_SOURCES,
      agentExperiences: Array.isArray(s.agentExperiences) ? s.agentExperiences : INITIAL_AGENT_EXPERIENCES,
      memories: Array.isArray(s.memories) ? s.memories : INITIAL_MEMORIES,
      knowHow: Array.isArray(s.knowHow) ? s.knowHow : INITIAL_KNOW_HOW,
      workPackets: Array.isArray(s.workPackets) ? s.workPackets : INITIAL_WORK_PACKETS,
      transactions: Array.isArray(s.transactions) ? s.transactions : INITIAL_TRANSACTIONS,
      approvals: Array.isArray(s.approvals) ? s.approvals : INITIAL_APPROVALS,
      activity: Array.isArray(s.activity) ? s.activity : INITIAL_ACTIVITY,
      modelProviders: Array.isArray(s.modelProviders) ? s.modelProviders : AVAILABLE_MODELS,
      awayDigest: s.awayDigest || INITIAL_AWAY_DIGEST,
      isRunningAutonomous: s.isRunningAutonomous ?? true
    };
  }

  private loadState(): ContinuumState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(STATE_FILE)) {
        const raw = fs.readFileSync(STATE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const validState = this.ensureStateShape(parsed);
        this.saveStateDirect(validState);
        return validState;
      }
    } catch (e) {
      console.warn('Could not read saved state file, using initial default state:', e);
    }

    const defaultState: ContinuumState = {
      agents: INITIAL_AGENTS,
      goals: INITIAL_GOALS,
      tasks: INITIAL_TASKS,
      projects: INITIAL_PROJECTS,
      humanContexts: INITIAL_HUMAN_CONTEXTS,
      importedSources: INITIAL_IMPORTED_SOURCES,
      agentExperiences: INITIAL_AGENT_EXPERIENCES,
      memories: INITIAL_MEMORIES,
      knowHow: INITIAL_KNOW_HOW,
      workPackets: INITIAL_WORK_PACKETS,
      transactions: INITIAL_TRANSACTIONS,
      approvals: INITIAL_APPROVALS,
      activity: INITIAL_ACTIVITY,
      modelProviders: AVAILABLE_MODELS,
      awayDigest: INITIAL_AWAY_DIGEST,
      isRunningAutonomous: true
    };

    this.saveStateDirect(defaultState);
    return defaultState;
  }

  private saveStateDirect(state: ContinuumState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write continuum state to disk:', e);
    }
  }

  public getState(): ContinuumState {
    this.state = this.ensureStateShape(this.state);
    return this.state;
  }

  public saveState(): void {
    this.saveStateDirect(this.state);
  }

  public resetState(): ContinuumState {
    const defaultState: ContinuumState = {
      agents: INITIAL_AGENTS,
      goals: INITIAL_GOALS,
      tasks: INITIAL_TASKS,
      projects: INITIAL_PROJECTS,
      humanContexts: INITIAL_HUMAN_CONTEXTS,
      importedSources: INITIAL_IMPORTED_SOURCES,
      agentExperiences: INITIAL_AGENT_EXPERIENCES,
      memories: INITIAL_MEMORIES,
      knowHow: INITIAL_KNOW_HOW,
      workPackets: INITIAL_WORK_PACKETS,
      transactions: INITIAL_TRANSACTIONS,
      approvals: INITIAL_APPROVALS,
      activity: INITIAL_ACTIVITY,
      modelProviders: AVAILABLE_MODELS,
      awayDigest: INITIAL_AWAY_DIGEST,
      isRunningAutonomous: true
    };
    this.state = defaultState;
    this.saveState();
    return this.state;
  }

  // --- Agents ---
  public getAgents(): Agent[] {
    return this.state.agents;
  }

  public getAgentById(id: string): Agent | undefined {
    return this.state.agents.find(a => a.id === id);
  }

  public addAgent(agent: Agent): Agent {
    this.state.agents.unshift(agent);
    this.addActivityEvent({
      id: `act_${Date.now()}`,
      agentId: agent.id,
      type: 'AGENT_CREATED',
      title: `Persistent Agent "${agent.name}" created`,
      description: `New agent initialized with purpose: "${agent.purpose}". Persistent identity registered.`,
      timestamp: new Date().toISOString()
    });
    this.saveState();
    return agent;
  }

  public updateAgent(id: string, updates: Partial<Agent>): Agent | null {
    const idx = this.state.agents.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.state.agents[idx] = { ...this.state.agents[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveState();
    return this.state.agents[idx];
  }

  // --- Goals & Tasks ---
  public getGoals(): Goal[] {
    return this.state.goals;
  }

  public addGoal(goal: Goal): Goal {
    this.state.goals.unshift(goal);
    this.addActivityEvent({
      id: `act_${Date.now()}`,
      agentId: goal.agentId,
      type: 'GOAL_DEFINED',
      title: `New Human Outcome: "${goal.title}"`,
      description: `Agent decomposing goal into executable task graph.`,
      timestamp: new Date().toISOString()
    });
    this.saveState();
    return goal;
  }

  public updateGoal(id: string, updates: Partial<Goal>): Goal | null {
    const idx = this.state.goals.findIndex(g => g.id === id);
    if (idx === -1) return null;
    this.state.goals[idx] = { ...this.state.goals[idx], ...updates };
    this.saveState();
    return this.state.goals[idx];
  }

  public getTasks(): Task[] {
    return this.state.tasks;
  }

  public addTask(task: Task): Task {
    this.state.tasks.push(task);
    this.saveState();
    return task;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const idx = this.state.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.state.tasks[idx] = { ...this.state.tasks[idx], ...updates };
    this.saveState();
    return this.state.tasks[idx];
  }

  // --- Projects ---
  public getProjects(): Project[] {
    return this.state.projects;
  }

  public addProject(project: Project): Project {
    this.state.projects.unshift(project);
    this.saveState();
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | null {
    const idx = this.state.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.state.projects[idx] = { ...this.state.projects[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveState();
    return this.state.projects[idx];
  }

  // --- Layer A: Human Context ---
  public addHumanContext(ctx: HumanContext): HumanContext {
    this.state.humanContexts.unshift(ctx);
    this.saveState();
    return ctx;
  }

  // --- Layer B: Imported Knowledge (GitHub, Docs) ---
  public importSource(source: ImportedSource): ImportedSource {
    this.state.importedSources.unshift(source);
    
    // Update agent's studiedSourcesCount (does NOT increase verified experience or project count!)
    const agent = this.getAgentById(source.agentId);
    if (agent) {
      agent.studiedSourcesCount = (agent.studiedSourcesCount || 0) + 1;
      
      // Advance relevant skill knowledge from 'exposed' to 'studied'
      source.technologies.forEach(tech => {
        const matchingSkill = agent.skills.find(s => s.name.toLowerCase().includes(tech.toLowerCase()) || tech.toLowerCase().includes(s.name.toLowerCase()));
        if (matchingSkill && matchingSkill.stage === 'exposed') {
          matchingSkill.stage = 'studied';
          matchingSkill.knowledgeProgress = Math.min(100, matchingSkill.knowledgeProgress + 20);
        }
      });
    }

    this.addMemory({
      id: `mem_${Date.now()}`,
      agentId: source.agentId,
      projectId: null,
      goalId: null,
      taskId: null,
      eventType: 'SOURCE_STUDIED',
      summary: `Studied external material "${source.title}" (${source.sourceType}). Extracted concepts: ${source.extractedConcepts.join(', ')}. (Imported learning source; not agent experience).`,
      importance: 'medium',
      timestamp: new Date().toISOString()
    });

    this.addActivityEvent({
      id: `act_${Date.now()}`,
      agentId: source.agentId,
      type: 'SOURCE_STUDIED',
      title: `${agent?.name || 'Agent'} studied "${source.title}"`,
      description: `Analyzed external repository. Provenance preserved: ${source.provenanceSummary}`,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return source;
  }

  // --- Layer C: Agent Experience (Earned through actual work) ---
  public addAgentExperience(exp: AgentExperience): AgentExperience {
    this.state.agentExperiences.unshift(exp);
    
    // Increment verified experience on agent
    const agent = this.getAgentById(exp.agentId);
    if (agent) {
      agent.reputation.overallScore = Math.min(100, agent.reputation.overallScore + 1);
      agent.reputation.recentEvents.unshift({
        id: `rep_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'VERIFIED_WORK',
        delta: +1,
        reason: `Completed and verified ${exp.workType} in "${exp.projectTitle}"`
      });
    }

    this.saveState();
    return exp;
  }

  // --- Memories & Know-how ---
  public addMemory(memory: Memory): Memory {
    this.state.memories.unshift(memory);
    const agent = this.getAgentById(memory.agentId);
    if (agent) {
      agent.memoriesCount += 1;
    }
    this.saveState();
    return memory;
  }

  public addKnowHow(knowHow: KnowHow): KnowHow {
    this.state.knowHow.unshift(knowHow);
    const agent = this.getAgentById(knowHow.agentId);
    if (agent) {
      agent.knowHowCount += 1;
    }
    this.addActivityEvent({
      id: `act_${Date.now()}`,
      agentId: knowHow.agentId,
      type: 'KNOW_HOW_SAVED',
      title: `Learned Know-How: "${knowHow.title}"`,
      description: `Validated procedural strategy saved in permanent agent knowledge base.`,
      timestamp: new Date().toISOString()
    });
    this.saveState();
    return knowHow;
  }

  // --- Ledger & Transactions ---
  public addTransaction(tx: CreditTransaction): CreditTransaction {
    this.state.transactions.unshift(tx);
    if (tx.senderId !== 'SYSTEM' && tx.senderId !== 'USER' && tx.senderId !== 'NETWORK_ESCROW') {
      const sender = this.getAgentById(tx.senderId);
      if (sender) sender.credits = Math.max(0, sender.credits - tx.amount);
    }
    if (tx.receiverId !== 'SYSTEM' && tx.receiverId !== 'USER' && tx.receiverId !== 'NETWORK_ESCROW') {
      const receiver = this.getAgentById(tx.receiverId);
      if (receiver) receiver.credits += tx.amount;
    }
    this.saveState();
    return tx;
  }

  // --- Approvals ---
  public getApprovals(): ApprovalItem[] {
    return this.state.approvals;
  }

  public resolveApproval(id: string, decision: 'approved' | 'rejected'): ApprovalItem | null {
    const item = this.state.approvals.find(a => a.id === id);
    if (!item) return null;
    item.status = decision;
    item.resolvedAt = new Date().toISOString();

    this.addActivityEvent({
      id: `act_${Date.now()}`,
      agentId: item.agentId,
      type: decision === 'approved' ? 'APPROVAL_GRANTED' : 'APPROVAL_REJECTED',
      title: `Human ${decision === 'approved' ? 'Approved' : 'Rejected'}: ${item.title}`,
      description: `Action resolved by user. Agent resumes execution path.`,
      timestamp: new Date().toISOString()
    });

    if (decision === 'approved' && item.creditsRequested && item.targetEntity) {
      this.addTransaction({
        id: `tx_${Date.now()}`,
        senderId: item.agentId,
        receiverId: item.targetEntity,
        amount: item.creditsRequested,
        reason: `Approved Delegation to ${item.targetEntity}`,
        taskId: null,
        timestamp: new Date().toISOString(),
        status: 'settled'
      });
    }

    this.saveState();
    return item;
  }

  // --- Activity ---
  public addActivityEvent(event: ActivityEvent): ActivityEvent {
    this.state.activity.unshift(event);
    if (this.state.activity.length > 100) {
      this.state.activity.pop();
    }
    this.saveState();
    return event;
  }

  public setAutonomousRunning(running: boolean): void {
    this.state.isRunningAutonomous = running;
    this.saveState();
  }
}

// Database Singleton instance
export const db = new DatabaseStore();
