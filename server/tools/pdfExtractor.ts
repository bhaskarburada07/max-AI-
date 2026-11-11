import { createRequire } from 'module';
import { safeGenerateContent } from '../geminiClient.js';

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');

export interface PageContent {
  pageNumber: number;
  text: string;
}

export interface PDFExtractionResult {
  fileName: string;
  fileSizeFormatted: string;
  fileSizeBytes: number;
  pdfDetected: boolean;
  pagesCount: number;
  extractedCharacters: number;
  ocrRequired: boolean;
  fullText: string;
  pages: PageContent[];
  diagnostics: {
    fileName: string;
    fileSize: string;
    pdfDetected: string;
    pages: number;
    extractedCharacters: number;
    ocrRequired: string;
  };
}

export async function extractPDFContent(
  fileName: string,
  content: string,
  fileSize?: number
): Promise<PDFExtractionResult> {
  console.log(`[1] FILE RECEIVED: ${fileName} (${fileSize || content.length} bytes)`);

  const isPdf =
    fileName.toLowerCase().endsWith('.pdf') ||
    content.startsWith('data:application/pdf') ||
    content.startsWith('%PDF');

  console.log(`[2] FILE VALIDATED: PDF Detected = ${isPdf ? 'YES' : 'NO'}`);

  const isBinaryPdf =
    content.startsWith('data:application/pdf') ||
    content.startsWith('%PDF') ||
    (content.startsWith('data:') && content.includes(';base64,'));

  let buffer: Buffer | null = null;

  if (isBinaryPdf) {
    try {
      if (content.startsWith('data:application/pdf;base64,')) {
        const base64Data = content.replace(/^data:application\/pdf;base64,/, '');
        buffer = Buffer.from(base64Data, 'base64');
      } else if (content.startsWith('data:') && content.includes(';base64,')) {
        const base64Data = content.split(';base64,')[1];
        buffer = Buffer.from(base64Data, 'base64');
      } else if (content.startsWith('%PDF')) {
        buffer = Buffer.from(content, 'binary');
      }
    } catch (err: any) {
      console.error(`[PDF Parsing Error] Buffer conversion failed: ${err.message}`);
    }
  }

  const fileSizeBytes = buffer ? buffer.length : (fileSize || content.length);
  const fileSizeFormatted = formatBytes(fileSizeBytes);

  console.log(`[3] PDF PARSING STARTED: Buffer size = ${fileSizeBytes} bytes`);

  let fullText = '';
  const pages: PageContent[] = [];
  let pagesCount = 1;
  let ocrRequired = false;

  // 1. Primary Text Extraction via pdf-parse if binary buffer exists
  if (buffer && buffer.length > 30) {
    try {
      const PDFParseClass = pdfParseModule.PDFParse || pdfParseModule;
      if (typeof PDFParseClass === 'function') {
        const parser = new PDFParseClass({ data: buffer });
        if (typeof parser.load === 'function') {
          await parser.load();
          const parsed = await parser.getText();
          if (parsed) {
            fullText = (parsed.text || '').trim();
            pagesCount = parsed.total || (parsed.pages ? parsed.pages.length : 1);
            if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
              parsed.pages.forEach((p: any) => {
                pages.push({
                  pageNumber: p.num || pages.length + 1,
                  text: (p.text || '').trim(),
                });
              });
            }
          }
        }
      }
    } catch (parseErr: any) {
      console.warn(`[PDF Parsing Info] Standard parser reported structure variance, falling back to direct stream parser: ${parseErr.message}`);
    }

    // Secondary fallback: Direct text stream parsing if standard parser produced 0 characters
    if (!fullText || fullText.length === 0) {
      const streamText = extractTextFromPdfStream(buffer);
      if (streamText && streamText.trim().length > 0) {
        fullText = streamText.trim();
        console.log(`[PDF Stream Parser] Successfully extracted ${fullText.length} characters from document streams`);
      }
    }
  } else if (!isBinaryPdf) {
    // Content is already plain extracted text
    fullText = content.trim();
  }

  console.log(`[4] PDF PARSING COMPLETED`);
  console.log(`[5] EXTRACTED TEXT LENGTH: ${fullText.length}`);

  // 2. OCR Fallback (Only if extracted characters == 0 and it is a PDF)
  if (isPdf && fullText.length === 0) {
    ocrRequired = true;
    console.log(`[6] OCR STARTED (only if required) - PDF contains 0 extracted text characters`);

    let ocrTimer: NodeJS.Timeout | null = null;
    try {
      const base64Pdf = buffer ? buffer.toString('base64') : Buffer.from(content).toString('base64');
      const ocrPrompt = `Extract all readable text, titles, sections, and tables from this document. Format clean text with page markers like "--- PAGE 1 ---", "--- PAGE 2 ---". Return the full raw extracted document text.`;

      const ocrTimeout = new Promise<string | null>((resolve) => {
        ocrTimer = setTimeout(() => resolve(null), 18000);
      });

      const ocrRequest = safeGenerateContent({
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Pdf,
              },
            },
            {
              text: ocrPrompt,
            },
          ],
        },
      }).catch(() => null);

      const ocrText = await Promise.race([ocrRequest, ocrTimeout]);
      if (ocrTimer) clearTimeout(ocrTimer);

      if (ocrText && ocrText.trim().length > 0) {
        fullText = ocrText.trim();
        console.log(`[OCR SUCCESS] Extracted ${fullText.length} characters via Gemini Vision OCR`);
      } else {
        console.warn(`[OCR Notice] OCR completed or skipped`);
      }
    } catch (ocrErr: any) {
      if (ocrTimer) clearTimeout(ocrTimer);
      console.warn(`[OCR Notice] Gemini OCR completed: ${ocrErr.message}`);
    }
  } else {
    console.log(`[6] OCR SKIPPED (Extracted characters > 0)`);
  }

  // Populate pages array if not populated from page objects
  if (pages.length === 0 && fullText.length > 0) {
    const pageSplits = fullText.split(/(?:---\s*PAGE\s*\d+\s*---|--\s*\d+\s*of\s*\d+\s*--)/i);
    if (pageSplits.length > 1) {
      pageSplits.forEach((pText, idx) => {
        if (pText.trim().length > 0) {
          pages.push({
            pageNumber: idx + 1,
            text: pText.trim(),
          });
        }
      });
      pagesCount = pages.length;
    } else {
      pages.push({
        pageNumber: 1,
        text: fullText,
      });
    }
  }

  console.log(`[7] DOCUMENT CONTEXT CREATED: ${pages.length} pages, ${fullText.length} total chars`);

  const diagnostics = {
    fileName,
    fileSize: fileSizeFormatted,
    pdfDetected: isPdf ? 'YES' : 'NO',
    pages: pagesCount,
    extractedCharacters: fullText.length,
    ocrRequired: ocrRequired ? 'YES' : 'NO',
  };

  // Print developer diagnostic information to console
  console.log('-------------------------------------------');
  console.log('DEVELOPER DIAGNOSTIC INFORMATION:');
  console.log(`Filename: ${diagnostics.fileName}`);
  console.log(`File size: ${diagnostics.fileSize}`);
  console.log(`PDF detected: ${diagnostics.pdfDetected}`);
  console.log(`Pages: ${diagnostics.pages}`);
  console.log(`Extracted characters: ${diagnostics.extractedCharacters}`);
  console.log(`OCR required: ${diagnostics.ocrRequired}`);
  console.log('-------------------------------------------');

  return {
    fileName,
    fileSizeFormatted,
    fileSizeBytes,
    pdfDetected: isPdf,
    pagesCount,
    extractedCharacters: fullText.length,
    ocrRequired,
    fullText,
    pages,
    diagnostics,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function extractTextFromPdfStream(raw: string | Buffer): string {
  const str = typeof raw === 'string' ? raw : raw.toString('latin1');
  const texts: string[] = [];

  // Match literal text inside PDF Tj string operators: (text) Tj
  const tjRegex = /\(([^()]{1,600})\)\s*Tj/g;
  let match: RegExpExecArray | null;
  while ((match = tjRegex.exec(str)) !== null) {
    const clean = match[1].replace(/\\[nrtbf()\\]/g, ' ').trim();
    if (clean.length > 0 && !clean.startsWith('%PDF')) {
      texts.push(clean);
    }
  }

  // Match text in PDF TJ array operators: [(part1) 20 (part2)] TJ
  const tjArrayRegex = /\[([^\]]{1,1500})\]\s*TJ/gi;
  while ((match = tjArrayRegex.exec(str)) !== null) {
    const inner = match[1];
    const subMatches = inner.match(/\(([^()]+)\)/g);
    if (subMatches) {
      const line = subMatches
        .map((s) => s.slice(1, -1).replace(/\\[nrtbf()\\]/g, ' '))
        .join('')
        .trim();
      if (line.length > 0) {
        texts.push(line);
      }
    }
  }

  return texts.join('\n');
}
