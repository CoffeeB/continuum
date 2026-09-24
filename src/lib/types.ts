export type AgentStatus = 'idle' | 'working' | 'waiting_approval' | 'paused' | 'learning' | 'verifying';

export interface AgentChatMessage {
  id: string;
  agentId: string;
  sender: 'human' | 'agent' | 'system';
  content: string;
  timestamp: string;
  actionTaken?: string;
  suggestedPrompts?: string[];
}

export type TaskStatus = 
  | 'queued' 
  | 'planning' 
  | 'assigned' 
  | 'executing' 
  | 'waiting' 
  | 'blocked' 
  | 'verification' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type VerificationState = 'unverified' | 'in_review' | 'verified_pass' | 'verified_fail';

export type SkillStage = 'exposed' | 'studied' | 'practiced' | 'demonstrated' | 'verified' | 'certified';

export interface AgentPermissions {
  projectFiles: 'read_write' | 'read_only';
  internetAccess: boolean;
  hireAgents: boolean;
  maxCreditsPerTask: number;
  deleteProject: boolean;
  externalMoney: boolean;
  signContracts: boolean;
}

export interface SkillEvidence {
  id: string;
  taskTitle: string;
  projectTitle: string;
  date: string;
  score: number; // 0 - 100
  verifiedByAgentId: string;
  summary: string;
}

export interface AgentSkill {
  id: string;
  name: string;
  category: string;
  description: string;
  stage: SkillStage; // 'exposed' | 'studied' | 'practiced' | 'demonstrated' | 'verified' | 'certified'
  knowledgeProgress: number; // 0 - 100 (from study & imported material)
  practiceProgress: number; // 0 - 100 (from agent's own execution)
  verifiedProjectsCount: number; // Only incremented by agent-executed projects!
  certificationLevel: string; // e.g. "Level 1: Novice", "Level 2: Practitioner", "Level 3: Specialist", "Level 4: Master"
  lastDemonstrated: string;
  evidence: SkillEvidence[];
}

export interface ReputationCategory {
  category: string;
  verifiedProjects: number;
  successRate: number; // percentage e.g. 96
  avgScore: number; // percentage e.g. 92
}

export interface ReputationEvent {
  id: string;
  date: string;
  type: string;
  delta: number;
  reason: string;
}

export interface AgentReputation {
  overallScore: number;
  deliveryConsistency: number;
  qualityScore: number;
  verificationPassRate: number;
  categories: ReputationCategory[];
  recentEvents: ReputationEvent[];
}

export interface Agent {
  id: string;
  name: string;
  ownerId: string;
  avatarColor: string;
  purpose: string;
  specialization: string;
  status: AgentStatus;
  currentGoalId: string | null;
  currentTaskId: string | null;
  currentModelId: string; // The active model runtime being used
  credits: number;
  reputation: AgentReputation;
  permissions: AgentPermissions;
  skills: AgentSkill[];
  knowHowCount: number;
  memoriesCount: number;
  totalTasksCompleted: number;
  activeProjectCount: number;
  studiedSourcesCount: number;
  createdAt: string;
  updatedAt: string;
  lastDemonstratedAt: string;
}

export interface Goal {
  id: string;
  agentId: string;
  projectId: string;
  title: string;
  description: string;
  status: 'pending' | 'planning' | 'in_progress' | 'completed' | 'blocked' | 'failed';
  progress: number; // 0 - 100
  taskIds: string[];
  createdAt: string;
  completedAt: string | null;
}

export interface TaskArtifact {
  name: string;
  type: 'code' | 'doc' | 'config' | 'report' | 'schema';
  content: string;
  path?: string;
}

export interface Task {
  id: string;
  goalId: string;
  projectId: string;
  assignedAgentId: string;
  title: string;
  description: string;
  requirements: string[];
  context: string;
  constraints: string[];
  expectedOutput: string;
  dependencies: string[]; // task IDs
  status: TaskStatus;
  priority: TaskPriority;
  budget: number;
  costCredits: number;
  modelUsed: string;
  verificationState: VerificationState;
  verificationEvidence?: string;
  result: string | null;
  artifacts?: TaskArtifact[];
  progressPercent: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  createdByAgentId: string;
  updatedAt: string;
}

export interface ProjectDecision {
  id: string;
  title: string;
  rationale: string;
  agentId: string;
  modelUsed: string;
  timestamp: string;
  status: 'autonomous' | 'approved' | 'rejected';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  assignedAgentIds: string[];
  status: 'active' | 'archived' | 'completed';
  origin: 'continuum_agent' | 'imported';
  budget: number;
  spentCredits: number;
  files: ProjectFile[];
  decisions: ProjectDecision[];
  createdAt: string;
  updatedAt: string;
}

