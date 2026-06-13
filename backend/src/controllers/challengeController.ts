import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Challenge from '../models/Challenge';
import UserChallenge from '../models/UserChallenge';
import User from '../models/User';

export const getChallenges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const challenges = await Challenge.find({});
    const userChallenges = await UserChallenge.find({ userId });

    // Combine system challenges with user status
    const formatted = challenges.map(ch => {
      const active = userChallenges.find(uc => uc.challengeId.toString() === ch.id.toString());
      return {
        ...ch.toObject(),
        userStatus: active ? active.status : 'not_started',
        userProgress: active ? active.progress : 0,
        userChallengeId: active ? active.id : null
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ message: 'Internal server error fetching challenges' });
  }
};

export const joinChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { challengeId } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!challengeId) {
      res.status(400).json({ message: 'Challenge ID is required' });
      return;
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }

    const existing = await UserChallenge.findOne({ userId, challengeId });
    if (existing) {
      res.status(409).json({ message: 'Already enrolled in this challenge' });
      return;
    }

    const newUserChallenge = new UserChallenge({
      userId,
      challengeId,
      status: 'active',
      progress: 0
    });

    await newUserChallenge.save();

    res.status(201).json({
      message: 'Successfully enrolled in challenge',
      enrollment: newUserChallenge
    });
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({ message: 'Internal server error joining challenge' });
  }
};

export const completeChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { userChallengeId } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!userChallengeId) {
      res.status(400).json({ message: 'User Challenge ID is required' });
      return;
    }

    const userChallenge = await UserChallenge.findOne({ _id: userChallengeId, userId });
    if (!userChallenge) {
      res.status(404).json({ message: 'Enrolled challenge not found' });
      return;
    }

    if (userChallenge.status === 'completed') {
      res.status(400).json({ message: 'Challenge is already completed' });
      return;
    }

    const challenge = await Challenge.findById(userChallenge.challengeId);
    if (!challenge) {
      res.status(404).json({ message: 'Associated challenge details not found' });
      return;
    }

    userChallenge.status = 'completed';
    userChallenge.progress = 100;
    userChallenge.completedAt = new Date();
    await userChallenge.save();

    // Reward points to the user
    const user = await User.findById(userId);
    let badgesEarned: string[] = [];
    if (user) {
      const oldBadges = [...user.badges];
      user.points += challenge.points;
      
      // Update active streak if completing challenges (using midnight comparison for calendar days)
      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const lastActive = new Date(user.lastActive);
      const lastActiveMidnight = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate()).getTime();
      
      const diffTime = todayMidnight - lastActiveMidnight;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (user.streak === 0) {
        user.streak = 1;
      } else if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1; // reset streak if missed a day
      }
      user.lastActive = today;

      await user.save();
      badgesEarned = user.badges.filter(b => !oldBadges.includes(b));
    }

    res.status(200).json({
      message: 'Challenge completed! Points awarded.',
      pointsAwarded: challenge.points,
      totalPoints: user ? user.points : 0,
      badgesEarned
    });
  } catch (error) {
    console.error('Complete challenge error:', error);
    res.status(500).json({ message: 'Internal server error completing challenge' });
  }
};
