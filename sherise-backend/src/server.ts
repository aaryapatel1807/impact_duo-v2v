import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables for local development. Vercel injects production
// variables into process.env before the function is initialized.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const configuredFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = configuredFrontendUrl
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'SheRise API is running' });
});

// Import routes
import profileRoutes from './routes/profile.routes';
import roadmapRoutes from './routes/roadmap.routes';
import skillPassportRoutes from './routes/skillPassport.routes';
import opportunitiesRoutes from './routes/opportunities.routes';
import progressRoutes from './routes/progress.routes';
import webhookRoutes from './routes/webhook.routes';

// API Routes
app.use('/api/profile', profileRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/skill-passport', skillPassportRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
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
