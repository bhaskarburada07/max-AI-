import {
  AnswerStatus,
  EvidenceGraphData,
  EvidenceItem,
  GraphEdge,
  GraphNode,
  ReasoningStep,
  Source,
} from '../schemas/evidence.js';

export class EvidenceGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();

  constructor() {}

  public addSource(source: Source) {
    const nodeId = `source_${source.id}`;
    if (!this.nodes.has(nodeId)) {
      this.nodes.set(nodeId, {
        id: nodeId,
        label: source.fileName,
        type: 'source',
        data: {
          sourceType: source.type,
          fileSize: source.fileSize,
          uploadedAt: source.uploadedAt,
        },
      });
    }
  }

  public addEvidence(evidence: EvidenceItem) {
    const evidenceNodeId = `ev_${evidence.id}`;
    this.nodes.set(evidenceNodeId, {
      id: evidenceNodeId,
      label: evidence.claim.length > 50 ? `${evidence.claim.slice(0, 47)}...` : evidence.claim,
      type: 'evidence',
      data: {
        entity: evidence.entity,
        value: evidence.value,
        location: evidence.location,
        sourceFileName: evidence.sourceFileName,
        sourceType: evidence.sourceType,
        confidence: evidence.confidence,
        rawClaim: evidence.claim,
      },
    });

    // Link source -> evidence
    const sourceNodeId = `source_${evidence.sourceId}`;
    if (this.nodes.has(sourceNodeId)) {
      const edgeId = `edge_${sourceNodeId}_to_${evidenceNodeId}`;
      this.edges.set(edgeId, {
        id: edgeId,
        source: sourceNodeId,
        target: evidenceNodeId,
        relationshipType: 'extracts',
        label: evidence.location,
      });
    }

    // Link evidence -> entity node
    const normalizedEntity = evidence.entity.trim();
    if (normalizedEntity) {
      const entityNodeId = `entity_${normalizedEntity.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      if (!this.nodes.has(entityNodeId)) {
        this.nodes.set(entityNodeId, {
          id: entityNodeId,
          label: normalizedEntity,
          type: 'entity',
          data: { name: normalizedEntity },
        });
      }

      const edgeEntityId = `edge_${evidenceNodeId}_to_${entityNodeId}`;
      this.edges.set(edgeEntityId, {
        id: edgeEntityId,
        source: evidenceNodeId,
        target: entityNodeId,
        relationshipType: 'mentions',
        label: 'entity link',
      });
    }
  }

  public addReasoningStep(step: ReasoningStep) {
    const stepNodeId = `reasoning_${step.id}`;
    this.nodes.set(stepNodeId, {
      id: stepNodeId,
      label: `${step.operation.toUpperCase()}: ${step.output}`,
      type: 'reasoning',
      data: {
        operation: step.operation,
        formula: step.formula,
        verifiable: step.verifiable,
        status: step.verificationStatus,
        explanation: step.explanation,
      },
    });

    // Connect inputs (evidence IDs or other steps) to this reasoning node
    step.inputs.forEach((inputRef) => {
      let targetSource = `ev_${inputRef}`;
      if (!this.nodes.has(targetSource)) {
        targetSource = `reasoning_${inputRef}`;
      }
      if (this.nodes.has(targetSource)) {
        const edgeId = `edge_${targetSource}_to_${stepNodeId}`;
        this.edges.set(edgeId, {
          id: edgeId,
          source: targetSource,
          target: stepNodeId,
          relationshipType: 'derives',
          label: step.operation,
        });
      }
    });
  }

  public addConclusion(conclusionText: string, status: AnswerStatus, connectedStepIds: string[]) {
    const concNodeId = 'node_conclusion';
    this.nodes.set(concNodeId, {
      id: concNodeId,
      label: `[${status}] ${conclusionText.length > 60 ? conclusionText.slice(0, 57) + '...' : conclusionText}`,
      type: 'conclusion',
      data: {
        status,
        fullAnswer: conclusionText,
      },
    });

    connectedStepIds.forEach((stepId) => {
      const stepNodeId = `reasoning_${stepId}`;
      if (this.nodes.has(stepNodeId)) {
        const edgeId = `edge_${stepNodeId}_to_${concNodeId}`;
        this.edges.set(edgeId, {
          id: edgeId,
          source: stepNodeId,
          target: concNodeId,
          relationshipType: 'proves',
          label: status,
        });
      }
    });
  }

  public addConflictEdge(evidenceIdA: string, evidenceIdB: string, discrepancy: string) {
    const edgeId = `conflict_${evidenceIdA}_${evidenceIdB}`;
    this.edges.set(edgeId, {
      id: edgeId,
      source: `ev_${evidenceIdA}`,
      target: `ev_${evidenceIdB}`,
      relationshipType: 'conflicts',
      label: `CONTRADICTION: ${discrepancy}`,
    });
  }

  public toGraphData(): EvidenceGraphData {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }

  public getEntities(): string[] {
    const entities: string[] = [];
    this.nodes.forEach((node) => {
      if (node.type === 'entity') {
        entities.push(node.label);
      }
    });
    return entities;
  }
}
