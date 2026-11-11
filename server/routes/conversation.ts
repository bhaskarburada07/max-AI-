import { Router } from 'express';
import {
  getAllConversations,
  getConversationById,
  createConversation,
  addMessageToConversation,
  deleteConversation,
} from '../services/dbService.js';

export const conversationRouter = Router();

// GET all conversations
conversationRouter.get('/conversations', async (req, res) => {
  try {
    const list = await getAllConversations();
    res.json({ success: true, conversations: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list conversations' });
  }
});

// GET single conversation by ID
conversationRouter.get('/conversations/:id', async (req, res) => {
  try {
    const conv = await getConversationById(req.params.id);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ success: true, conversation: conv });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get conversation' });
  }
});

// POST create new conversation
conversationRouter.post('/conversations', async (req, res) => {
  try {
    const { title, activeDocIds } = req.body;
    const conv = await createConversation(title, activeDocIds || []);
    res.json({ success: true, conversation: conv });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create conversation' });
  }
});

// POST add message to conversation
conversationRouter.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { sender, content, status, headline, evidenceCount, sourcesUsed, investigationId, rawResult } =
      req.body;

    if (!sender || !content) {
      return res.status(400).json({ error: 'sender and content are required' });
    }

    const updated = await addMessageToConversation(req.params.id, {
      sender,
      content,
      status,
      headline,
      evidenceCount,
      sourcesUsed,
      investigationId,
      rawResult,
    });

    res.json({ success: true, conversation: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add message' });
  }
});

// DELETE conversation
conversationRouter.delete('/conversations/:id', async (req, res) => {
  try {
    const deleted = await deleteConversation(req.params.id);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete conversation' });
  }
});
