import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';
import FootprintLog from '../models/Footprint';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // 1. Dynamic Check & Auto-Generation of notifications
    // Fetch user's logs
    const logs = await FootprintLog.find({ userId }).sort({ date: -1 });
    
    // Compare last 7 days vs previous 7 days for transportation
    const now = new Date();
    const last7DaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prev7DaysStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekTrans = logs
      .filter(l => l.category === 'transportation' && l.date >= last7DaysStart)
      .reduce((sum, l) => sum + l.carbonEmission, 0);

    const lastWeekTrans = logs
      .filter(l => l.category === 'transportation' && l.date >= prev7DaysStart && l.date < last7DaysStart)
      .reduce((sum, l) => sum + l.carbonEmission, 0);

    if (lastWeekTrans > 0) {
      const increasePct = ((thisWeekTrans - lastWeekTrans) / lastWeekTrans) * 100;
      if (increasePct >= 10) {
        // Check if we already sent an increase notification in the last 7 days
        const existingAlert = await Notification.findOne({
          userId,
          message: new RegExp('Transportation emissions increased', 'i'),
          createdAt: { $gte: last7DaysStart }
        });

        if (!existingAlert) {
          const alert = new Notification({
            userId,
            message: `Transportation emissions increased by ${increasePct.toFixed(0)}% this week compared to last week. Try walking or taking transit to bring it down!`,
            type: 'alert'
          });
          await alert.save();
        }
      }
    }

    // General tip if they have high transport emissions
    const totalTrans = logs.filter(l => l.category === 'transportation').reduce((sum, l) => sum + l.carbonEmission, 0);
    if (totalTrans > 50) {
      const existingRec = await Notification.findOne({
        userId,
        message: new RegExp('reduce.*CO2.*public transport', 'i')
      });
      if (!existingRec) {
        const rec = new Notification({
          userId,
          message: `You can reduce up to 25 kg CO2 this month by switching to public transport or cycling for short trips.`,
          type: 'recommendation'
        });
        await rec.save();
      }
    }

    // Return notifications
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error fetching notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (notificationId) {
      await Notification.updateOne({ _id: notificationId, userId }, { read: true });
    } else {
      // Mark all as read
      await Notification.updateMany({ userId, read: false }, { read: true });
    }

    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Internal server error updating notification status' });
  }
};
