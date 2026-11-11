import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocumentPage {
  pageNumber: number;
  text: string;
}

export interface IDocument extends MongooseDocument {
  docId: string;
  fileName: string;
  type: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR';
  statusMessage?: string;
  errorMessage?: string;
  content: string;
  pages: IDocumentPage[];
  pageCount: number;
  characterCount: number;
  ocrUsed: boolean;
  generatedSuggestions: string[];
  metadata?: Record<string, any>;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    docId: { type: String, required: true, unique: true, index: true },
    fileName: { type: String, required: true },
    type: { type: String, default: 'text' },
    fileSize: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['UPLOADING', 'PROCESSING', 'READY', 'ERROR'],
      default: 'READY',
    },
    statusMessage: { type: String, default: 'Source verified' },
    errorMessage: { type: String },
    content: { type: String, default: '' },
    pages: [
      {
        pageNumber: { type: Number, required: true },
        text: { type: String, default: '' },
      },
    ],
    pageCount: { type: Number, default: 1 },
    characterCount: { type: Number, default: 0 },
    ocrUsed: { type: Boolean, default: false },
    generatedSuggestions: [{ type: String }],
    metadata: { type: Schema.Types.Mixed },
    description: { type: String },
  },
  { timestamps: true }
);

export const DocumentModel =
  mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
