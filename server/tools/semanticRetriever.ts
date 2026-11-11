import { DocumentChunk, QueryIntent } from '../schemas/evidence.js';
import { safeGenerateContent } from '../geminiClient.js';

export async function retrieveRelevantChunks(
  question: string,
  chunks: DocumentChunk[],
  intent: QueryIntent,
  topK: number = 8
): Promise<DocumentChunk[]> {
  if (chunks.length <= topK) {
    return chunks;
  }

  // 1. Semantic relevance scoring via safe Gemini invocation
  if (chunks.length > 0) {
    try {
      const chunkBriefs = chunks.map((c, idx) => ({
        index: idx,
        location: `${c.sourceFileName} (Page ${c.pageNumber || 1}, ${c.section || 'General'})`,
        snippet: c.text.slice(0, 200).replace(/\s+/g, ' '),
      }));

      const prompt = `You are the CrossMind Semantic Retrieval Engine.
Rank the following document chunks by relevance to the user's question.

Question: "${question}"
Intent: ${intent.category} (${intent.summary})

Available Chunks:
${JSON.stringify(chunkBriefs, null, 2)}

Return a JSON array of the top most relevant chunk indices, ordered from most relevant to least relevant (up to ${topK} indices):
[0, 2, 5]
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
          const selected: DocumentChunk[] = [];
          parsed.forEach((idx, rank) => {
            if (typeof idx === 'number' && chunks[idx]) {
              selected.push({
                ...chunks[idx],
                relevanceScore: Math.round((1.0 - rank * 0.08) * 100) / 100,
              });
            }
          });

          if (selected.length > 0) return selected;
        }
      }
    } catch (err) {
      // Fallback to keyword scorer
    }
  }

  // 2. Deterministic Lexical & Semantic Keyword Similarity Scorer
  const queryTerms = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['what', 'when', 'where', 'which', 'does', 'have', 'from', 'with', 'your'].includes(w));

  const scored = chunks.map((chunk) => {
    const textLower = (chunk.text + ' ' + (chunk.section || '')).toLowerCase();
    let score = 0;

    queryTerms.forEach((term) => {
      if (textLower.includes(term)) {
        score += 2;
        // Exact word boundary bonus
        const regex = new RegExp(`\\b${term}\\b`, 'i');
        if (regex.test(textLower)) score += 3;
      }
    });

    // Intent-specific boosting
    if (intent.category === 'CAREER_SKILL_GAP') {
      if (textLower.includes('skill') || textLower.includes('language') || textLower.includes('technolog') || textLower.includes('tool')) {
        score += 5;
      }
      if (textLower.includes('experience') || textLower.includes('project') || textLower.includes('education')) {
        score += 3;
      }
    } else if (intent.category === 'TABLE_QUERY') {
      if (chunk.contentType === 'table') score += 4;
    }

    return {
      ...chunk,
      relevanceScore: score,
    };
  });

  scored.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  return scored.slice(0, topK);
}
