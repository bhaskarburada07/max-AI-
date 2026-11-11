import { EvidenceItem, Source } from '../schemas/evidence.js';
import { safeGenerateContent } from '../geminiClient.js';

export async function analyzeDocument(source: Source, questionContext?: string): Promise<EvidenceItem[]> {
  const content = source.content || '';
  const evidenceList: EvidenceItem[] = [];

  // 1. Semantic document parsing with safe Gemini invocation
  if (content.length > 20) {
    try {
      const prompt = `You are the CrossMind Document Analysis Tool.
Analyze the following document text and extract discrete, verifiable factual claims, entities, numbers, dates, and locations.
Question context: "${questionContext || 'General investigation'}"

Source file: "${source.fileName}" (type: ${source.type})

Document Text:
"""
${content.slice(0, 15000)}
"""

Extract structured facts. Every fact MUST preserve an exact location (e.g. "Page 1, Paragraph 2" or "Section: Skills", etc.).
Return valid JSON as an array of objects matching this schema:
[
  {
    "entity": "name of entity or subject",
    "claim": "precise statement of the fact",
    "value": "extracted numeric or specific string value if applicable",
    "unit": "unit if applicable",
    "location": "Page/Section/Paragraph reference",
    "relationships": ["related entities or concepts"]
  }
]
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((item, idx) => {
            evidenceList.push({
              id: `doc-ev-${source.id}-${idx + 1}`,
              entity: String(item.entity || currentSectionOrName(source)),
              claim: String(item.claim || ''),
              value: item.value,
              unit: item.unit,
              sourceId: source.id,
              sourceFileName: source.fileName,
              sourceType: source.type,
              location: String(item.location || `Section ${idx + 1}`),
              extractionMethod: 'LLM Document Semantic Parser',
              confidence: 0.95,
              relationships: Array.isArray(item.relationships) ? item.relationships : [],
            });
          });
          return evidenceList;
        }
      }
    } catch (err) {
      // Fallback to deterministic parser
    }
  }

  // 2. Deterministic general-purpose fallback document parser
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  let currentPage = 1;
  let currentSection = source.fileName.replace(/\.[^/.]+$/, '');

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().includes('page ') || trimmed.match(/--- page \d+ ---/i)) {
      const match = trimmed.match(/\d+/);
      if (match) currentPage = parseInt(match[0], 10);
      return;
    }
    if (trimmed.startsWith('#') || trimmed.match(/^[A-Z0-9\s-]{3,30}:$/)) {
      currentSection = trimmed.replace(/^[#\s]+/, '').replace(/:$/, '');
      return;
    }

    if (trimmed.match(/^(Section\s+\d|\d\.\d|---)/i)) {
      currentSection = trimmed.replace(/^[#-]+\s*/, '');
      return;
    }

    // Extract numbers, currency, quantities, percentages
    const cleanedForSearch = trimmed.replace(/\bQ[1-4]\b/g, '');
    const currencyMatch = cleanedForSearch.match(/\$(\d+[\d,.]*)\s*(M|k|K|USD)?/i);
    const unitMatch = cleanedForSearch.match(/(\d+[\d,.]*)\s*(M|k|K|%|USD|hours|cycles|units|kW|kWh|LPA)\b/i);
    const generalNumberMatch = cleanedForSearch.match(/\b(\d+[\d,.]*)\b/);

    const hasNumber = currencyMatch || unitMatch || generalNumberMatch;
    if (hasNumber || trimmed.length > 20) {
      // Dynamic entity resolution from current section, title, or line tokens
      let entity = currentSection;
      const colonMatch = trimmed.match(/^([A-Za-z0-9\s_-]{3,25}):/);
      if (colonMatch) {
        entity = colonMatch[1].trim();
      }

      let extractedValue: any = undefined;
      let extractedUnit: any = undefined;

      if (currencyMatch) {
        extractedValue = currencyMatch[1].replace(/,/g, '');
        extractedUnit = 'USD';
      } else if (unitMatch) {
        extractedValue = unitMatch[1].replace(/,/g, '');
        extractedUnit = unitMatch[2];
      } else if (generalNumberMatch) {
        extractedValue = generalNumberMatch[1].replace(/,/g, '');
      }

      evidenceList.push({
        id: `doc-ev-${source.id}-${index + 1}`,
        entity,
        claim: trimmed,
        value: extractedValue,
        unit: extractedUnit,
        sourceId: source.id,
        sourceFileName: source.fileName,
        sourceType: source.type,
        location: `Page ${currentPage}, Section: ${currentSection}`,
        extractionMethod: 'Deterministic Document Segmenter',
        confidence: 0.9,
      });
    }
  });

  return evidenceList;
}

function currentSectionOrName(source: Source): string {
  return source.fileName.replace(/\.[^/.]+$/, '');
}

