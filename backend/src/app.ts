import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import footprintRoutes from './routes/footprint';
import challengeRoutes from './routes/challenge';
import goalRoutes from './routes/goal';
import aiRoutes from './routes/ai';
import leaderboardRoutes from './routes/leaderboard';
import notificationRoutes from './routes/notification';

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://footprint-higz.vercel.app',
  'https://ecopilot-frontend-732582226489.us-central1.run.app',
  process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/footprint', footprintRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled express error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
});

export default app;
