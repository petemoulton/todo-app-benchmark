/**
 * Health and stats routes tests
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { createTestTodo } from './setup.js';

describe('GET /api/health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'healthy',
      database: 'connected',
    });
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.uptime).toBeGreaterThan(0);
  });
});

describe('GET /api/stats', () => {
  it('should return empty stats when no todos exist', async () => {
    const res = await request(app).get('/api/stats');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      total: 0,
      completed: 0,
      incomplete: 0,
      completionRate: 0,
      byPriority: {},
      overdue: 0,
    });
  });

  it('should return correct statistics', async () => {
    await createTestTodo({ completed: true, priority: 'high' });
    await createTestTodo({ completed: true, priority: 'medium' });
    await createTestTodo({ completed: false, priority: 'low' });
    await createTestTodo({ completed: false, priority: 'high' });

    const res = await request(app).get('/api/stats');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      total: 4,
      completed: 2,
      incomplete: 2,
      completionRate: 50,
      byPriority: {
        high: 2,
        medium: 1,
        low: 1,
      },
    });
  });

  it('should count overdue todos', async () => {
    const pastDate = new Date('2020-01-01').toISOString();
    await createTestTodo({
      completed: false,
      due_date: pastDate,
    });
    await createTestTodo({
      completed: false,
      due_date: null,
    });

    const res = await request(app).get('/api/stats');

    expect(res.status).toBe(200);
    expect(res.body.overdue).toBe(1);
  });

  it('should not count completed overdue todos', async () => {
    const pastDate = new Date('2020-01-01').toISOString();
    await createTestTodo({
      completed: true,
      due_date: pastDate,
    });

    const res = await request(app).get('/api/stats');

    expect(res.status).toBe(200);
    expect(res.body.overdue).toBe(0);
  });

  it('should calculate completion rate correctly', async () => {
    await createTestTodo({ completed: true });
    await createTestTodo({ completed: true });
    await createTestTodo({ completed: true });
    await createTestTodo({ completed: false });

    const res = await request(app).get('/api/stats');

    expect(res.status).toBe(200);
    expect(res.body.completionRate).toBe(75);
  });
});
