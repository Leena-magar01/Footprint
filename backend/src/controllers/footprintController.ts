import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FootprintLog from '../models/Footprint';
import User from '../models/User';
import Goal from '../models/Goal';
import { calculateEmissions } from '../services/footprintCalculator';
import { runMLPrediction } from '../services/mlService';

export const logFootprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, amount, details, date, carbonEmission } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!category || amount === undefined) {
      res.status(400).json({ message: 'Category and amount are required' });
      return;
    }

    const calculatedCarbon = carbonEmission !== undefined ? Number(carbonEmission) : calculateEmissions(category, amount, details || {});

    const newLog = new FootprintLog({
      userId,
      category,
      amount,
      carbonEmission: calculatedCarbon,
      details: details || {},
      date: date ? new Date(date) : new Date()
    });

    await newLog.save();

    // Reward user with points for logging activity
    const user = await User.findById(userId);
    if (user) {
      user.points += 10;
      await user.save();
    }

    // Auto-update active goals in the same category
    const activeGoals = await Goal.find({
      userId,
      status: 'active',
      category: { $in: [category, 'total'] },
      startDate: { $lte: newLog.date },
      endDate: { $gte: newLog.date }
    });

    for (const goal of activeGoals) {
      // Re-sum all emissions for this goal's period
      const query: any = {
        userId,
        date: { $gte: goal.startDate, $lte: goal.endDate }
      };
      if (goal.category !== 'total') {
        query.category = goal.category;
      }
      const logs = await FootprintLog.find(query);
      const totalEmissions = logs.reduce((sum, log) => sum + log.carbonEmission, 0);
      goal.currentValue = totalEmissions;
      
      // Update goal status if period ended or if achieved
      if (totalEmissions <= goal.targetValue) {
        // If they are under their carbon budget
        // Usually checked at the end of the goal period, but we update progress live
      }
      await goal.save();
    }

    res.status(201).json({
      message: 'Footprint logged successfully',
      log: newLog,
      pointsEarned: 10
    });
  } catch (error) {
    console.error('Log footprint error:', error);
    res.status(500).json({ message: 'Internal server error logging footprint' });
  }
};

export const getFootprintHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const logs = await FootprintLog.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const totalLogs = await FootprintLog.countDocuments({ userId });

    res.status(200).json({
      logs,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalLogs / limit),
        totalLogs
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Internal server error fetching footprint history' });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Retrieve all footprint logs of the user
    const logs = await FootprintLog.find({ userId }).sort({ date: 1 });

    // Calculate totals and category-wise breakdown
    let totalEmissions = 0;
    const breakdown = {
      transportation: 0,
      electricity: 0,
      food: 0,
      water: 0,
      shopping: 0
    };

    logs.forEach(log => {
      totalEmissions += log.carbonEmission;
      if (log.category in breakdown) {
        breakdown[log.category] += log.carbonEmission;
      }
    });

    // 1. Weekly Trends (grouping last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyLogs = logs.filter(log => new Date(log.date) >= sevenDaysAgo);
    
    const weeklyTrend: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      weeklyTrend[dateStr] = 0;
    }
    
    weeklyLogs.forEach(log => {
      const dateStr = new Date(log.date).toISOString().split('T')[0];
      if (dateStr in weeklyTrend) {
        weeklyTrend[dateStr] += log.carbonEmission;
      }
    });

    // 2. Monthly Trends (grouping last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyLogs = logs.filter(log => new Date(log.date) >= thirtyDaysAgo);
    
    // Group monthly emissions by week
    const monthlyTrend: Record<string, number> = {
      'Week 1': 0,
      'Week 2': 0,
      'Week 3': 0,
      'Week 4': 0
    };

    monthlyLogs.forEach(log => {
      const diffTime = Math.abs(new Date().getTime() - new Date(log.date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) monthlyTrend['Week 4'] += log.carbonEmission;
      else if (diffDays <= 14) monthlyTrend['Week 3'] += log.carbonEmission;
      else if (diffDays <= 21) monthlyTrend['Week 2'] += log.carbonEmission;
      else if (diffDays <= 30) monthlyTrend['Week 1'] += log.carbonEmission;
    });

    // 3. Environmental Equivalents
    // Average daily carbon footprint of a person in developed countries is ~30 kg CO2.
    // If the user's average is lower, we count the savings.
    // Let's calculate total days tracked:
    let daysTracked = 1;
    if (logs.length > 1) {
      const firstDate = new Date(logs[0].date).getTime();
      const lastDate = new Date(logs[logs.length - 1].date).getTime();
      daysTracked = Math.max(1, Math.ceil(Math.abs(lastDate - firstDate) / (1000 * 60 * 60 * 24)));
    }

    const baselineEmissions = daysTracked * 25.0; // 25kg CO2 baseline per day
    const co2Saved = Math.max(0, baselineEmissions - totalEmissions);

    // Equivalents calculations:
    // 1 Tree absorbs ~22 kg CO2 per year (so ~1.8 kg CO2/month or ~0.06 kg/day)
    // Here we can show the equivalent trees saved or carbon footprint comparison
    const treesSaved = co2Saved / 22.0; 
    const kmAvoided = co2Saved / 0.18; // Average petrol car emits 0.18 kg CO2/km
    const energyConserved = co2Saved / 0.45; // Average grid electricity: 0.45 kg CO2/kWh

    // Current footprint equivalents (to visualize their impact)
    const currentTreesEquivalent = totalEmissions / 22.0;
    const currentKmEquivalent = totalEmissions / 0.18;
    const currentEnergyEquivalent = totalEmissions / 0.45;

    res.status(200).json({
      totals: {
        totalEmissions,
        daysTracked,
        averageDaily: totalEmissions / daysTracked
      },
      breakdown,
      trends: {
        weekly: Object.entries(weeklyTrend).map(([date, val]) => ({ date, emission: val })),
        monthly: Object.entries(monthlyTrend).map(([week, val]) => ({ week, emission: val }))
      },
      equivalents: {
        co2Saved,
        treesSaved,
        kmAvoided,
        energyConserved,
        currentTreesEquivalent,
        currentKmEquivalent,
        currentEnergyEquivalent
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Internal server error fetching analytics' });
  }
};

export const getForecast = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Fetch monthly historical emissions from user logs
    // We group logs by calendar month to feed to the ML algorithm
    const logs = await FootprintLog.find({ userId }).sort({ date: 1 });
    
    // Group emissions by month
    const monthlyMap: Record<string, number> = {};
    logs.forEach(log => {
      const yearMonth = new Date(log.date).toISOString().substring(0, 7) + '-01'; // format YYYY-MM-01
      monthlyMap[yearMonth] = (monthlyMap[yearMonth] || 0) + log.carbonEmission;
    });

    const historicalData = Object.entries(monthlyMap).map(([date, emission]) => ({
      date,
      emission
    }));

    // Find active total reduction goal to fetch target percentage
    const activeGoal = await Goal.findOne({ userId, status: 'active', category: 'total' });
    const targetReduction = activeGoal ? activeGoal.targetReductionPercentage : 10.0;

    const prediction = await runMLPrediction(historicalData, targetReduction);

    res.status(200).json({
      historicalData,
      prediction
    });
  } catch (error) {
    console.error('Get forecast error:', error);
    res.status(500).json({ message: 'Internal server error generating forecast' });
  }
};
