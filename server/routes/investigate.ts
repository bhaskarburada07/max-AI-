import { Router } from 'express';
import { FinalAnswer } from '../schemas/evidence.js';
import { investigateQuestion } from '../agents/crossmindAgent.js';
import { DEMO_PRESET_QUESTIONS } from '../demoData.js';
import {
  getAllDocuments,
  addMessageToConversation,
  createConversation,
  getConversationById,
} from '../services/dbService.js';

export const investigateRouter = Router();

// In-memory cache for fast lookup
const investigationsMap = new Map<string, FinalAnswer>();

investigateRouter.get('/demo/questions', (req, res) => {
  res.json({ questions: DEMO_PRESET_QUESTIONS });
});

investigateRouter.post('/investigate', async (req, res) => {
  try {
    const { question, customSources, conversationId } = req.body;
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question query string is required' });
    }

    // Use passed customSources or fetch active documents from database
    let sourcesToUse = customSources;
    if (!Array.isArray(sourcesToUse) || sourcesToUse.length === 0) {
      sourcesToUse = await getAllDocuments();
    }

    // Filter to only READY or usable sources
    const activeSources = sourcesToUse.filter((s: any) => s.status !== 'ERROR');

    const timeoutMs = 28000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Investigation timed out. Please try again.')), timeoutMs)
    );

    const result = await Promise.race([
      investigateQuestion(question.trim(), activeSources),
      timeoutPromise,
    ]);

    investigationsMap.set(result.investigationId, result);

    // Save to conversation history in database
    let targetConvId = conversationId;
    if (!targetConvId) {
      // Find or create default active conversation
      const newConv = await createConversation(question.trim().slice(0, 40), activeSources.map((s: any) => s.id));
      targetConvId = newConv.conversationId;
    }

    // Record User question message
    await addMessageToConversation(targetConvId, {
      sender: 'user',
      content: question.trim(),
    });

    // Record Assistant verified answer message with citations
    const sourcesUsed = activeSources.map((s: any) => s.fileName);
    await addMessageToConversation(targetConvId, {
      sender: 'assistant',
      content: result.answer,
      status: result.status,
      headline: result.headline,
      evidenceCount: result.evidence?.length || 0,
      sourcesUsed,
      investigationId: result.investigationId,
      rawResult: {
        status: result.status,
        headline: result.headline,
        evidence: result.evidence,
        verification: result.verification,
      },
    });

    const updatedConv = await getConversationById(targetConvId);

    res.json({
      ...result,
      conversationId: targetConvId,
      conversation: updatedConv,
    });
  } catch (err: any) {
    console.error('Investigation error:', err);
    res.status(500).json({ error: err.message || "Investigation couldn't be completed." });
  }
});

investigateRouter.get('/investigation/:id', (req, res) => {
  const result = investigationsMap.get(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Investigation record not found' });
  }
  res.json(result);
});

investigateRouter.get('/investigation/:id/evidence', (req, res) => {
  const result = investigationsMap.get(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Investigation record not found' });
  }
  res.json({ evidence: result.evidence });
});

investigateRouter.get('/investigation/:id/graph', (req, res) => {
  const result = investigationsMap.get(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Investigation record not found' });
  }
  res.json({ graph: result.graph });
});
