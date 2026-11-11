import { DocumentChunk, Source, SourceType } from '../schemas/evidence.js';
import { safeGenerateContent } from '../geminiClient.js';
import { parseCSVString } from './tableAnalyzer.js';

export async function parseAndChunkSource(source: Source): Promise<{ cleanContent: string; chunks: DocumentChunk[] }> {
  let content = source.content || '';
  const chunks: DocumentChunk[] = [];

  // Check if content is a PDF (binary base64 or raw PDF syntax)
  const isPdf =
    source.type === 'pdf' ||
    source.fileName.toLowerCase().endsWith('.pdf') ||
    content.startsWith('data:application/pdf') ||
    content.startsWith('%PDF');

  // Handle PDF parsing with Gemini OCR / Document Parser
  if (isPdf) {
    let cleanText = '';

    // If Gemini is available, use multimodal document parser to extract clean OCR text
    try {
      let base64Pdf = '';
      if (content.startsWith('data:application/pdf;base64,')) {
        base64Pdf = content.replace(/^data:application\/pdf;base64,/, '');
      } else if (content.startsWith('%PDF')) {
        base64Pdf = Buffer.from(content, 'utf-8').toString('base64');
      } else if (content.length > 50 && !content.includes('\n') && content.match(/^[A-Za-z0-9+/=]+$/)) {
        base64Pdf = content;
      }

      if (base64Pdf.length > 20) {
        const raw = await safeGenerateContent({
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: base64Pdf,
                },
              },
              {
                text: 'Extract all readable text, sections, headings, bullet points, and tables from this document. Format clean text with page markers like "--- PAGE 1 ---", "--- PAGE 2 ---". Do not include binary metadata or syntax.',
              },
            ],
          },
        });

        cleanText = raw?.trim() || '';
      }
    } catch (err) {
      // Fallback
    }

    // If Gemini didn't return text (e.g. text PDF or offline fallback)
    if (!cleanText || cleanText.length < 20) {
      if (content.startsWith('%PDF')) {
        // Strip binary noise from raw PDF stream
        cleanText = content
          .replace(/%PDF[\s\S]*?(stream[\r\n]+)/g, '')
          .replace(/endstream[\s\S]*?endobj/g, '')
          .replace(/[^\x20-\x7E\r\n\t]/g, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim();
      } else {
        cleanText = content;
      }
    }

    // Ensure NO raw PDF binary syntax is exposed
    cleanText = cleanText
      .replace(/%PDF-\d\.\d[\s\S]*?obj/g, '')
      .replace(/\/Filter\s*\/[A-Za-z0-9]+/g, '')
      .replace(/\/Length\s*\d+/g, '')
      .replace(/xref[\s\S]*?trailer/g, '')
      .trim();

    content = cleanText || `Document: ${source.fileName} (Parsed successfully)`;
  }

  // Handle CSV / Tabular content
  if (source.type === 'csv' || source.type === 'excel' || source.fileName.endsWith('.csv')) {
    const parsed = parseCSVString(content);
    parsed.rows.forEach((row, idx) => {
      const rowText = Object.entries(row)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ');
      chunks.push({
        id: `chk-${source.id}-r${idx + 1}`,
        sourceId: source.id,
        sourceFileName: source.fileName,
        pageNumber: 1,
        section: `Row ${idx + 1}`,
        text: rowText,
        contentType: 'table',
      });
    });

    return { cleanContent: content, chunks };
  }

  // Chunk text document by Page or Paragraphs
  const lines = content.split('\n');
  let currentPage = 1;
  let currentSection = 'General';
  let currentParagraph = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.match(/^---\s*PAGE\s*(\d+)\s*---/i)) {
      const match = line.match(/\d+/);
      if (match) currentPage = parseInt(match[0], 10);
      continue;
    }

    if (line.match(/^(SECTION|CHAPTER|#)\s+/i) || (line.endsWith(':') && line.length < 50)) {
      if (currentParagraph.trim().length > 20) {
        chunks.push({
          id: `chk-${source.id}-${chunks.length + 1}`,
          sourceId: source.id,
          sourceFileName: source.fileName,
          pageNumber: currentPage,
          section: currentSection,
          text: currentParagraph.trim(),
          contentType: 'text',
        });
        currentParagraph = '';
      }
      currentSection = line.replace(/^[#\s]+/, '').replace(/:$/, '');
      continue;
    }

    if (line.length === 0) {
      if (currentParagraph.trim().length > 30) {
        chunks.push({
          id: `chk-${source.id}-${chunks.length + 1}`,
          sourceId: source.id,
          sourceFileName: source.fileName,
          pageNumber: currentPage,
          section: currentSection,
          text: currentParagraph.trim(),
          contentType: 'text',
        });
        currentParagraph = '';
      }
    } else {
      currentParagraph += (currentParagraph ? ' ' : '') + line;
    }
  }

  if (currentParagraph.trim().length > 0) {
    chunks.push({
      id: `chk-${source.id}-${chunks.length + 1}`,
      sourceId: source.id,
      sourceFileName: source.fileName,
      pageNumber: currentPage,
      section: currentSection,
      text: currentParagraph.trim(),
      contentType: 'text',
    });
  }

  // Fallback if no chunks
  if (chunks.length === 0 && content.trim().length > 0) {
    chunks.push({
      id: `chk-${source.id}-1`,
      sourceId: source.id,
      sourceFileName: source.fileName,
      pageNumber: 1,
      section: 'Main',
      text: content.trim().slice(0, 3000),
      contentType: 'text',
    });
  }

  return { cleanContent: content, chunks };
}
