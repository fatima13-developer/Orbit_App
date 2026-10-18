import request from 'supertest';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.model.js';

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['testuser@example.com', 'newuser@example.com'] } });
    await closeDB();
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Password123'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe('testuser@example.com');
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should prevent duplicate registration with same email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Another User',
        username: 'anotheruser',
        email: 'testuser@example.com',
        password: 'Password123'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'Password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should support instant demo login', async () => {
    const res = await request(app).post('/api/v1/auth/demo');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('demo@orbit.com');
    expect(res.body.data.accessToken).toBeDefined();
  });
});
