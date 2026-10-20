import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { prisma } from './lib/prisma';
import profileRoutes from './routes/profile.routes';
import roadmapRoutes from './routes/roadmap.routes';
import skillPassportRoutes from './routes/skillPassport.routes';
import opportunitiesRoutes from './routes/opportunities.routes';
import progressRoutes from './routes/progress.routes';
import webhookRoutes from './routes/webhook.routes';

// Load environment variables for local development. Vercel injects production
// variables into process.env before the function is initialized.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed frontend origins come from FRONTEND_URL (comma-separated). There is
// deliberately no hardcoded production default any more: the old fallback was
// a single Vercel preview-deployment URL, and production once served a Vercel
// dashboard URL here — both silently broke CORS for the real frontend.
const configuredFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = configuredFrontendUrl
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.warn('FRONTEND_URL is not set — CORS will only allow http://localhost:3000');
}

// Security headers (also drops the default X-Powered-By: Express)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  credentials: true,
}));

// Rate limiting. The store is in-memory (per serverless instance), which
// still blunts single-instance abuse; swap in a shared store (e.g. Upstash)
// if limits ever need to be global. The webhook is unauthenticated and the
// generate endpoints spend Gemini quota, so they get tighter limits.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
});
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
});
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many generation requests, please try again later' },
});
app.use('/api', apiLimiter);
app.use('/api/webhooks', webhookLimiter);
app.use('/api/roadmap/generate', generateLimiter);
app.use('/api/skill-passport/generate', generateLimiter);

// The Clerk webhook must be verified against the EXACT raw request bytes
// (svix signs those), so capture the raw body for webhook routes BEFORE the
// JSON parser runs. Everywhere else, JSON parsing applies as usual.
app.use('/api/webhooks', express.raw({ type: 'application/json', limit: '1mb' }));
app.use(express.json());

// Health check — actually verifies the database is reachable
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'ok', message: 'SheRise API is running' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'error', db: 'unreachable', message: 'Database is unreachable' });
  }
});

// API Routes
app.use('/api/profile', profileRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/skill-passport', skillPassportRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/webhooks', webhookRoutes);

// JSON 404 for anything unmatched (the Express HTML error page used to leak
// through to API clients expecting JSON)
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// Error handling middleware — internals are logged, never returned
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({
    success: false,
    error: status < 500 ? (err.message || 'Request failed') : 'Internal server error',
  });
});

// Vercel imports the Express app as a serverless handler. Keep the listener
// only for local development and traditional Node hosting.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SheRise Backend API running on port ${PORT}`);
  });
}

export default app;
