export type SourceType = 'pdf' | 'text' | 'csv' | 'excel' | 'image' | 'chart' | 'sensor';

export type SourceStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR';
export type InvestigationStatus = 'IDLE' | 'INVESTIGATING' | 'ANSWER_READY' | 'ERROR';

export interface DocumentPage {
  pageNumber: number;
  text: string;
}

export interface Source {
  id: string;
  fileName: string;
  type: SourceType;
  fileSize?: number;
  uploadedAt: string;
  content?: string;
  mimeType?: string;
  status: SourceStatus;
  statusMessage?: string;
  errorMessage?: string;
  pages?: DocumentPage[];
  pageCount?: number;
  characterCount?: number;
  ocrUsed?: boolean;
  generatedSuggestions?: string[];
  metadata?: Record<string, any>;
  previewUrl?: string;
  description?: string;
}

export interface EvidenceItem {
  id: string;
  entity: string;
  claim: string;
  value?: any;
  unit?: string;
  sourceId: string;
  sourceFileName: string;
  sourceType: SourceType;
  location: string;
  extractionMethod: string;
  confidence?: number;
  relationships?: string[];
  timestamp?: string;
  usedInReasoning?: boolean;
}

export type ReasoningOperation =
  | 'comparison'
  | 'arithmetic'
  | 'counting'
  | 'temporal'
  | 'entity_match'
  | 'aggregation'
  | 'conditional'
  | 'logical';

export interface ReasoningStep {
  id: string;
  operation: ReasoningOperation;
  inputs: string[];
  inputValues?: Record<string, any>;
  output: string;
  numericOutput?: number;
  explanation: string;
  formula?: string;
  verifiable: boolean;
  verificationStatus?: 'passed' | 'failed' | 'unverified';
  verificationDetails?: string;
}

export interface ConflictReport {
  id: string;
  entity: string;
  parameter: string;
  evidenceA: {
    evidenceId: string;
    sourceFileName: string;
    location: string;
    value: any;
    claim: string;
  };
  evidenceB: {
    evidenceId: string;
    sourceFileName: string;
    location: string;
    value: any;
    claim: string;
  };
  discrepancy: string;
  impact: string;
}

export interface ChallengeItem {
  id: string;
  type:
    | 'contradiction'
    | 'entity_mismatch'
    | 'date_inconsistency'
    | 'causality_assumption'
    | 'missing_evidence'
    | 'measurement_inconsistency'
    | 'alternative_explanation';
  question: string;
  finding: string;
  supported: boolean;
  severity: 'critical' | 'moderate' | 'informational';
  mitigationOrImpact: string;
}

export interface VerificationCheck {
  id: string;
  name: string;
  category:
    | 'arithmetic'
    | 'comparison'
    | 'temporal'
    | 'entity_consistency'
    | 'source_reference'
    | 'evidence_coverage'
    | 'conflict_check';
  passed: boolean;
  deterministic: boolean;
  details: string;
}

export type AnswerStatus = 'PROVEN' | 'INFERRED' | 'UNKNOWN' | 'GENERAL_KNOWLEDGE';

export interface VerificationResult {
  status: AnswerStatus;
  checks: VerificationCheck[];
  contradictions: ConflictReport[];
  unsupportedClaims: string[];
  evidenceCoverage: number;
  evidenceCoverageDetail: string;
  sourceAgreement: number;
  sourceAgreementDetail: string;
  reasoningChecksPassed: number;
  totalReasoningChecks: number;
  verifiableSubsetPassed: boolean;
  summary: string;
}

export interface EvidenceBoundedReasoning {
  exactQuestionUnanswerable: string;
  whatCanStillBeSaid: Array<{
    claim: string;
    supportingEvidenceIds: string[];
    rationale: string;
  }>;
  whatIsNotEstablished: string[];
  conditionalReasoning: Array<{
    condition: string;
    outcome: string;
    confidenceAssessment: string;
  }>;
  explicitAssumptions: string[];
  additionalEvidenceNeeded: Array<{
    modality: string;
    description: string;
    expectedResolution: string;
  }>;
}

export interface QueryPlan {
  question: string;
  targetEntities: string[];
  requiredFacts: string[];
  relevantSourceIds: string[];
  relevantModalities: SourceType[];
  requiredOperations: ReasoningOperation[];
  verificationCriteria: string[];
  planSummary: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'source' | 'evidence' | 'entity' | 'claim' | 'reasoning' | 'conclusion';
  data: Record<string, any>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  relationshipType: 'extracts' | 'mentions' | 'asserts' | 'derives' | 'proves' | 'conflicts';
}

export interface EvidenceGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TraceEvent {
  stage: string;
  timestamp: number;
  details: string;
  status: 'completed' | 'in_progress' | 'skipped' | 'failed';
}

export interface FinalAnswer {
  investigationId: string;
  question: string;
  timestamp: string;
  status: AnswerStatus;
  headline: string;
  answer: string;
  explicitFindings?: string[];
  inferences?: string[];
  unestablishedPoints?: string[];
  sourceCitations?: Array<{
    sourceFileName: string;
    location: string;
    quoteSnippet?: string;
  }>;
  confidenceClassification: {
    status: AnswerStatus;
    rationale: string;
  };
  queryPlan: QueryPlan;
  evidence: EvidenceItem[];
  reasoning: ReasoningStep[];
  challenges: ChallengeItem[];
  conflicts: ConflictReport[];
  verification: VerificationResult;
  boundedReasoning?: EvidenceBoundedReasoning;
  graph: EvidenceGraphData;
  executionTrace: TraceEvent[];
}

export interface DemoPresetQuestion {
  id: string;
  label: string;
  question: string;
  expectedStatus: string;
  badge: string;
  badgeColor: string;
}
