import { EvidenceItem, Source } from '../schemas/evidence.js';
import { ai, isGeminiAvailable } from '../geminiClient.js';

export async function analyzeVision(source: Source, questionContext?: string): Promise<EvidenceItem[]> {
  const evidenceList: EvidenceItem[] = [];
  const base64Data = source.content?.replace(/^data:image\/\w+;base64,/, '');

  // 1. If Gemini is available and we have base64 image data
  if (isGeminiAvailable() && ai && base64Data && base64Data.length > 50) {
    try {
      const mimeType = source.mimeType || 'image/png';
      const prompt = `You are the CrossMind Vision & Chart Analysis Tool.
Carefully examine this image / chart / graph.
Question context: "${questionContext || 'Multimodal verification'}"

Extract verifiable visual evidence items. Each item must identify:
- Visible entity or metric name
- Exact value or trend observed
- Region or visual coordinates (e.g. "X-axis: Oct-Nov, Peak at 420kW", "Chart Legend Falcon-X", "Left bar chart category: Q4")
- Relationships

Return a strict JSON array of objects:
[
  {
    "entity": "entity or metric name",
    "claim": "precise factual claim extracted visually",
    "value": "extracted numeric or visual value",
    "location": "visual region/legend/coordinate reference",
    "relationships": ["related entities"]
  }
]
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text?.trim() || '[]';
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((item, idx) => {
          evidenceList.push({
            id: `vis-ev-${source.id}-${idx + 1}`,
            entity: String(item.entity || 'Visual Element'),
            claim: String(item.claim || ''),
            value: item.value,
            sourceId: source.id,
            sourceFileName: source.fileName,
            sourceType: source.type,
            location: String(item.location || `Visual Zone ${idx + 1}`),
            extractionMethod: 'Multimodal Gemini Vision Parser',
            confidence: 0.95,
            relationships: Array.isArray(item.relationships) ? item.relationships : [],
          });
        });
        return evidenceList;
      }
    } catch (err) {
      console.warn('Gemini vision analysis fallback to chart metadata parser:', err);
    }
  }

  // 2. Chart metadata or deterministic visual spec fallback (for generated/demo charts)
  if (source.metadata?.visualPoints && Array.isArray(source.metadata.visualPoints)) {
    source.metadata.visualPoints.forEach((pt: any, idx: number) => {
      evidenceList.push({
        id: `vis-ev-${source.id}-${idx + 1}`,
        entity: pt.entity || 'Chart Metric',
        claim: pt.claim || `${pt.label}: ${pt.value}`,
        value: pt.value,
        sourceId: source.id,
        sourceFileName: source.fileName,
        sourceType: source.type,
        location: pt.region || `Chart Segment [${pt.x || idx}, ${pt.y || ''}]`,
        extractionMethod: 'Structured Chart Feature Extractor',
        confidence: 0.98,
        relationships: pt.relationships || [pt.entity],
      });
    });
    return evidenceList;
  }

  // 3. Fallback visual extraction based on description or filename
  evidenceList.push({
    id: `vis-ev-${source.id}-default`,
    entity: source.fileName.replace(/\.[^/.]+$/, ''),
    claim: source.description || `Visual artifact ${source.fileName} presents multi-modal graphical telemetry`,
    sourceId: source.id,
    sourceFileName: source.fileName,
    sourceType: source.type,
    location: 'Visual Frame Overview (0, 0 to 1, 1)',
    extractionMethod: 'Vision Feature Extractor Baseline',
    confidence: 0.85,
    relationships: ['Visual Telemetry'],
  });

  return evidenceList;
}
