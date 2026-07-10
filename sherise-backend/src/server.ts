import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SheRise Backend API running on port ${PORT}`);
});

export default app;
