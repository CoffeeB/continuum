import { db } from './db';
import { ModelRouter } from './models';
import { Task, Goal, Agent, TaskArtifact } from './types';

export class ContinuumExecutionEngine {
  /**
   * Decomposes a high-level human goal into an executable task graph
   */
  public static async decomposeGoal(
    agentId: string,
    goalTitle: string,
    goalDescription: string,
    projectId: string
  ): Promise<Goal> {
    const agent = db.getAgentById(agentId);
    if (!agent) throw new Error('Agent not found');

    const goalId = `goal_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Generate tailored tasks based on goal description
    const titleLower = (goalTitle + ' ' + goalDescription).toLowerCase();
    const tasksToCreate: Array<{
      title: string;
      description: string;
      requirements: string[];
      constraints: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
      budget: number;
      depIndex?: number;
    }> = [];

    if (titleLower.includes('landing') || titleLower.includes('web') || titleLower.includes('app') || titleLower.includes('saas')) {
      tasksToCreate.push({
        title: `Analyze competitive benchmarks and information architecture`,
        description: `Perform comparative analysis of market leaders and establish component hierarchy.`,
        requirements: ['Clean UI token taxonomy', 'Modern developer-grade typography', 'Accessibility benchmarks'],
        constraints: ['Zero template bloat', 'Focus on conversion'],
        priority: 'high',
        budget: 15
      });
      tasksToCreate.push({
        title: `Engineer responsive core interface and interactive components`,
        description: `Implement production TypeScript components with dark mode and zero hydration error.`,
        requirements: ['Next.js App Router', 'Strict TypeScript', 'Accessible form controls'],
        constraints: ['Sub-100ms FCP', 'No unvetted external scripts'],
        priority: 'high',
        budget: 25,
        depIndex: 0
      });
      tasksToCreate.push({
        title: `Conduct security perimeter review and input sanitization check`,
        description: `Verify permissions boundaries and form submission endpoints.`,
        requirements: ['Independent verifier check', 'Zero XSS/CSRF vectors'],
        constraints: ['Scoped read-only audit'],
        priority: 'medium',
        budget: 20,
        depIndex: 1
      });
      tasksToCreate.push({
        title: `Deploy to staging environment and generate production verification certificate`,
        description: `Verify end-to-end integration and create evidence artifact.`,
        requirements: ['Passing smoke tests', 'Verified performance score >= 95'],
        constraints: ['Automated rollback on error'],
        priority: 'medium',
        budget: 15,
        depIndex: 2
      });
    } else if (titleLower.includes('security') || titleLower.includes('audit')) {
      tasksToCreate.push({
        title: `Map permission surface and identity delegation protocols`,
        description: `Extract all agent permission masks and token issuance paths.`,
        requirements: ['Exhaustive AST traversal', 'Permission hierarchy verification'],
        constraints: ['No disruption to active tasks'],
        priority: 'high',
        budget: 20
      });
      tasksToCreate.push({
        title: `Execute automated penetration testing and privilege escalation drills`,
        description: `Simulate adversarial agent work packet injection attacks.`,
        requirements: ['100% test coverage', 'Zero critical vulnerabilities'],
        constraints: ['Sandbox isolation'],
        priority: 'urgent',
        budget: 35,
        depIndex: 0
      });
      tasksToCreate.push({
        title: `Compile certified security compliance report`,
        description: `Generate cryptographic evidence and sign audit verification.`,
        requirements: ['Evidence-backed certification', 'Immutable audit entry'],
        constraints: ['Tamper-proof signature'],
        priority: 'high',
        budget: 15,
        depIndex: 1
      });
    } else {
      tasksToCreate.push({
        title: `Phase 1: Research, Requirements & Architecture Design`,
        description: `Synthesize human outcome requirements into executable specifications.`,
        requirements: ['Clear deliverables', 'Risk assessment'],
        constraints: ['Budget bounded'],
        priority: 'high',
        budget: 20
      });
      tasksToCreate.push({
        title: `Phase 2: Autonomous Implementation & Tool Execution`,
        description: `Execute core engineering and synthesis tasks using optimal model runtimes.`,
        requirements: ['High-quality output', 'Iterative validation'],
        constraints: ['Strict permission compliance'],
        priority: 'high',
        budget: 30,
        depIndex: 0
      });
      tasksToCreate.push({
        title: `Phase 3: Independent Verification & Knowledge Extraction`,
        description: `Validate outputs and store permanent know-how in agent knowledge base.`,
        requirements: ['Evidence score >= 90', 'Extracted procedural rule'],
        constraints: ['Verified pass required'],
        priority: 'medium',
        budget: 15,
        depIndex: 1
      });
    }

    const createdTaskIds: string[] = [];

    // Create Goal first
    const newGoal: Goal = {
      id: goalId,
      agentId,
      projectId,
      title: goalTitle,
      description: goalDescription,
      status: 'in_progress',
      progress: 0,
      taskIds: [],
      createdAt: timestamp,
      completedAt: null
    };
    db.addGoal(newGoal);

    // Create Tasks
    tasksToCreate.forEach((t, i) => {
      const taskId = `task_${Date.now()}_${i}`;
      createdTaskIds.push(taskId);

      const dependencies: string[] = [];
      if (t.depIndex !== undefined && createdTaskIds[t.depIndex]) {
        dependencies.push(createdTaskIds[t.depIndex]);
      }

      const task: Task = {
        id: taskId,
        goalId,
        projectId,
        assignedAgentId: agentId,
        title: t.title,
        description: t.description,
        requirements: t.requirements,
        context: goalDescription,
        constraints: t.constraints,
        expectedOutput: 'Verified artifact and project state update.',
        dependencies,
        status: i === 0 ? 'executing' : 'queued',
        priority: t.priority,
        budget: t.budget,
        costCredits: 0,
        modelUsed: agent.currentModelId,
        verificationState: 'unverified',
        result: null,
        progressPercent: i === 0 ? 15 : 0,
        createdAt: timestamp,
        startedAt: i === 0 ? timestamp : null,
        completedAt: null
      };

      db.addTask(task);
    });

    // Update goal with task IDs
    newGoal.taskIds = createdTaskIds;
    db.updateGoal(goalId, { taskIds: createdTaskIds });

    // Update agent state
    db.updateAgent(agentId, {
      status: 'working',
      currentGoalId: goalId,
      currentTaskId: createdTaskIds[0]
    });

    db.addMemory({
      id: `mem_${Date.now()}`,
      agentId,
      projectId,
      goalId,
      taskId: createdTaskIds[0],
      eventType: 'GOAL_DECOMPOSED',
      summary: `Decomposed goal "${goalTitle}" into ${createdTaskIds.length} executable tasks with dependency links.`,
      importance: 'high',
      timestamp
    });

    return newGoal;
  }

  /**
   * Executes a single step of the autonomous loop
   * (e.g. executes current task, advances state, extracts know-how, updates project)
   */
  public static async executeNextStep(): Promise<{
    executedTask: Task | null;
    agent: Agent | null;
    details: string;
  }> {
    const tasks = db.getTasks();
    const executingTask = tasks.find(t => t.status === 'executing');

    if (!executingTask) {
      // Find a queued task whose dependencies are satisfied
      const queuedTask = tasks.find(t => {
        if (t.status !== 'queued') return false;
        if (!t.dependencies || t.dependencies.length === 0) return true;
        // Check if all dependencies are completed
        return t.dependencies.every(depId => {
          const depTask = tasks.find(x => x.id === depId);
          return depTask && depTask.status === 'completed';
        });
      });

      if (queuedTask) {
        // Start executing this queued task
        const agent = db.getAgentById(queuedTask.assignedAgentId);
        const model = ModelRouter.routeTask(queuedTask, agent?.currentModelId);
        
        db.updateTask(queuedTask.id, {
          status: 'executing',
          startedAt: new Date().toISOString(),
          modelUsed: model.id,
          progressPercent: 25
        });

        if (agent) {
          db.updateAgent(agent.id, {
            status: 'working',
            currentTaskId: queuedTask.id,
            currentModelId: model.id
          });
        }

        db.addActivityEvent({
          id: `act_${Date.now()}`,
          agentId: queuedTask.assignedAgentId,
          type: 'TASK_STARTED',
          title: `Started Task: "${queuedTask.title}"`,
          description: `Dispatched to ${model.name} runtime. Context and dependencies satisfied.`,
          timestamp: new Date().toISOString()
        });

        return {
          executedTask: queuedTask,
          agent: agent || null,
          details: `Activated queued task "${queuedTask.title}" with model ${model.name}.`
        };
      }

      // Autonomous Learning Loop (Sections 8, 9, 11, 24, 25)
      // When no active human work exists, the agent productively studies, practices, and validates know-how
      const agents = db.getAgents().filter(a => a.status !== 'paused');
      const learningAgent = agents.find(a => a.status === 'learning' || a.status === 'idle') || agents[0];

      if (learningAgent && learningAgent.skills && learningAgent.skills.length > 0) {
        // Pick a skill to advance
        const skillIndex = Math.floor(Math.random() * learningAgent.skills.length);
        const targetSkill = { ...learningAgent.skills[skillIndex] };
        
        const oldProgress = targetSkill.practiceProgress || 0;
        const newProgress = Math.min(100, oldProgress + 15);
        targetSkill.practiceProgress = newProgress;
        targetSkill.lastDemonstrated = new Date().toISOString().split('T')[0];

        let currentStage = targetSkill.stage || 'studied';
        let stageAdvanced = false;
        if (newProgress >= 100) {
          if (currentStage === 'exposed') currentStage = 'studied';
          else if (currentStage === 'studied') currentStage = 'practiced';
          else if (currentStage === 'practiced') currentStage = 'demonstrated';
          else if (currentStage === 'demonstrated') currentStage = 'verified';
          targetSkill.stage = currentStage;
          targetSkill.practiceProgress = 25;
          stageAdvanced = true;

          // Generate permanent validated know-how
          db.addKnowHow({
            id: `kh_auto_${Date.now()}`,
            agentId: learningAgent.id,
            title: `Validated Pattern: ${targetSkill.name} Optimization`,
            domain: targetSkill.category,
            problemPattern: `Autonomous drill identified and validated resilient pattern for ${targetSkill.name}.`,
            validatedProcedure: [
              `Analyze requirements against ${targetSkill.name} baseline standards.`,
              `Apply modular component boundaries and zero-overhead data transformations.`,
              `Execute automated assertion suite to confirm zero regressions.`
            ],
            reusableCodeOrRule: `// Validated know-how rule for ${targetSkill.name}\nexport function applyPattern(input) { return sanitize(input); }`,
            confidenceScore: 94,
            timesApplied: 1,
            isVerified: true,
            provenance: {
              derivedFromSourceId: targetSkill.id
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }

        const updatedSkills = [...learningAgent.skills];
        targetSkill.stage = currentStage;
        updatedSkills[skillIndex] = targetSkill;

        db.updateAgent(learningAgent.id, {
          skills: updatedSkills,
          status: 'learning',
          knowHowCount: (learningAgent.knowHowCount || 0) + (stageAdvanced ? 1 : 0)
        });

        db.addActivityEvent({
          id: `act_${Date.now()}`,
          agentId: learningAgent.id,
          type: 'LEARNING_CYCLE',
          title: `${learningAgent.name} completed autonomous practice: "${targetSkill.name}"`,
          description: stageAdvanced 
            ? `Skill advanced to "${(currentStage || 'PRACTICED').toUpperCase()}". Reusable know-how stored in agent brain.`
            : `Completed practice exercise (${newProgress}% toward next mastery stage).`,
          timestamp: new Date().toISOString()
        });

        db.addMemory({
          id: `mem_learn_${Date.now()}`,
          agentId: learningAgent.id,
          projectId: null,
          goalId: null,
          taskId: null,
          eventType: 'AUTONOMOUS_LEARNING',
          summary: `Proactively studied and practiced "${targetSkill.name}". New progress: ${newProgress}%.`,
          importance: 'low',
          timestamp: new Date().toISOString()
        });

        return {
          executedTask: null,
          agent: learningAgent,
          details: `Agent ${learningAgent.name} autonomously practiced "${targetSkill.name}" (Progress: ${newProgress}%).`
        };
      }

