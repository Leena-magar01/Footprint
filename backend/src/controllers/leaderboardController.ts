import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    // Find top 10 users ranked by points
    const topUsers = await User.find({})
      .sort({ points: -1 })
      .limit(10)
      .select('name points badges streak');

    const leaderboard = topUsers.map((user, idx) => ({
      rank: idx + 1,
      id: user.id,
      name: user.name,
      points: user.points,
      badges: user.badges,
      streak: user.streak,
      isCurrentUser: user.id.toString() === userId?.toString()
    }));

    // If current user is not in top 10, find their specific rank
    let currentUserRank = null;
    if (userId) {
      const currentUser = await User.findById(userId);
      if (currentUser) {
        const higherCount = await User.countDocuments({ points: { $gt: currentUser.points } });
        currentUserRank = {
          rank: higherCount + 1,
          name: currentUser.name,
          points: currentUser.points,
          badges: currentUser.badges,
          streak: currentUser.streak,
          isCurrentUser: true
        };
      }
    }

    res.status(200).json({
      leaderboard,
      currentUserRank
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Internal server error fetching leaderboard' });
  }
};
