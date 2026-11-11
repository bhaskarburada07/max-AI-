import {
  ChatMessage,
  QueryIntent,
  QueryIntentCategory,
  Source,
} from '../schemas/evidence.js';
import { safeGenerateContent } from '../geminiClient.js';

export async function routeUserQuery(
  question: string,
  sources: Source[],
  conversationHistory: ChatMessage[] = []
): Promise<QueryIntent> {
  const qLower = question.toLowerCase().trim();

  // 1. Zero-shot dynamic query understanding via safe Gemini invocation
  try {
    const sourceManifest = sources.map((s) => ({
      id: s.id,
      fileName: s.fileName,
      type: s.type,
      snippet: (s.content || '').slice(0, 300).replace(/\s+/g, ' '),
    }));

    const historySummary = conversationHistory.slice(-4).map((h) => ({
      role: h.role,
      text: h.content.slice(0, 150),
    }));

    const prompt = `You are the CrossMind AI Dynamic Query Router.
Analyze the user's question, determine their real intent, and identify what information is needed to answer it truthfully.

User Question: "${question}"

Conversation Context (last turns):
${JSON.stringify(historySummary, null, 2)}

Active Uploaded Sources (${sources.length}):
${JSON.stringify(sourceManifest, null, 2)}

Instructions:
1. Determine category from:
   - "DOCUMENT_QUERY": Query specifically asking about content in an uploaded document (e.g., resume, paper, report, contract).
   - "CAREER_SKILL_GAP": Career advice, resume skill gap analysis, roadmap toward a salary/role target based on resume or profile.
   - "TABLE_QUERY": Query specifically asking about table rows, CSV data, columns, or values.
   - "IMAGE_CHART_QUERY": Query specifically about visual features, charts, plots, or diagrams.
   - "CROSS_MODAL_QUERY": Query comparing or combining multiple uploaded documents/tables/charts.
   - "CALCULATION": Mathematical arithmetic, percentage growth, or sum calculation.
   - "GENERAL_KNOWLEDGE": General computer science, programming, science, or general Q&A where NO uploaded document is required (e.g. "What is binary search?", "Explain recursion").
   - "REASONING_ANALYSIS": Analytical reasoning, pros/cons, or logical deduction.
2. If NO sources are uploaded and the question is asking a general question (e.g. "What is binary search?", "roadmap to learn DSA"), classify as "GENERAL_KNOWLEDGE" with requiresUploadedEvidence = false.
3. If sources ARE uploaded, inspect which ones are genuinely relevant to the question.
4. Detect if this is a follow-up question referencing earlier context.

Return strictly valid JSON:
{
  "category": "DOCUMENT_QUERY" | "CAREER_SKILL_GAP" | "TABLE_QUERY" | "IMAGE_CHART_QUERY" | "CROSS_MODAL_QUERY" | "CALCULATION" | "GENERAL_KNOWLEDGE" | "REASONING_ANALYSIS",
  "summary": "Clear 1-sentence statement of what the user is asking",
  "requiresUploadedEvidence": boolean,
  "targetEntities": ["entity1", "concept2"],
  "requiredInformation": ["specific fact 1", "specific fact 2"],
  "relevantSourceIds": ["id1"],
  "isFollowUp": boolean
}
`;

    const raw = await safeGenerateContent({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.category) {
        return {
          category: parsed.category,
          summary: parsed.summary || `Investigating question: ${question}`,
          requiresUploadedEvidence: parsed.requiresUploadedEvidence ?? sources.length > 0,
          targetEntities: Array.isArray(parsed.targetEntities) ? parsed.targetEntities : [],
          requiredInformation: Array.isArray(parsed.requiredInformation) ? parsed.requiredInformation : [],
          relevantSourceIds: Array.isArray(parsed.relevantSourceIds) ? parsed.relevantSourceIds : sources.map((s) => s.id),
          isFollowUp: Boolean(parsed.isFollowUp),
        };
      }
    }
  } catch (err) {
    // Graceful fallback to deterministic heuristic router
  }

  // 2. Deterministic Heuristic Fallback Router
  const hasSources = sources.length > 0;

  // Check General Knowledge queries (e.g. "what is binary search", "explain recursion", "how does X work")
  const isGeneralKnowledgePattern =
    !hasSources ||
    qLower.startsWith('what is ') && (qLower.includes('binary search') || qLower.includes('recursion') || qLower.includes('sorting') || qLower.includes('algorithm') || qLower.includes('dsa')) ||
    qLower.startsWith('explain ') ||
    qLower.startsWith('how does ') ||
    qLower.includes('roadmap to learn') ||
    qLower.includes('teach me');

  if (isGeneralKnowledgePattern && (!hasSources || !qLower.includes('resume') && !qLower.includes('document') && !qLower.includes('file') && !qLower.includes('uploaded'))) {
    return {
      category: 'GENERAL_KNOWLEDGE',
      summary: `Explaining general concept or topic: "${question}"`,
      requiresUploadedEvidence: false,
      targetEntities: [question.replace(/^(what is|explain|how does)\s+/i, '')],
      requiredInformation: ['Conceptual definition', 'Step-by-step explanation', 'Code or practical example'],
      relevantSourceIds: [],
      isFollowUp: conversationHistory.length > 0,
    };
  }

  // Check Career / Skill Gap / Resume queries
  if (
    qLower.includes('resume') ||
    qLower.includes('skill') ||
    qLower.includes('job') ||
    qLower.includes('30 lpa') ||
    qLower.includes('career') ||
    qLower.includes('cgpa') ||
    qLower.includes('experience') ||
    qLower.includes('project') ||
    qLower.includes('hire')
  ) {
    return {
      category: 'CAREER_SKILL_GAP',
      summary: `Analyzing candidate profile, skills, experience, and career gap for: "${question}"`,
      requiresUploadedEvidence: true,
      targetEntities: ['Candidate Profile', 'Skills', 'Experience', 'Projects', 'Career Goal'],
      requiredInformation: [
        'Skills explicitly listed in document',
        'Projects and technologies used',
        'Target career requirements or role benchmarks',
      ],
      relevantSourceIds: sources.map((s) => s.id),
      isFollowUp: conversationHistory.length > 0,
    };
  }

  // Check Table / CSV queries
  if (sources.some((s) => s.type === 'csv' || s.type === 'excel') && (qLower.includes('table') || qLower.includes('csv') || qLower.includes('row') || qLower.includes('column') || qLower.includes('total') || qLower.includes('revenue') || qLower.includes('count'))) {
    return {
      category: 'TABLE_QUERY',
      summary: `Querying tabular data ledger: "${question}"`,
      requiresUploadedEvidence: true,
      targetEntities: ['Tabular Records'],
      requiredInformation: ['Row entries', 'Column values', 'Calculations'],
      relevantSourceIds: sources.filter((s) => s.type === 'csv' || s.type === 'excel').map((s) => s.id),
      isFollowUp: false,
    };
  }

  // Check Image / Chart queries
  if (sources.some((s) => s.type === 'chart' || s.type === 'image') && (qLower.includes('chart') || qLower.includes('graph') || qLower.includes('image') || qLower.includes('plot') || qLower.includes('curve') || qLower.includes('show'))) {
    return {
      category: 'IMAGE_CHART_QUERY',
      summary: `Visual analysis of chart/image: "${question}"`,
      requiresUploadedEvidence: true,
      targetEntities: ['Visual Artifact'],
      requiredInformation: ['Axes', 'Labels', 'Data points', 'Trends'],
      relevantSourceIds: sources.filter((s) => s.type === 'chart' || s.type === 'image').map((s) => s.id),
      isFollowUp: false,
    };
  }

  // Default Document query
  return {
    category: 'DOCUMENT_QUERY',
    summary: `Investigating document facts for: "${question}"`,
    requiresUploadedEvidence: hasSources,
    targetEntities: ['Document Content'],
    requiredInformation: ['Relevant factual claims from uploaded sources'],
    relevantSourceIds: sources.map((s) => s.id),
    isFollowUp: conversationHistory.length > 0,
  };
}