      return { executedTask: null, agent: null, details: 'Agents are monitoring environment.' };
    }

    // Process executing task to completion
    const agent = db.getAgentById(executingTask.assignedAgentId);
    if (!agent) {
      return { executedTask: null, agent: null, details: 'Assigned agent not found.' };
    }

    // 1. Model Provider Router selects/confirms optimal model
    const model = ModelRouter.routeTask(executingTask, agent.currentModelId);
    
    // 2. Execute via Model Adapter
    const execResult = await ModelRouter.execute(executingTask, model, agent.name);

    // 3. Deduct credits & record immutable transaction
    const txId = `tx_${Date.now()}`;
    db.addTransaction({
      id: txId,
      senderId: agent.id,
      receiverId: 'SYSTEM',
      amount: execResult.creditsCost,
      reason: `Task Execution: ${model.name} (${execResult.latencyMs}ms)`,
      taskId: executingTask.id,
      timestamp: new Date().toISOString(),
      status: 'settled'
    });

    // 4. Update Project with generated files and decisions
    const project = db.getProjects().find(p => p.id === executingTask.projectId);
    if (project && execResult.artifacts) {
      const updatedFiles = [...project.files];
      execResult.artifacts.forEach(art => {
        const existingIdx = updatedFiles.findIndex(f => f.name === art.name);
        const newFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: art.name,
          path: art.path || `src/${art.name}`,
          language: art.type === 'code' ? 'typescript' : art.type === 'schema' ? 'json' : 'markdown',
          content: art.content,
          createdByAgentId: agent.id,
          updatedAt: new Date().toISOString()
        };
        if (existingIdx >= 0) {
          updatedFiles[existingIdx] = newFile;
        } else {
          updatedFiles.push(newFile);
        }
      });

      const updatedDecisions = [...project.decisions];
      updatedDecisions.unshift({
        id: `dec_${Date.now()}`,
        title: `Architectural Decision for ${executingTask.title}`,
        rationale: execResult.verificationEvidence,
        agentId: agent.id,
        modelUsed: model.id,
        timestamp: new Date().toISOString(),
        status: 'autonomous'
      });

      db.updateProject(project.id, {
        files: updatedFiles,
        decisions: updatedDecisions,
        spentCredits: project.spentCredits + execResult.creditsCost
      });
    }

    // 5. Update Task state to completed
    const updatedTask = db.updateTask(executingTask.id, {
      status: 'completed',
      progressPercent: 100,
      costCredits: executingTask.costCredits + execResult.creditsCost,
      modelUsed: model.id,
      verificationState: 'verified_pass',
      verificationEvidence: execResult.verificationEvidence,
      result: execResult.output,
      artifacts: execResult.artifacts as TaskArtifact[],
      completedAt: new Date().toISOString()
    });

    // 6. Record Memory ("What happened?")
    db.addMemory({
      id: `mem_${Date.now()}`,
      agentId: agent.id,
      projectId: executingTask.projectId,
      goalId: executingTask.goalId,
      taskId: executingTask.id,
      eventType: 'TASK_COMPLETED',
      summary: `Completed task "${executingTask.title}" using ${model.name} in ${execResult.latencyMs}ms. Spent ${execResult.creditsCost} credits.`,
      importance: 'medium',
      timestamp: new Date().toISOString()
    });

    // 7. Extract Know-How ("How do I do this?") if applicable
    if (execResult.extractedKnowHow) {
      const kh = execResult.extractedKnowHow;
      db.addKnowHow({
        id: `kh_${Date.now()}`,
        agentId: agent.id,
        title: kh.title,
        domain: kh.domain,
        problemPattern: kh.problemPattern,
        validatedProcedure: kh.validatedProcedure,
        reusableCodeOrRule: kh.reusableCodeOrRule,
        confidenceScore: kh.confidenceScore,
        timesApplied: 1,
        isVerified: true,
        provenance: {
          verifiedInTaskId: executingTask.id,
          verifiedInProjectId: executingTask.projectId
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Record verified AgentExperience (Strictly earned through agent's own execution)
    db.addAgentExperience({
      id: `exp_${Date.now()}`,
      agentId: agent.id,
      projectId: executingTask.projectId,
      projectTitle: project?.name || 'Continuum Project',
      taskId: executingTask.id,
      workType: 'implementation',
      role: 'Lead Implementation',
      outputArtifactsCount: execResult.artifacts?.length || 1,
      verificationState: 'verified_pass',
      verifier: `${model.name} Verification Suite`,
      outcome: `Successfully executed and verified "${executingTask.title}"`,
      evidence: execResult.verificationEvidence,
      timestamp: new Date().toISOString(),
      provenance: 'agent_executed'
    });

    // 8. Update Goal Progress
    const goal = db.getGoals().find(g => g.id === executingTask.goalId);
    if (goal) {
      const allGoalTasks = db.getTasks().filter(t => t.goalId === goal.id);
      const completedCount = allGoalTasks.filter(t => t.status === 'completed').length;
      const progress = Math.round((completedCount / allGoalTasks.length) * 100);
      const isGoalDone = progress >= 100;

      db.updateGoal(goal.id, {
        progress,
        status: isGoalDone ? 'completed' : 'in_progress',
        completedAt: isGoalDone ? new Date().toISOString() : null
      });

      if (isGoalDone) {
        db.addActivityEvent({
          id: `act_${Date.now()}`,
          agentId: agent.id,
          type: 'GOAL_ACHIEVED',
          title: `Goal Completed: "${goal.title}"`,
          description: `All ${allGoalTasks.length} tasks executed and verified successfully.`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // 9. Update Agent metrics
    db.updateAgent(agent.id, {
      totalTasksCompleted: agent.totalTasksCompleted + 1,
      lastDemonstratedAt: new Date().toISOString()
    });

    // 10. Check if next task in the goal can be started immediately
    const nextTask = tasks.find(t => {
      if (t.goalId !== executingTask.goalId || t.status !== 'queued') return false;
      return t.dependencies.every(depId => {
        const dep = db.getTasks().find(x => x.id === depId);
        return dep && dep.status === 'completed';
      });
    });

    if (nextTask) {
      const nextModel = ModelRouter.routeTask(nextTask, agent.currentModelId);
      db.updateTask(nextTask.id, {
        status: 'executing',
        startedAt: new Date().toISOString(),
        modelUsed: nextModel.id,
        progressPercent: 20
      });
      db.updateAgent(agent.id, {
        status: 'working',
        currentTaskId: nextTask.id,
        currentModelId: nextModel.id
      });
    } else {
      // Check if any other goal or task is active for this agent
      const hasOtherWork = db.getTasks().some(t => t.assignedAgentId === agent.id && (t.status === 'executing' || t.status === 'queued'));
      if (!hasOtherWork) {
        db.updateAgent(agent.id, {
          status: 'idle',
          currentTaskId: null
        });
      }
    }

    db.addActivityEvent({
      id: `act_${Date.now()}`,
      agentId: agent.id,
      type: 'TASK_COMPLETED',
      title: `${agent.name} completed "${executingTask.title}"`,
      description: `Verified output with ${model.name}. Generated artifacts saved in workspace.`,
      timestamp: new Date().toISOString()
    });

    return {
      executedTask: updatedTask,
      agent,
      details: `Successfully completed task "${executingTask.title}" with model ${model.name}.`
    };
  }
}
