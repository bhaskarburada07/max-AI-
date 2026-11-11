import {
  ChatMessage,
  QueryPlan,
  ReasoningOperation,
  Source,
  SourceType,
} from '../schemas/evidence.js';
import { routeUserQuery } from './queryRouter.js';

export async function planQuery(
  question: string,
  sources: Source[],
  conversationHistory: ChatMessage[] = []
): Promise<QueryPlan> {
  // 1. Determine user intent and target entities via query router
  const intent = await routeUserQuery(question, sources, conversationHistory);

  // 2. Synthesize reasoning operations based on intent
  const requiredOperations: ReasoningOperation[] = [];
  if (intent.category === 'CAREER_SKILL_GAP') {
    requiredOperations.push('entity_match', 'skill_gap_analysis');
  } else if (intent.category === 'GENERAL_KNOWLEDGE') {
    requiredOperations.push('general_explanation');
  } else if (intent.category === 'CALCULATION') {
    requiredOperations.push('arithmetic', 'comparison');
  } else if (intent.category === 'TABLE_QUERY') {
    requiredOperations.push('entity_match', 'aggregation');
  } else {
    requiredOperations.push('entity_match', 'comparison');
  }

  const relevantSourceIds =
    intent.relevantSourceIds.length > 0
      ? intent.relevantSourceIds
      : sources.map((s) => s.id);

  const relevantModalities = sources
    .filter((s) => relevantSourceIds.includes(s.id))
    .map((s) => s.type);

  return {
    question,
    intent,
    targetEntities: intent.targetEntities.length > 0 ? intent.targetEntities : ['Target Subject'],
    requiredFacts: intent.requiredInformation.length > 0 ? intent.requiredInformation : ['Grounded evidence claims'],
    relevantSourceIds,
    relevantModalities: relevantModalities.length > 0 ? relevantModalities : sources.map((s) => s.type),
    requiredOperations,
    verificationCriteria: ['Verify factual claims against source chunks and groundings'],
    planSummary: intent.summary,
  };
}
