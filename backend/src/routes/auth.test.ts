import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { connectDB, disconnectDB } from '../config/db';
import User from '../models/User';

describe('Authentication API Endpoints Integration Tests', () => {
  beforeAll(async () => {
    // Connect to in-memory database
    process.env.MONGODB_URI = ''; // force MongoMemoryServer
    await connectDB();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  const testUser = {
    name: 'Eco Warrior',
    email: 'warrior@ecopilot.com',
    password: 'securePassword123'
  };

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user and return a JWT', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('name', testUser.name);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user.points).toBe(0);
      expect(response.body.user.badges).toContain('Green Beginner');
    });

    it('should fail registration if email already exists', async () => {
      // Register first time
      await request(app).post('/api/auth/register').send(testUser);

      // Try registering again
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail registration if fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Incomplete' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register test user
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login successfully with valid credentials and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', testUser.email);
    });

    it('should fail login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });

    it('should fail login with unregistered email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@ecopilot.com',
          password: testUser.password
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let token = '';

    beforeEach(async () => {
      const response = await request(app).post('/api/auth/register').send(testUser);
      token = response.body.token;
    });

    it('should fetch user profile if authorized with valid JWT', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', testUser.name);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail to fetch profile if authorization header is missing', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should fail to fetch profile if token is invalid', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(response.status).toBe(403);
    });
  });
});
