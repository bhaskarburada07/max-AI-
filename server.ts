import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, getDatabaseStatus } from './server/config/db.js';
import { uploadRouter } from './server/routes/upload.js';
import { investigateRouter } from './server/routes/investigate.js';
import { conversationRouter } from './server/routes/conversation.js';
import { userRouter } from './server/routes/user.js';
import { reportsRouter } from './server/routes/reports.js';
import { getAllDocuments, getAllConversations } from './server/services/dbService.js';

dotenv.config();

// Global safety guards to prevent unhandled background aborts from terminating the server
process.on('uncaughtException', (err) => {
  console.warn('[Server] Uncaught exception safely handled:', err?.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.warn('[Server] Unhandled rejection safely handled:', reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize MongoDB connection (resilient with fallback)
  await connectDB();

  // Middleware for large base64 or text documents
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // REST API Routes
  app.use('/api', uploadRouter);
  app.use('/api', investigateRouter);
  app.use('/api', conversationRouter);
  app.use('/api', userRouter);
  app.use('/api', reportsRouter);

  // Status & Health Check endpoint
  app.get('/api/health', async (req, res) => {
    const dbStatus = getDatabaseStatus();
    const docs = await getAllDocuments().catch(() => []);
    const convs = await getAllConversations().catch(() => []);

    res.json({
      status: 'online',
      product: 'MAX AI – Evidence-Grounded AI Answer System',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
      database: dbStatus,
      activeDocuments: docs.length,
      savedConversations: convs.length,
    });
  });

  // Vite integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MAX AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
