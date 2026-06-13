import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { connectDB, disconnectDB } from '../config/db';
import User from '../models/User';
import FootprintLog from '../models/Footprint';
import Challenge from '../models/Challenge';
import UserChallenge from '../models/UserChallenge';
import Goal from '../models/Goal';
import Notification from '../models/Notification';

describe('EcoPilot AI Features Integration Tests', () => {
  let token = '';
  let userId = '';

  beforeAll(async () => {
    process.env.MONGODB_URI = ''; // Force in-memory DB
    await connectDB();

    // Create a test user
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Eco Warrior',
        email: 'features_test@ecopilot.com',
        password: 'securePassword123'
      });
    
    token = regRes.body.token;
    userId = regRes.body.user.id;

    // Seed a couple of challenges for the test suite
    await Challenge.deleteMany({});
    await Challenge.insertMany([
      {
        title: 'Walk Challenge',
        description: 'Walk instead of driving today.',
        category: 'transportation',
        type: 'daily',
        points: 50,
        requirements: { targetCount: 1 }
      },
      {
        title: 'Zero Waste Week',
        description: 'Zero food waste for 7 days.',
        category: 'food',
        type: 'weekly',
        points: 100,
        requirements: { targetCount: 7 }
      }
    ]);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await FootprintLog.deleteMany({});
    await Challenge.deleteMany({});
    await UserChallenge.deleteMany({});
    await Goal.deleteMany({});
    await Notification.deleteMany({});
    await disconnectDB();
  });

  beforeEach(async () => {
    await FootprintLog.deleteMany({});
    await UserChallenge.deleteMany({});
    await Goal.deleteMany({});
    await Notification.deleteMany({});
    
    // Reset user stats
    const user = await User.findById(userId);
    if (user) {
      user.points = 0;
      user.streak = 0;
      user.badges = ['Green Beginner'];
      await user.save();
    }
  });

  describe('Carbon Footprint API', () => {
    it('should log carbon activity and award 10 points', async () => {
      const logData = {
        category: 'electricity',
        amount: 100, // 100 kWh
        date: new Date().toISOString()
      };

      const res = await request(app)
        .post('/api/footprint')
        .set('Authorization', `Bearer ${token}`)
        .send(logData);

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('logged successfully');
      expect(res.body.log.carbonEmission).toBe(45); // 100 * 0.45

      const user = await User.findById(userId);
      expect(user?.points).toBe(10);
    });

    it('should accept custom carbonEmission value (EcoLens preservation)', async () => {
      const logData = {
        category: 'food',
        amount: 1,
        carbonEmission: 7.82, // AI estimated beef cheeseburger footprint
        details: { dietType: 'poultry' } // standard would compute 1 * 1.2 = 1.2
      };

      const res = await request(app)
        .post('/api/footprint')
        .set('Authorization', `Bearer ${token}`)
        .send(logData);

      expect(res.status).toBe(201);
      expect(res.body.log.carbonEmission).toBe(7.82); // Preserves AI estimate!
    });

    it('should fetch paginated log history', async () => {
      // Log two entries
      await FootprintLog.create([
        { userId, category: 'water', amount: 50, carbonEmission: 0.015, date: new Date() },
        { userId, category: 'shopping', amount: 2, carbonEmission: 10, date: new Date() }
      ]);

      const res = await request(app)
        .get('/api/footprint/history?page=1&limit=5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.logs.length).toBe(2);
      expect(res.body.pagination.totalLogs).toBe(2);
    });

    it('should fetch aggregated analytics and equivalents', async () => {
      await FootprintLog.create([
        { userId, category: 'transportation', amount: 10, carbonEmission: 1.8, date: new Date() },
        { userId, category: 'electricity', amount: 20, carbonEmission: 9.0, date: new Date() }
      ]);

      const res = await request(app)
        .get('/api/footprint/analytics')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.totals.totalEmissions).toBe(10.8);
      expect(res.body.breakdown.transportation).toBe(1.8);
      expect(res.body.breakdown.electricity).toBe(9.0);
      expect(res.body.equivalents).toHaveProperty('co2Saved');
      expect(res.body.equivalents).toHaveProperty('treesSaved');
    });
  });

  describe('Eco Challenges API', () => {
    it('should list all challenges with enrolled status', async () => {
      const res = await request(app)
        .get('/api/challenges')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].userStatus).toBe('not_started');
    });

    it('should join an available challenge', async () => {
      const challenges = await Challenge.find({});
      const challengeId = challenges[0].id;

      const res = await request(app)
        .post('/api/challenges/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ challengeId });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('Successfully enrolled');
      expect(res.body.enrollment.status).toBe('active');
    });

    it('should complete active challenge, reward points and check calendar-date streak', async () => {
      const challenges = await Challenge.find({});
      const challenge = challenges[0];

      // Join
      const joinRes = await request(app)
        .post('/api/challenges/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ challengeId: challenge.id });

      const userChallengeId = joinRes.body.enrollment._id;

      // Initialize streak for testing
      const user = await User.findById(userId);
      if (user) {
        user.streak = 2;
        // Set lastActive to yesterday to verify consecutive day increment
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        user.lastActive = yesterday;
        await user.save();
      }

      // Complete
      const res = await request(app)
        .post('/api/challenges/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ userChallengeId });

      expect(res.status).toBe(200);
      expect(res.body.pointsAwarded).toBe(challenge.points);
      
      const updatedUser = await User.findById(userId);
      expect(updatedUser?.points).toBe(challenge.points);
      expect(updatedUser?.streak).toBe(3); // Incremented from 2 to 3
    });
  });

  describe('Goals Management API', () => {
    it('should create a goal with daily baseline carbon budget', async () => {
      const goalData = {
        category: 'total',
        targetReductionPercentage: 10,
        durationDays: 7
      };

      const res = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${token}`)
        .send(goalData);

      expect(res.status).toBe(201);
      expect(res.body.goal.category).toBe('total');
      expect(res.body.goal.status).toBe('active');
      expect(res.body.goal.targetValue).toBeLessThan(res.body.baselineEmissions);
    });

    it('should list all user goals', async () => {
      await Goal.create({
        userId,
        category: 'electricity',
        targetReductionPercentage: 15,
        targetValue: 30,
        currentValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active'
      });

      const res = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].category).toBe('electricity');
    });
  });

  describe('Notifications API', () => {
    it('should auto-generate alert notifications when transport emissions spike', async () => {
      // Seed historical logs: last week has 10kg transportation, this week has 25kg (150% spike!)
      const lastWeekDate = new Date();
      lastWeekDate.setDate(lastWeekDate.getDate() - 10);

      const thisWeekDate = new Date();

      await FootprintLog.create([
        { userId, category: 'transportation', amount: 10, carbonEmission: 10.0, date: lastWeekDate },
        { userId, category: 'transportation', amount: 25, carbonEmission: 25.0, date: thisWeekDate }
      ]);

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      
      // Should have generated a spike notification
      const spikeAlert = res.body.find((n: any) => n.type === 'alert' && n.message.includes('Transportation emissions increased'));
      expect(spikeAlert).toBeDefined();
    });

    it('should mark all notifications as read', async () => {
      await Notification.create([
        { userId, message: 'Message 1', type: 'recommendation', read: false },
        { userId, message: 'Message 2', type: 'alert', read: false }
      ]);

      const res = await request(app)
        .put('/api/notifications/read')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const unreadCount = await Notification.countDocuments({ userId, read: false });
      expect(unreadCount).toBe(0);
    });
  });
});