export interface Memory {
  id: string;
  agentId: string;
  projectId: string | null;
  goalId: string | null;
  taskId: string | null;
  eventType: string; // e.g. "TASK_COMPLETED", "MODEL_ROUTED", "AGENT_HIRED", "VULNERABILITY_FIXED", "SOURCE_STUDIED"
  summary: string;
  details?: Record<string, unknown>;
  importance: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface KnowHow {
  id: string;
  agentId: string;
  title: string;
  domain: string;
  problemPattern: string;
  validatedProcedure: string[];
  reusableCodeOrRule: string;
  confidenceScore: number; // 0 - 100
  timesApplied: number;
  isVerified: boolean;
  provenance: {
    derivedFromSourceId?: string;
    verifiedInTaskId?: string;
    verifiedInProjectId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Layer A: Human Context
export interface HumanContext {
  id: string;
  ownerId: string;
  title: string;
  category: 'company_doc' | 'personal_preference' | 'project_requirement' | 'brand_guideline' | 'architecture_brief';
  content: string;
  createdAt: string;
}

// Layer B: Imported Knowledge (External sources studied by agent)
export interface ImportedSource {
  id: string;
  agentId: string;
  sourceType: 'github' | 'gitlab' | 'documentation' | 'research_paper' | 'dataset' | 'design_file';
  sourceUrl: string;
  title: string;
  originalAuthor: string;
  relationship: 'studied' | 'referenced' | 'analyzed' | 'learning_material';
  technologies: string[];
  extractedConcepts: string[];
  practiceTasksGenerated: number;
  importedAt: string;
  provenanceSummary: string; // e.g. "Authored by Vercel community. Studied by Atlas on 2026-09-24."
}

// Layer C: Agent Experience (Strictly earned through agent's own work)
export interface AgentExperience {
  id: string;
  agentId: string;
  projectId: string;
  projectTitle: string;
  taskId: string | null;
  workType: 'implementation' | 'architecture' | 'security_audit' | 'optimization' | 'research';
  role: string; // e.g. "Lead Implementation", "Security Auditor", "System Architect"
  outputArtifactsCount: number;
  verificationState: 'verified_pass' | 'verified_fail' | 'peer_reviewed';
  verifier: string;
  outcome: string;
  evidence: string;
  timestamp: string;
  provenance: 'agent_executed'; // Permanent marker: performed by agent
}

export interface WorkPacket {
  id: string;
  goalId: string;
  taskId: string;
  requestingAgentId: string;
  requestedAgentId: string;
  taskTitle: string;
  context: string;
  constraints: string[];
  expectedOutput: string;
  budget: number;
  status: 'proposed' | 'accepted' | 'in_progress' | 'verification' | 'completed' | 'rejected';
  result: string | null;
  escrowCredits: number;
  createdAt: string;
  completedAt: string | null;
}

export interface CreditTransaction {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  reason: string;
  taskId: string | null;
  timestamp: string;
  status: 'settled' | 'escrowed' | 'refunded';
}

export interface ApprovalItem {
  id: string;
  agentId: string;
  title: string;
  description: string;
  actionType: 'SPEND_CREDITS' | 'DELETE_DATA' | 'PUBLISH_EXTERNAL' | 'SECURITY_OVERRIDE' | 'HIRE_EXTERNAL_AGENT';
  creditsRequested?: number;
  targetEntity?: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt: string | null;
}

export interface ActivityEvent {
  id: string;
  agentId: string;
  type: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface ModelProviderConfig {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'google' | 'deepseek' | 'local' | 'continuum-engine';
  specialization: 'Reasoning & Architecture' | 'Coding & Verification' | 'Fast Execution & Classification' | 'Security & Deep Math' | 'Autonomous Engine';
  costPer1kCredits: number;
  avgLatencyMs: number;
  contextWindow: string;
  reliabilityScore: number;
  isAvailable: boolean;
  description: string;
}

export interface AwayDigest {
  lastOfflineTime: string;
  summary: string;
  completedTasksCount: number;
  knowHowLearnedCount: number;
  creditsSpent: number;
  pendingApprovalsCount: number;
  highlights: {
    icon: string;
    agentName: string;
    title: string;
    timeAgo: string;
    type: 'success' | 'approval' | 'learning' | 'collab';
  }[];
}

export interface ContinuumState {
  agents: Agent[];
  goals: Goal[];
  tasks: Task[];
  projects: Project[];
  humanContexts: HumanContext[];
  importedSources: ImportedSource[];
  agentExperiences: AgentExperience[];
  memories: Memory[];
  knowHow: KnowHow[];
  workPackets: WorkPacket[];
  transactions: CreditTransaction[];
  approvals: ApprovalItem[];
  activity: ActivityEvent[];
  modelProviders: ModelProviderConfig[];
  awayDigest: AwayDigest;
  isRunningAutonomous: boolean;
}
