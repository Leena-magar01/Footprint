import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Goal from '../models/Goal';
import FootprintLog from '../models/Footprint';

export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { category, targetReductionPercentage, durationDays } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!category || !targetReductionPercentage || !durationDays) {
      res.status(400).json({ message: 'Category, targetReductionPercentage, and durationDays are required' });
      return;
    }

    // 1. Determine baseline emissions
    // Average daily emissions over last 30 days for this category
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const query: any = {
      userId,
      date: { $gte: thirtyDaysAgo }
    };
    if (category !== 'total') {
      query.category = category;
    }

    const logs = await FootprintLog.find(query);
    const totalEmissionsInPeriod = logs.reduce((sum, log) => sum + log.carbonEmission, 0);
    
    // Default baseline if no logs: 15kg CO2 per day for total, or 3kg for specific categories
    const defaultDailyRate = category === 'total' ? 20.0 : 4.0;
    const dailyBaseline = logs.length > 0 ? (totalEmissionsInPeriod / 30.0) : defaultDailyRate;
    
    const goalDurationBaseline = dailyBaseline * durationDays;
    const reductionAmount = goalDurationBaseline * (targetReductionPercentage / 100.0);
    const targetValue = Math.max(1.0, goalDurationBaseline - reductionAmount); // carbon budget for the goal period

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const newGoal = new Goal({
      userId,
      category,
      targetReductionPercentage,
      targetValue,
      currentValue: 0, // start at 0 and accumulate logged emissions
      startDate,
      endDate,
      status: 'active'
    });

    await newGoal.save();

    res.status(201).json({
      message: 'Carbon reduction goal created successfully',
      goal: newGoal,
      baselineEmissions: goalDurationBaseline
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Internal server error creating goal' });
  }
};

export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const goals = await Goal.find({ userId }).sort({ endDate: -1 });

    // Live update status for completed periods
    const today = new Date();
    let updated = false;

    for (const goal of goals) {
      if (goal.status === 'active' && today > goal.endDate) {
        // Goal duration has completed, check if budget was maintained
        if (goal.currentValue <= goal.targetValue) {
          goal.status = 'achieved';
        } else {
          goal.status = 'failed';
        }
        await goal.save();
        updated = true;
      }
    }

    // Refresh list if any status was updated
    const finalGoals = updated ? await Goal.find({ userId }).sort({ endDate: -1 }) : goals;

    res.status(200).json(finalGoals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Internal server error fetching goals' });
  }
};
