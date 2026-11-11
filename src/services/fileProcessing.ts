import { Source, SourceType, DocumentPage } from '../types';

export function detectSourceType(fileName: string, mimeType?: string): SourceType {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf') || mimeType === 'application/pdf') return 'pdf';
  if (lower.endsWith('.csv')) return 'csv';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'excel';
  if (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.svg') ||
    mimeType?.startsWith('image/')
  ) {
    return 'image';
  }
  return 'text';
}

export async function readFileAsPayload(file: File): Promise<{ content: string; type: SourceType }> {
  const type = detectSourceType(file.name, file.type);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };

    // Binary files (PDFs, images) MUST be read as DataURL to preserve byte accuracy
    if (type === 'pdf' || type === 'image' || type === 'chart') {
      reader.onload = () => {
        resolve({
          content: String(reader.result || ''),
          type,
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Text / CSV files read as text
      reader.onload = () => {
        resolve({
          content: String(reader.result || ''),
          type,
        });
      };
      reader.readAsText(file);
    }
  });
}

export interface UploadVerificationResponse {
  success: boolean;
  source: Source;
  diagnostics?: {
    fileName: string;
    fileSize: string;
    pdfDetected: string;
    pages: number;
    extractedCharacters: number;
    ocrRequired: string;
  };
  suggestions?: string[];
  error?: string;
}

export async function uploadAndVerifySource(
  file: File,
  sourceId: string
): Promise<UploadVerificationResponse> {
  const { content, type } = await readFileAsPayload(file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: sourceId,
      fileName: file.name,
      type,
      fileSize: file.size,
      mimeType: file.type,
      content,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Upload failed with HTTP ${res.status}`);
  }

  const data: UploadVerificationResponse = await res.json();
  return data;
}
