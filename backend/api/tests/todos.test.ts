/**
 * Todo routes integration tests
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { createTestTodo, getAllTodos } from './setup.js';

describe('GET /api/todos', () => {
  it('should return empty array when no todos exist', async () => {
    const res = await request(app).get('/api/todos');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it('should return all todos', async () => {
    await createTestTodo({ title: 'Todo 1' });
    await createTestTodo({ title: 'Todo 2' });

    const res = await request(app).get('/api/todos');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by completed status', async () => {
    await createTestTodo({ completed: true });
    await createTestTodo({ completed: false });

    const res = await request(app).get('/api/todos?completed=true');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].completed).toBe(true);
  });

  it('should filter by priority', async () => {
    await createTestTodo({ priority: 'high' });
    await createTestTodo({ priority: 'low' });

    const res = await request(app).get('/api/todos?priority=high');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].priority).toBe('high');
  });

  it('should search by title', async () => {
    await createTestTodo({ title: 'Buy groceries' });
    await createTestTodo({ title: 'Write code' });

    const res = await request(app).get('/api/todos?search=groceries');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toContain('groceries');
  });

  it('should paginate results', async () => {
    for (let i = 0; i < 5; i++) {
      await createTestTodo({ title: `Todo ${i}` });
    }

    const res = await request(app).get('/api/todos?limit=2&page=1');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.totalPages).toBe(3);
  });
});

describe('POST /api/todos', () => {
  it('should create a new todo with minimal data', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'New Todo' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'New Todo',
      priority: 'medium',
      completed: false,
    });
    expect(res.body.id).toBeDefined();
  });

  it('should create a todo with all fields', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({
        title: 'Complete Todo',
        description: 'A detailed description',
        priority: 'high',
        due_date: '2025-12-31T23:59:59.000Z',
        completed: false,
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Complete Todo',
      description: 'A detailed description',
      priority: 'high',
    });
  });

  it('should reject todo without title', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('should reject todo with invalid priority', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({
        title: 'Test',
        priority: 'invalid',
      });

    expect(res.status).toBe(400);
  });

  it('should reject todo with title too long', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({
        title: 'a'.repeat(501),
      });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/todos/:id', () => {
  it('should return a single todo', async () => {
    const todo = await createTestTodo({ title: 'Test Todo' });

    const res = await request(app).get(`/api/todos/${todo.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: todo.id,
      title: 'Test Todo',
    });
  });

  it('should return 404 for non-existent todo', async () => {
    const res = await request(app).get('/api/todos/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Todo not found');
  });

  it('should return 400 for invalid UUID', async () => {
    const res = await request(app).get('/api/todos/invalid-id');

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/todos/:id', () => {
  it('should update todo title', async () => {
    const todo = await createTestTodo({ title: 'Original' });

    const res = await request(app)
      .patch(`/api/todos/${todo.id}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
  });

  it('should update multiple fields', async () => {
    const todo = await createTestTodo();

    const res = await request(app)
      .patch(`/api/todos/${todo.id}`)
      .send({
        title: 'Updated Title',
        priority: 'high',
        completed: true,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      title: 'Updated Title',
      priority: 'high',
      completed: true,
    });
  });

  it('should update description to null', async () => {
    const todo = await createTestTodo({ description: 'Original' });

    const res = await request(app)
      .patch(`/api/todos/${todo.id}`)
      .send({ description: null });

    expect(res.status).toBe(200);
    expect(res.body.description).toBeNull();
  });

  it('should return 404 for non-existent todo', async () => {
    const res = await request(app)
      .patch('/api/todos/00000000-0000-0000-0000-000000000000')
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
  });

  it('should return 400 when no fields provided', async () => {
    const todo = await createTestTodo();

    const res = await request(app)
      .patch(`/api/todos/${todo.id}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No fields to update');
  });
});

describe('DELETE /api/todos/:id', () => {
  it('should delete a todo', async () => {
    const todo = await createTestTodo();

    const res = await request(app).delete(`/api/todos/${todo.id}`);

    expect(res.status).toBe(204);

    const todos = await getAllTodos();
    expect(todos).toHaveLength(0);
  });

  it('should return 404 for non-existent todo', async () => {
    const res = await request(app).delete('/api/todos/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/todos/:id/toggle', () => {
  it('should toggle completion from false to true', async () => {
    const todo = await createTestTodo({ completed: false });

    const res = await request(app).post(`/api/todos/${todo.id}/toggle`);

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('should toggle completion from true to false', async () => {
    const todo = await createTestTodo({ completed: true });

    const res = await request(app).post(`/api/todos/${todo.id}/toggle`);

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(false);
  });

  it('should return 404 for non-existent todo', async () => {
    const res = await request(app).post('/api/todos/00000000-0000-0000-0000-000000000000/toggle');

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/todos (clear completed)', () => {
  it('should delete all completed todos', async () => {
    await createTestTodo({ completed: true });
    await createTestTodo({ completed: true });
    await createTestTodo({ completed: false });

    const res = await request(app).delete('/api/todos');

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(2);

    const remaining = await getAllTodos();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].completed).toBe(false);
  });

  it('should return 0 when no completed todos exist', async () => {
    await createTestTodo({ completed: false });

    const res = await request(app).delete('/api/todos');

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(0);
  });
});
