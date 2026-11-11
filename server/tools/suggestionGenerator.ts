import { safeGenerateContent } from '../geminiClient.js';

export async function generateDocumentSuggestions(
  fileName: string,
  content: string,
  pages?: Array<{ pageNumber: number; text: string }>
): Promise<string[]> {
  const cleanSnippet = content.slice(0, 15000).trim();
  if (!cleanSnippet || cleanSnippet.length < 20) {
    return [
      `What is this document about?`,
      `What are the main key points in ${fileName}?`,
      `Can you summarize the contents of this file?`,
    ];
  }

  // 1. Attempt AI-powered dynamic suggestion generation grounded strictly in the document text
  try {
    const prompt = `You are CrossMind AI. Read this document excerpt and generate 3 to 4 concise, highly relevant, and interesting questions that a reader would naturally ask about THIS SPECIFIC document.

CRITICAL RULES:
1. The questions MUST be directly grounded in the topics, entities, metrics, or sections that ACTUALLY appear in this text.
2. If this is a resume, suggest questions like:
   - "What skills are listed in this resume?"
   - "What projects and work experience are detailed?"
   - "What are the strongest areas of this profile?"
3. If this is a college syllabus/timetable, ask about courses, schedules, or grading.
4. If this is a financial or corporate document, ask about revenue, margins, or highlights.
5. If this is a legal, medical, or research paper, ask about key clauses, findings, or methodology.
6. DO NOT mention drones, flights, batteries, or Falcon-X unless this document is actually about them.
7. Return ONLY a valid JSON array of 3 or 4 strings, e.g.:
["Question 1", "Question 2", "Question 3", "Question 4"]

DOCUMENT CONTENT EXCERPT (${fileName}):
${cleanSnippet}
`;

    const raw = await safeGenerateContent({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 2 && typeof parsed[0] === 'string') {
        return parsed.slice(0, 4).map((q: string) => q.trim());
      }
    }
  } catch (err: any) {
    console.warn(`[Suggestion Generator] AI generation fallback used:`, err?.message || err);
  }

  // 2. Deterministic Pattern-Based Fallback (never breaks the app if AI fails or times out)
  const lower = cleanSnippet.toLowerCase();

  if (
    lower.includes('experience') &&
    (lower.includes('education') || lower.includes('skills') || lower.includes('curriculum vitae') || lower.includes('resume'))
  ) {
    return [
      `What skills are mentioned in this resume?`,
      `What professional experience and projects are listed?`,
      `What education and certifications are included?`,
      `What roles would this candidate be well-suited for?`,
    ];
  }

  if (lower.includes('revenue') || lower.includes('quarter') || lower.includes('ebitda') || lower.includes('financial')) {
    return [
      `What are the key financial highlights in this report?`,
      `Which metrics or growth numbers are reported?`,
      `What operational expenses or costs are identified?`,
      `What risks or outlook items are discussed?`,
    ];
  }

  if (lower.includes('course') || lower.includes('syllabus') || lower.includes('semester') || lower.includes('timetable') || lower.includes('exam')) {
    return [
      `What are the main topics covered in this document?`,
      `What schedule, deadlines, or exam details are listed?`,
      `What are the primary grading or course requirements?`,
      `Can you provide an overview of the curriculum?`,
    ];
  }

  // General grounded questions
  return [
    `What is this document about?`,
    `What are the main key points in ${fileName}?`,
    `Which section contains the most important information?`,
    `Can you provide a concise summary of this document?`,
  ];
}
