import { Response } from 'express';
import { AuthRequest, generateToken } from '../middleware/auth';
import User from '../models/User';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: 'A user with this email already exists' });
      return;
    }

    const newUser = new User({
      name,
      email,
      password,
      badges: ['Green Beginner']
    });

    await newUser.save();

    const token = generateToken({ id: newUser.id, email: newUser.email });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        points: newUser.points,
        streak: newUser.streak,
        badges: newUser.badges
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Update streak and lastActive date (using midnight comparison for calendar days)
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
      user.streak = 1; // restart streak
    }
    
    user.lastActive = today;
    await user.save();

    const token = generateToken({ id: user.id, email: user.email });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points,
        streak: user.streak,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error retrieving profile' });
  }
};
