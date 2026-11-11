import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'PROVEN' | 'INFERRED' | 'UNKNOWN' | 'GENERAL_KNOWLEDGE';
  headline?: string;
  evidenceCount?: number;
  sourcesUsed?: string[];
  investigationId?: string;
  rawResult?: any;
}

export interface IConversation extends MongooseDocument {
  conversationId: string;
  title: string;
  summary?: string;
  activeDocIds: string[];
  messages: IMessage[];
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    id: { type: String, required: true },
    sender: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['PROVEN', 'INFERRED', 'UNKNOWN', 'GENERAL_KNOWLEDGE'],
      default: 'PROVEN',
    },
    headline: { type: String },
    evidenceCount: { type: Number, default: 0 },
    sourcesUsed: [{ type: String }],
    investigationId: { type: String },
    rawResult: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: 'New Conversation' },
    summary: { type: String },
    activeDocIds: [{ type: String }],
    messages: [MessageSchema],
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ConversationModel =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);
