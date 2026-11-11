# MAX AI – Evidence-Grounded AI Answer System

A complete full-stack web application designed for evidence-first question answering, document intelligence, and multi-modal reasoning built with **React.js**, **Node.js**, **Express.js**, **MongoDB**, and **Google Gemini API**.

---

## 🌟 Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │    React.js + Tailwind Frontend      │
                      │  • ChatGPT-like Conversational UI    │
                      │  • Light / Dark Mode System          │
                      │  • Navigation: Home, Docs, Chat, etc │
                      │  • Evidence Badges & Page Citations  │
                      └──────────────────┬───────────────────┘
                                         │ REST API
                                         ▼
                      ┌──────────────────────────────────────┐
                      │    Node.js + Express.js Backend      │
                      │  • /api/investigate (RAG Pipeline)   │
                      │  • /api/documents (File Ingestion)   │
                      │  • /api/conversations (Chat History) │
                      │  • /api/user (Profile & Settings)    │
                      │  • /api/reports (Document Analytics) │
                      └───────┬──────────────────────┬───────┘
                              │                      │
                   Mongoose   │                      │ Google GenAI SDK
                              ▼                      ▼
               ┌──────────────────────┐  ┌───────────────────────┐
               │   MongoDB Database   │  │   Gemini 3.8 Flash    │
               │ • Users & Profiles   │  │ • Multimodal Reasoning│
               │ • Document Metadata  │  │ • Context-aware RAG   │
               │ • Chat Conversations │  │ • Verification Checks │
               └──────────────────────┘  └───────────────────────┘
```

---

## 📦 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js 22, Express.js 4, TypeScript (`tsx`)
- **Database**: MongoDB via Mongoose (with automated resilient fallback store)
- **AI & Reasoning Engine**: `@google/genai` TypeScript SDK (Gemini 3.8 Flash / Flash Lite)
- **Document Extractors**: `pdf-parse` text extractor, stream decoder, and Gemini Multimodal OCR

---

## 🚀 Key Features

1. **Evidence-Grounded Question Answering**:
   - Zero hallucination policy: every claim is tied to verified document extracts.
   - Exact page references (e.g. `[Page 2]`) and source citations.
   - Verification status classification: `PROVEN`, `INFERRED`, `UNKNOWN`, or `GENERAL_KNOWLEDGE`.
2. **Multi-Format Document Ingestion**:
   - PDFs (standard and scanned with OCR fallback), CSVs, Excel, TXT, Images, and Charts.
   - Instant extraction diagnostics: detected pages, character count, OCR usage.
   - Automatic dynamic question suggestions derived from actual document content.
3. **MongoDB Chat & Document Persistence**:
   - Stores user profiles, conversation histories, and document metadata.
   - Resilient database connection: connects to MongoDB Atlas or local MongoDB when configured, or transparently runs with an in-memory fallback.
4. **Modern UI Inspired by Productivity Standards**:
   - Light Mode & Dark Mode toggle with comfortable contrast.
   - Dynamic time-based greeting (*"Good morning 👋"*, *"Good afternoon 👋"*, *"Good evening 👋"*, *"Good night 👋"*).
   - Sidebar navigation: Home, Documents, Chat, Reports, History, Settings.
   - Clear feedback on upload status: `UPLOADING` → `PROCESSING` → `READY` → `ERROR`.

---

## 🛠️ Local Development & Setup

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your Google Gemini API key:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb://127.0.0.1:27017/max_ai
```

*(Note: If `MONGODB_URI` is not provided, MAX AI will operate using its built-in memory store, allowing the app to run without an active MongoDB daemon).*

### 3. Start Development Server
```bash
npm run dev
```
The application will be running on `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check (MongoDB connection, Gemini, counts) |
| `GET` | `/api/documents` | Fetch all uploaded documents and metadata |
| `POST` | `/api/upload` | Upload and verify a document (PDF, CSV, TXT, Image) |
| `DELETE` | `/api/documents/:id` | Remove document from active context and database |
| `POST` | `/api/investigate` | Run evidence-grounded AI reasoning and save conversation |
| `GET` | `/api/conversations` | Retrieve conversation thread history |
| `GET` | `/api/conversations/:id` | Get single conversation with all messages and evidence |
| `POST` | `/api/conversations` | Create new conversation thread |
| `DELETE` | `/api/conversations/:id` | Delete conversation thread |
| `GET` | `/api/user/profile` | Retrieve user profile and theme preferences |
| `PUT` | `/api/user/profile` | Update user settings, name, and preferences |
| `GET` | `/api/reports` | Get analytical summary across all ingested documents |
