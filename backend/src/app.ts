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
app.use(cors({
  origin: '*', // For development. Adjust to frontend origin in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
