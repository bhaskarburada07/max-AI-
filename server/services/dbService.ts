import mongoose from 'mongoose';
import { DocumentModel, IDocument } from '../models/Document.js';
import { ConversationModel, IConversation, IMessage } from '../models/Conversation.js';
import { UserModel, IUser } from '../models/User.js';
import { getDatabaseStatus } from '../config/db.js';
import { Source } from '../schemas/evidence.js';

// In-Memory store for resilient operation whenever MongoDB server is not running
class MemoryStore {
  public documents: Map<string, any> = new Map();
  public conversations: Map<string, any> = new Map();
  public userProfile: any = {
    name: 'Research Analyst',
    email: 'analyst@max-ai.internal',
    theme: 'dark',
    role: 'Lead Investigator',
    preferences: {
      notificationsEnabled: true,
      autoScrollChat: true,
      streamResponses: false,
      citationStyle: 'page',
    },
    stats: {
      totalQuestionsAsked: 0,
      totalDocumentsUploaded: 0,
      lastActiveAt: new Date().toISOString(),
    },
  };

  constructor() {
    // Seed initial default welcome conversation
    const defaultConvId = 'conv-welcome-default';
    this.conversations.set(defaultConvId, {
      conversationId: defaultConvId,
      title: 'Welcome to MAX AI',
      summary: 'Evidence-Grounded AI Answer System workspace',
      activeDocIds: [],
      messages: [
        {
          id: 'msg-welcome-1',
          sender: 'assistant',
          content:
            'Welcome to **MAX AI – Evidence-Grounded AI Answer System**.\n\nUpload documents (PDF, CSV, Images, TXT) and ask questions. Every answer is retrieved, verified, and cited directly from your evidence.',
          timestamp: new Date().toISOString(),
          status: 'GENERAL_KNOWLEDGE',
          headline: 'System Ready',
          evidenceCount: 0,
          sourcesUsed: [],
        },
      ],
      pinned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

const memory = new MemoryStore();

function isMongooseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// ==================== DOCUMENT REPOSITORY ====================

export async function getAllDocuments(): Promise<Source[]> {
  if (isMongooseConnected()) {
    try {
      const docs = await DocumentModel.find({}).sort({ updatedAt: -1 }).lean();
      return docs.map((d: any) => ({
        id: d.docId,
        fileName: d.fileName,
        type: d.type,
        fileSize: d.fileSize,
        uploadedAt: d.uploadedAt ? d.uploadedAt.toISOString() : new Date().toISOString(),
        status: d.status,
        statusMessage: d.statusMessage,
        errorMessage: d.errorMessage,
        content: d.content,
        pages: d.pages,
        pageCount: d.pageCount,
        characterCount: d.characterCount,
        ocrUsed: d.ocrUsed,
        generatedSuggestions: d.generatedSuggestions,
        metadata: d.metadata,
        description: d.description,
      }));
    } catch (err) {
      console.warn('[DB Service] Error querying MongoDB documents, using memory fallback:', err);
    }
  }

  return Array.from(memory.documents.values()).sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export async function saveDocument(source: Source): Promise<Source> {
  // Always update memory store
  memory.documents.set(source.id, source);
  memory.userProfile.stats.totalDocumentsUploaded = memory.documents.size;
  memory.userProfile.stats.lastActiveAt = new Date().toISOString();

  if (isMongooseConnected()) {
    try {
      await DocumentModel.findOneAndUpdate(
        { docId: source.id },
        {
          docId: source.id,
          fileName: source.fileName,
          type: source.type,
          fileSize: source.fileSize || 0,
          uploadedAt: new Date(source.uploadedAt || Date.now()),
          status: source.status || 'READY',
          statusMessage: source.statusMessage || 'Source verified',
          errorMessage: source.errorMessage,
          content: source.content || '',
          pages: source.pages || [],
          pageCount: source.pageCount || (source.pages?.length || 1),
          characterCount: source.characterCount || source.content?.length || 0,
          ocrUsed: Boolean(source.ocrUsed),
          generatedSuggestions: source.generatedSuggestions || [],
          metadata: source.metadata,
          description: source.description,
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('[DB Service] Error saving document to MongoDB:', err);
    }
  }

  return source;
}

export async function deleteDocument(docId: string): Promise<boolean> {
  memory.documents.delete(docId);
  memory.userProfile.stats.totalDocumentsUploaded = memory.documents.size;

  if (isMongooseConnected()) {
    try {
      await DocumentModel.deleteOne({ docId });
    } catch (err) {
      console.warn('[DB Service] Error deleting document from MongoDB:', err);
    }
  }

  return true;
}

export async function clearAllDocuments(): Promise<boolean> {
  memory.documents.clear();
  memory.userProfile.stats.totalDocumentsUploaded = 0;

  if (isMongooseConnected()) {
    try {
      await DocumentModel.deleteMany({});
    } catch (err) {
      console.warn('[DB Service] Error clearing documents from MongoDB:', err);
    }
  }

  return true;
}

// ==================== CONVERSATION REPOSITORY ====================

export async function getAllConversations(): Promise<any[]> {
  if (isMongooseConnected()) {
    try {
      const convs = await ConversationModel.find({}).sort({ updatedAt: -1 }).lean();
      return convs.map((c: any) => ({
        id: c.conversationId,
        conversationId: c.conversationId,
        title: c.title,
        summary: c.summary,
        activeDocIds: c.activeDocIds || [],
        messagesCount: c.messages?.length || 0,
        lastMessage: c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null,
        pinned: Boolean(c.pinned),
        createdAt: c.createdAt ? c.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: c.updatedAt ? c.updatedAt.toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('[DB Service] Error querying MongoDB conversations, using memory fallback:', err);
    }
  }

  return Array.from(memory.conversations.values())
    .map((c: any) => ({
      id: c.conversationId,
      conversationId: c.conversationId,
      title: c.title,
      summary: c.summary,
      activeDocIds: c.activeDocIds || [],
      messagesCount: c.messages?.length || 0,
      lastMessage: c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null,
      pinned: Boolean(c.pinned),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getConversationById(conversationId: string): Promise<any | null> {
  if (isMongooseConnected()) {
    try {
      const conv = await ConversationModel.findOne({ conversationId }).lean();
      if (conv) {
        return {
          id: conv.conversationId,
          conversationId: conv.conversationId,
          title: conv.title,
          summary: conv.summary,
          activeDocIds: conv.activeDocIds || [],
          messages: conv.messages || [],
          pinned: Boolean(conv.pinned),
          createdAt: conv.createdAt ? conv.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: conv.updatedAt ? conv.updatedAt.toISOString() : new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('[DB Service] Error finding conversation in MongoDB:', err);
    }
  }

  return memory.conversations.get(conversationId) || null;
}

export async function createConversation(title?: string, activeDocIds: string[] = []): Promise<any> {
  const conversationId = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const conv = {
    id: conversationId,
    conversationId,
    title: title || 'New Investigation',
    summary: '',
    activeDocIds,
    messages: [],
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memory.conversations.set(conversationId, conv);

  if (isMongooseConnected()) {
    try {
      await ConversationModel.create({
        conversationId,
        title: conv.title,
        activeDocIds,
        messages: [],
        pinned: false,
      });
    } catch (err) {
      console.warn('[DB Service] Error creating conversation in MongoDB:', err);
    }
  }

  return conv;
}

export async function addMessageToConversation(
  conversationId: string,
  message: {
    sender: 'user' | 'assistant';
    content: string;
    status?: 'PROVEN' | 'INFERRED' | 'UNKNOWN' | 'GENERAL_KNOWLEDGE';
    headline?: string;
    evidenceCount?: number;
    sourcesUsed?: string[];
    investigationId?: string;
    rawResult?: any;
  }
): Promise<any> {
  let conv = memory.conversations.get(conversationId);
  if (!conv) {
    conv = await createConversation(
      message.sender === 'user' ? message.content.slice(0, 40) : 'Investigation',
      []
    );
  }

  const msgObj = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...message,
    timestamp: new Date().toISOString(),
  };

  conv.messages.push(msgObj);
  conv.updatedAt = new Date().toISOString();

  // If first user message, update conversation title
  if (conv.messages.length === 1 && message.sender === 'user') {
    conv.title = message.content.slice(0, 45) + (message.content.length > 45 ? '...' : '');
  }

  memory.conversations.set(conversationId, conv);
  if (message.sender === 'user') {
    memory.userProfile.stats.totalQuestionsAsked += 1;
    memory.userProfile.stats.lastActiveAt = new Date().toISOString();
  }

  if (isMongooseConnected()) {
    try {
      await ConversationModel.findOneAndUpdate(
        { conversationId },
        {
          $push: { messages: msgObj },
          title: conv.title,
          updatedAt: new Date(),
        },
        { upsert: true }
      );
    } catch (err) {
      console.warn('[DB Service] Error adding message in MongoDB:', err);
    }
  }

  return conv;
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  memory.conversations.delete(conversationId);

  if (isMongooseConnected()) {
    try {
      await ConversationModel.deleteOne({ conversationId });
    } catch (err) {
      console.warn('[DB Service] Error deleting conversation from MongoDB:', err);
    }
  }

  return true;
}

// ==================== USER PROFILE REPOSITORY ====================

export async function getUserProfile(): Promise<any> {
  if (isMongooseConnected()) {
    try {
      const user = await UserModel.findOne({}).lean();
      if (user) {
        return user;
      }
    } catch (err) {
      console.warn('[DB Service] Error finding user in MongoDB:', err);
    }
  }

  return memory.userProfile;
}

export async function updateUserProfile(updates: any): Promise<any> {
  memory.userProfile = {
    ...memory.userProfile,
    ...updates,
    preferences: {
      ...memory.userProfile.preferences,
      ...(updates.preferences || {}),
    },
  };

  if (isMongooseConnected()) {
    try {
      const user = await UserModel.findOneAndUpdate(
        {},
        { $set: memory.userProfile },
        { upsert: true, new: true }
      ).lean();
      return user;
    } catch (err) {
      console.warn('[DB Service] Error updating user in MongoDB:', err);
    }
  }

  return memory.userProfile;
}

// ==================== REPORTS & INSIGHTS SUMMARY ====================

export async function getReportsSummary(): Promise<any> {
  const docs = await getAllDocuments();
  const convs = await getAllConversations();

  const totalPages = docs.reduce((acc, d) => acc + (d.pageCount || 1), 0);
  const totalCharacters = docs.reduce((acc, d) => acc + (d.characterCount || 0), 0);
  const ocrCount = docs.filter((d) => d.ocrUsed).length;

  let totalQuestions = 0;
  let provenAnswers = 0;
  let inferredAnswers = 0;
  let generalKnowledgeAnswers = 0;

  convs.forEach((c) => {
    (c.messages || []).forEach((m: any) => {
      if (m.sender === 'assistant') {
        totalQuestions += 1;
        if (m.status === 'PROVEN') provenAnswers += 1;
        else if (m.status === 'INFERRED') inferredAnswers += 1;
        else if (m.status === 'GENERAL_KNOWLEDGE') generalKnowledgeAnswers += 1;
      }
    });
  });

  return {
    overview: {
      totalDocuments: docs.length,
      totalPages,
      totalCharacters,
      ocrProcessedDocs: ocrCount,
      totalConversations: convs.length,
      totalAnswersGenerated: totalQuestions,
      verificationAccuracy:
        totalQuestions > 0 ? Math.round((provenAnswers / totalQuestions) * 100) : 100,
    },
    statusBreakdown: {
      proven: provenAnswers,
      inferred: inferredAnswers,
      generalKnowledge: generalKnowledgeAnswers,
      unknown: Math.max(0, totalQuestions - (provenAnswers + inferredAnswers + generalKnowledgeAnswers)),
    },
    recentDocuments: docs.slice(0, 5).map((d) => ({
      id: d.id,
      fileName: d.fileName,
      type: d.type,
      pageCount: d.pageCount,
      characterCount: d.characterCount,
      uploadedAt: d.uploadedAt,
      status: d.status,
    })),
    recentConversations: convs.slice(0, 5),
  };
}
