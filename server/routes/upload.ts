import { Router } from 'express';
import { Source } from '../schemas/evidence.js';
import { DEMO_SOURCES } from '../demoData.js';
import { extractPDFContent } from '../tools/pdfExtractor.js';
import { generateDocumentSuggestions } from '../tools/suggestionGenerator.js';
import {
  getAllDocuments,
  saveDocument,
  deleteDocument,
  clearAllDocuments,
} from '../services/dbService.js';

export const uploadRouter = Router();

// GET all active documents / sources from database
uploadRouter.get(['/sources', '/documents'], async (req, res) => {
  try {
    const list = await getAllDocuments();
    res.json({ success: true, sources: list, documents: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list documents' });
  }
});

// POST upload and verify a document
uploadRouter.post(['/upload', '/documents'], async (req, res) => {
  try {
    const { id, fileName, type, content, mimeType, description, fileSize } = req.body;
    if (!fileName || !content) {
      return res.status(400).json({ error: 'fileName and content are required' });
    }

    const determinedType =
      type ||
      (fileName.endsWith('.csv')
        ? 'csv'
        : fileName.endsWith('.pdf')
        ? 'pdf'
        : fileName.match(/\.(jpg|png|webp|svg)$/i)
        ? 'chart'
        : 'text');

    let processedContent = content;
    let diagnostics: any = undefined;
    let extractedPages: any = undefined;

    // Immediately extract content for PDFs and documents
    if (
      determinedType === 'pdf' ||
      fileName.toLowerCase().endsWith('.pdf') ||
      content.startsWith('data:application/pdf') ||
      content.startsWith('%PDF')
    ) {
      const extraction = await extractPDFContent(fileName, content, fileSize);
      processedContent = extraction.fullText;
      diagnostics = extraction.diagnostics;
      extractedPages = extraction.pages;
    }

    // Generate dynamic suggestions grounded in the actual document content
    const suggestions = await generateDocumentSuggestions(fileName, processedContent, extractedPages);

    const newSource: Source = {
      id: id || `src-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fileName,
      type: determinedType,
      uploadedAt: new Date().toISOString(),
      content: processedContent,
      mimeType,
      fileSize: fileSize || (typeof content === 'string' ? content.length : 0),
      status: 'READY',
      statusMessage: 'Source verified',
      pages: extractedPages,
      pageCount: diagnostics?.pages || (extractedPages?.length || 1),
      characterCount: diagnostics?.extractedCharacters || processedContent.length,
      ocrUsed: diagnostics?.ocrRequired === 'YES',
      generatedSuggestions: suggestions,
      description: description || `User uploaded source: ${fileName}`,
      metadata: diagnostics ? { diagnostics, pages: extractedPages } : undefined,
    };

    // Save to database
    await saveDocument(newSource);
    const all = await getAllDocuments();

    res.json({
      success: true,
      source: newSource,
      diagnostics,
      suggestions,
      totalSources: all.length,
    });
  } catch (err: any) {
    console.error('[Upload Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to upload source' });
  }
});

// POST seed demo sources into database
uploadRouter.post(['/sources/demo', '/sources/reset'], async (req, res) => {
  try {
    for (const s of DEMO_SOURCES) {
      await saveDocument({
        ...s,
        status: 'READY' as const,
        statusMessage: 'Source verified',
        characterCount: s.content?.length || 0,
        pageCount: 2,
        generatedSuggestions: [
          'What are the key financial highlights?',
          'What are the operational and maintenance findings?',
          'Can you summarize the performance report?',
        ],
      });
    }

    const all = await getAllDocuments();
    res.json({ success: true, sources: all });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to seed demo sources' });
  }
});

// POST clear all documents from database
uploadRouter.post(['/sources/clear', '/documents/clear'], async (req, res) => {
  try {
    await clearAllDocuments();
    res.json({ success: true, sources: [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear documents' });
  }
});

// DELETE single document by ID from database
uploadRouter.delete(['/sources/:id', '/documents/:id'], async (req, res) => {
  try {
    await deleteDocument(req.params.id);
    const all = await getAllDocuments();
    res.json({ success: true, totalSources: all.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete source' });
  }
});
