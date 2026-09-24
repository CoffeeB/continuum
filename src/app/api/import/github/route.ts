import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ImportedSource } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agentId, repoUrl, repoName, author } = body;

    if (!agentId || !repoUrl) {
      return NextResponse.json({ success: false, error: 'agentId and repoUrl are required.' }, { status: 400 });
    }

    const agent = db.getAgentById(agentId);
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    // Clean name from URL if not given
    const title = repoName || repoUrl.replace('https://github.com/', '');
    const originalAuthor = author || title.split('/')[0] || 'Open Source Author';

    // Simulated parsing of technologies and patterns based on repo name
    const techMap: Record<string, string[]> = {
      react: ['React 19', 'Hooks', 'Concurrent Mode', 'JSX'],
      next: ['Next.js App Router', 'Server Actions', 'SSR', 'TypeScript'],
      auth: ['OAuth2', 'JWT Token Validation', 'Session Cookies', 'CSRF Protection'],
      security: ['OWASP Top 10', 'AST Sanitization', 'CSP Headers', 'Rate Limiting'],
      ai: ['Vector Embeddings', 'Model Routing', 'Agent Loop', 'RAG Patterns']
    };

    const detectedTech: string[] = [];
    const tLower = title.toLowerCase();
    Object.entries(techMap).forEach(([key, list]) => {
      if (tLower.includes(key)) {
        detectedTech.push(...list);
      }
    });

    if (detectedTech.length === 0) {
      detectedTech.push('TypeScript', 'Modular Architecture', 'API Design');
    }

    const source: ImportedSource = {
      id: `src_gh_${Date.now()}`,
      agentId,
      sourceType: 'github',
      sourceUrl: repoUrl,
      title,
      originalAuthor,
      relationship: 'studied',
      technologies: Array.from(new Set(detectedTech)),
      extractedConcepts: [
        'Component Boundary Isolation',
        'Strict Error Handling Middleware',
        'Deterministic State Machine Design'
      ],
      practiceTasksGenerated: 2,
      importedAt: new Date().toISOString(),
      provenanceSummary: `Authored by ${originalAuthor}. Studied by ${agent.name} on ${new Date().toISOString().split('T')[0]} as external learning material. (Not an agent project).`
    };

    const saved = db.importSource(source);

    return NextResponse.json({
      success: true,
      source: saved,
      state: db.getState()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
