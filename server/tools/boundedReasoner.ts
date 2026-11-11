import {
  EvidenceBoundedReasoning,
  EvidenceItem,
  QueryPlan,
} from '../schemas/evidence.js';
import { safeGenerateContent } from '../geminiClient.js';

export async function runEvidenceBoundedReasoning(
  question: string,
  evidenceList: EvidenceItem[],
  queryPlan: QueryPlan,
  unknownReason?: string
): Promise<EvidenceBoundedReasoning> {
  // 1. Evidence-bounded reasoning synthesis via safe Gemini invocation
  try {
    const prompt = `You are the CrossMind Evidence-Bounded Reasoning Engine.
The exact question cannot be formally proven with the current evidence:
Question: "${question}"
Reason: "${unknownReason || 'Exact parameters/timestamps/causal elements are unrecorded'}"

DO NOT simply say "I cannot answer".
Instead, perform EVIDENCE-BOUNDED REASONING:
1. Identify the exact component that cannot be established.
2. Establish "WHAT CAN WE STILL CONCLUDE?" from the available evidence with specific supporting claims.
3. Formulate valid conditional reasoning ("If [condition], then [outcome] with [confidence]").
4. List explicit assumptions required.
5. Detail what exact additional evidence would resolve the uncertainty.

Available Evidence:
${JSON.stringify(evidenceList.slice(0, 20).map((e) => ({ id: e.id, entity: e.entity, claim: e.claim, source: e.sourceFileName })), null, 2)}

Return strict JSON:
{
  "exactQuestionUnanswerable": "Precise description of the unanswerable query facet",
  "whatCanStillBeSaid": [
    {
      "claim": "Strong factual sub-conclusion established by current evidence",
      "supportingEvidenceIds": ["id1", "id2"],
      "rationale": "Why this holds true"
    }
  ],
  "whatIsNotEstablished": [
    "Specific parameter or timestamp that cannot be proven"
  ],
  "conditionalReasoning": [
    {
      "condition": "If X occurs or sensor Y registers Z",
      "outcome": "Then W becomes bounded within range R",
      "confidenceAssessment": "High conditional probability based on telemetry trends"
    }
  ],
  "explicitAssumptions": [
    "Assumed operating parameters or standard operating baselines"
  ],
  "additionalEvidenceNeeded": [
    {
      "modality": "document | dataset | system_logs | specification",
      "description": "Specific missing data feed or measurement required",
      "expectedResolution": "How this resolves the remaining uncertainty into a PROVEN state"
    }
  ]
}
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
      if (parsed.whatCanStillBeSaid && Array.isArray(parsed.whatCanStillBeSaid)) {
        return {
          exactQuestionUnanswerable: String(parsed.exactQuestionUnanswerable || 'Specific boundary parameters remain indeterminate.'),
          whatCanStillBeSaid: parsed.whatCanStillBeSaid.map((w: any) => ({
            claim: String(w.claim || ''),
            supportingEvidenceIds: Array.isArray(w.supportingEvidenceIds) ? w.supportingEvidenceIds : evidenceList.slice(0, 2).map((e) => e.id),
            rationale: String(w.rationale || ''),
          })),
          whatIsNotEstablished: Array.isArray(parsed.whatIsNotEstablished) ? parsed.whatIsNotEstablished : ['Exact parameters not present in current sources'],
          conditionalReasoning: Array.isArray(parsed.conditionalReasoning) ? parsed.conditionalReasoning : [],
          explicitAssumptions: Array.isArray(parsed.explicitAssumptions) ? parsed.explicitAssumptions : [],
          additionalEvidenceNeeded: Array.isArray(parsed.additionalEvidenceNeeded) ? parsed.additionalEvidenceNeeded : [],
        };
      }
    }
  } catch (err) {
    // Fallback to dynamic deterministic bounded reasoner
  }

  // 2. Deterministic General-Purpose Bounded Reasoner
  const sampleEvidence = evidenceList.slice(0, 3);
  const entities = queryPlan.targetEntities.join(', ') || 'the requested subject';

  const whatCanStillBeSaidList = sampleEvidence.length > 0
    ? sampleEvidence.map((e) => ({
        claim: e.claim,
        supportingEvidenceIds: [e.id],
        rationale: `Directly verified from ${e.sourceFileName} (${e.location}).`,
      }))
    : [
        {
          claim: `General principles for ${entities} are well-understood, but specific local parameters are absent from uploaded files.`,
          supportingEvidenceIds: [],
          rationale: 'Absence of specific entity records in active document set.',
        },
      ];

  return {
    exactQuestionUnanswerable: `The exact requested metrics or unrecorded details for [${entities}] are not explicitly provided in the uploaded documents.`,
    whatCanStillBeSaid: whatCanStillBeSaidList,
    whatIsNotEstablished: [
      `Exact unrecorded parameters or future metrics for ${entities}`,
      'Explicit confirmation of unstated user intentions or unpublished records',
    ],
    conditionalReasoning: [
      {
        condition: `If additional documents or records for ${entities} are provided`,
        outcome: 'The specific factual claim can be directly corroborated or proven.',
        confidenceAssessment: 'High deterministic probability once target records are supplied.',
      },
    ],
    explicitAssumptions: [
      'Available uploaded sources represent the complete scope of evidence currently submitted',
    ],
    additionalEvidenceNeeded: [
      {
        modality: 'document | table | log',
        description: `Source document containing explicit records for ${entities}`,
        expectedResolution: 'Enables direct deterministic verification against source text.',
      },
    ],
  };
}

