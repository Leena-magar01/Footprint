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
      user.points += challenge.points;
      
      // Update active streak if completing challenges
      const today = new Date();
      const lastActiveDate = new Date(user.lastActive);
      const diffTime = Math.abs(today.getTime() - lastActiveDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        user.streak += 1;
      }
      user.lastActive = today;

      // Reward badges based on points milestones
      if (user.points >= 100 && !user.badges.includes('Eco Starter')) {
        user.badges.push('Eco Starter');
        badgesEarned.push('Eco Starter');
      }
      if (user.points >= 500 && !user.badges.includes('Eco Warrior')) {
        user.badges.push('Eco Warrior');
        badgesEarned.push('Eco Warrior');
      }
      if (user.points >= 1500 && !user.badges.includes('Carbon Hero')) {
        user.badges.push('Carbon Hero');
        badgesEarned.push('Carbon Hero');
      }

      await user.save();
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
