import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FootprintLog from '../models/Footprint';
import User from '../models/User';
import { generateAIInsights, analyzeImageEcoLens } from '../services/geminiService';

export const getPersonalizedInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Retrieve last 30 days of footprints
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const logs = await FootprintLog.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).select('category carbonEmission date amount');

    const insights = await generateAIInsights(logs, user.name);

    res.status(200).json(insights);
  } catch (error) {
    console.error('Get insights controller error:', error);
    res.status(500).json({ message: 'Internal server error generating AI insights' });
  }
};

export const runEcoLensAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No image file uploaded' });
      return;
    }

    const { buffer, mimetype, originalname } = req.file;

    console.log(`Running EcoLens analysis on file: ${originalname} (${mimetype}, ${buffer.length} bytes)`);

    const result = await analyzeImageEcoLens(buffer, mimetype, originalname);

    // Reward user points for using EcoLens
    const user = await User.findById(userId);
    if (user) {
      user.points += 15; // EcoLens gives 15 points
      await user.save();
    }

    res.status(200).json({
      analysis: result,
      pointsEarned: 15
    });
  } catch (error) {
    console.error('EcoLens analysis controller error:', error);
    res.status(500).json({ message: 'Internal server error during EcoLens image analysis' });
  }
};
