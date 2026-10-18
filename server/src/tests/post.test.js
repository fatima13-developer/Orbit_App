import request from 'supertest';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.model.js';
import Post from '../models/Post.model.js';

describe('Posts API Tests', () => {
  let token = '';
  let userId = '';
  let postId = '';

  beforeAll(async () => {
    await connectDB();
    const demoRes = await request(app).post('/api/v1/auth/demo');
    token = demoRes.body.data.accessToken;
    userId = demoRes.body.data.user._id;
  });

  afterAll(async () => {
    if (postId) {
      await Post.findByIdAndDelete(postId);
    }
    await closeDB();
  });

  it('should create a new post with text content', async () => {
    const res = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'This is an automated test post on Orbit!'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.post).toBeDefined();
    expect(res.body.data.post.content).toBe('This is an automated test post on Orbit!');
    postId = res.body.data.post._id;
  });

  it('should fetch the feed for the authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/posts/feed')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.posts)).toBe(true);
  });

  it('should like a post', async () => {
    const res = await request(app)
      .post(`/api/v1/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isLiked).toBe(true);
  });

  it('should unlike a post', async () => {
    const res = await request(app)
      .delete(`/api/v1/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isLiked).toBe(false);
  });

  it('should allow guest users to fetch public feed without token', async () => {
    const res = await request(app).get('/api/v1/posts/feed');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.posts)).toBe(true);
    if (res.body.data.posts.length > 0) {
      expect(res.body.data.posts[0].isLiked).toBe(false);
    }
  });
});
