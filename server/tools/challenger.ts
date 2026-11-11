import {
  ChallengeItem,
  ConflictReport,
  EvidenceItem,
  QueryPlan,
  ReasoningStep,
} from '../schemas/evidence.js';
import { safeGenerateContent } from '../geminiClient.js';

export async function runSelfChallenge(
  candidateAnswer: string,
  evidenceList: EvidenceItem[],
  steps: ReasoningStep[],
  queryPlan: QueryPlan
): Promise<{ challenges: ChallengeItem[]; conflicts: ConflictReport[] }> {
  const challenges: ChallengeItem[] = [];
  const conflicts: ConflictReport[] = [];

  // 1. General-purpose deterministic conflict detection across multiple sources
  for (let i = 0; i < evidenceList.length; i++) {
    for (let j = i + 1; j < evidenceList.length; j++) {
      const a = evidenceList[i];
      const b = evidenceList[j];

      // Must be from different sources
      if (a.sourceId === b.sourceId) continue;

      // Ignore section numbers or metadata identifiers (e.g. 1.1, 1.2)
      if (String(a.value).match(/^\d\.\d$/) || String(b.value).match(/^\d\.\d$/)) continue;

      const entityA = a.entity.toLowerCase().trim();
      const entityB = b.entity.toLowerCase().trim();

      // Check if entities match or overlap
      const sameEntity =
        entityA === entityB ||
        (entityA.length > 3 && entityB.length > 3 && (entityA.includes(entityB) || entityB.includes(entityA)));

      if (sameEntity) {
        const valA = Number(String(a.value).replace(/[^0-9.]/g, ''));
        const valB = Number(String(b.value).replace(/[^0-9.]/g, ''));

        // Look for common parameter words (e.g. revenue, cost, gpa, salary, fee, amount, count, rate, duration)
        const wordsA = a.claim.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        const wordsB = b.claim.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        const sharedParamWord = wordsA.find((w) => wordsB.includes(w) && !['the', 'this', 'that', 'with', 'from', 'were', 'been'].includes(w));

        if (sharedParamWord && !isNaN(valA) && !isNaN(valB) && valA > 0 && valB > 0) {
          // Normalize scale if one is in millions/thousands vs raw
          let normA = valA;
          let normB = valB;
          if (normA < 100 && normB > 1000000) normA *= 1000000;
          if (normB < 100 && normA > 1000000) normB *= 1000000;

          const diffRatio = Math.abs(normA - normB) / Math.max(normA, normB);
          if (diffRatio > 0.05) {
            const conflictId = `conf-${a.id}-${b.id}`;
            const conflict: ConflictReport = {
              id: conflictId,
              entity: a.entity,
              parameter: sharedParamWord.toUpperCase(),
              evidenceA: {
                evidenceId: a.id,
                sourceFileName: a.sourceFileName,
                location: a.location,
                value: a.value,
                claim: a.claim,
              },
              evidenceB: {
                evidenceId: b.id,
                sourceFileName: b.sourceFileName,
                location: b.location,
                value: b.value,
                claim: b.claim,
              },
              discrepancy: `${a.sourceFileName} reports ${a.value} whereas ${b.sourceFileName} reports ${b.value} for ${sharedParamWord}`,
              impact: 'Direct contradiction detected between uploaded sources. Claim cannot be marked PROVEN until discrepancy is reconciled.',
            };

            conflicts.push(conflict);

            challenges.push({
              id: `chall-${conflictId}`,
              type: 'contradiction',
              question: `Is there contradictory data between ${a.sourceFileName} and ${b.sourceFileName} regarding ${sharedParamWord}?`,
              finding: `YES. Evidence in ${a.sourceFileName} reports ${a.value} at ${a.location}, while ${b.sourceFileName} reports ${b.value} at ${b.location}. Discrepancy detected.`,
              supported: true,
              severity: 'critical',
              mitigationOrImpact: 'Precludes PROVEN status. Demands reconciliation between sources.',
            });
          }
        }
      }
    }
  }

  // 2. General-purpose adversarial self-challenge via safe Gemini invocation
  try {
    const prompt = `You are the CrossMind Adversary / Self-Challenger Engine.
Your job is to AGGRESSIVELY ATTEMPT TO DISPROVE OR WEAKEN the candidate conclusion based on the actual question and available evidence.

Question: "${queryPlan.question}"
Candidate Answer: "${candidateAnswer}"

Reasoning Steps:
${JSON.stringify(steps, null, 2)}

Evidence Sample:
${JSON.stringify(evidenceList.slice(0, 25).map((e) => ({ id: e.id, entity: e.entity, claim: e.claim, source: e.sourceFileName })), null, 2)}

Test the candidate answer against these failure modes:
1. Contradictions: Are there conflicting facts or values across uploaded sources?
2. Entity Mismatch: Is the entity identically defined or confused?
3. Causality Assumption: Is correlation or assumption being treated as established fact?
4. Missing Evidence: Does the question require facts, times, or metrics absent from the sources?
5. Overgeneralization: Does the candidate answer claim more than the evidence strictly proves?

Return a strict JSON array of challenge objects:
[
  {
    "type": "causality_assumption" | "missing_evidence" | "entity_mismatch" | "date_inconsistency" | "alternative_explanation" | "contradiction" | "overgeneralization",
    "question": "adversarial challenge question",
    "finding": "factual finding after testing against evidence",
    "supported": true if this challenge succeeds in weakening/breaking the candidate answer, false if the candidate survived the challenge,
    "severity": "critical" | "moderate" | "informational",
    "mitigationOrImpact": "effect on final proof state"
  }
]
`;

    const raw = await safeGenerateContent({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.15,
      },
    });

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((item: any, idx: number) => {
          challenges.push({
            id: `llm-chall-${idx + 1}`,
            type: item.type || 'alternative_explanation',
            question: String(item.question || 'Challenge to candidate assertion'),
            finding: String(item.finding || ''),
            supported: Boolean(item.supported),
            severity: item.severity || 'moderate',
            mitigationOrImpact: String(item.mitigationOrImpact || ''),
          });
        });
        return { challenges, conflicts };
      }
    }
  } catch (err) {
    // Fallback to heuristic challenges
  }

  // 3. General-purpose heuristic fallback challenges
  const qLower = queryPlan.question.toLowerCase();
  const ansLower = candidateAnswer.toLowerCase();

  // Causality / correlation check
  if (qLower.includes('cause') || qLower.includes('due to') || qLower.includes('result of') || ansLower.includes('caused by')) {
    challenges.push({
      id: 'chall-causality',
      type: 'causality_assumption',
      question: 'Is observed correlation sufficient to prove strict causal linkage?',
      finding: 'Evidence establishes correlation, but confounding variables cannot be completely ruled out without controlled data.',
      supported: true,
      severity: 'moderate',
      mitigationOrImpact: 'Requires labelling as INFERRED rather than definitively PROVEN.',
    });
  }

  // Missing data / future prediction check
  if (qLower.includes('exact time') || qLower.includes('predict') || qLower.includes('future') || qLower.includes('what time will')) {
    challenges.push({
      id: 'chall-missing-time',
      type: 'missing_evidence',
      question: 'Do the available documents provide exact timestamp predictions for future occurrences?',
      finding: 'Available sources contain historical or static records, but lack deterministic minute-level future predictions.',
      supported: true,
      severity: 'critical',
      mitigationOrImpact: 'Exact question cannot be answered. Triggers Evidence-Bounded Reasoning.',
    });
  }

  return { challenges, conflicts };
}
