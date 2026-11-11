import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IUser extends MongooseDocument {
  name: string;
  email?: string;
  theme: 'light' | 'dark' | 'system';
  role: string;
  avatarUrl?: string;
  preferences: {
    notificationsEnabled: boolean;
    autoScrollChat: boolean;
    streamResponses: boolean;
    citationStyle: 'page' | 'inline' | 'footnote';
  };
  stats: {
    totalQuestionsAsked: number;
    totalDocumentsUploaded: number;
    lastActiveAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, default: 'User' },
    email: { type: String, default: 'user@example.com' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    role: { type: String, default: 'Member' },
    avatarUrl: { type: String },
    preferences: {
      notificationsEnabled: { type: Boolean, default: true },
      autoScrollChat: { type: Boolean, default: true },
      streamResponses: { type: Boolean, default: false },
      citationStyle: { type: String, enum: ['page', 'inline', 'footnote'], default: 'page' },
    },
    stats: {
      totalQuestionsAsked: { type: Number, default: 0 },
      totalDocumentsUploaded: { type: Number, default: 0 },
      lastActiveAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
