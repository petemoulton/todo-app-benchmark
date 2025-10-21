/**
 * Test setup and utilities
 */
import { beforeAll, afterAll, afterEach } from 'vitest';
import { query, closePool } from '../src/utils/db.js';

/**
 * Clean up database before all tests
 */
beforeAll(async () => {
  await query('DELETE FROM todo_app.todos');
});

/**
 * Clean up after each test
 */
afterEach(async () => {
  await query('DELETE FROM todo_app.todos');
});

/**
 * Close database connection after all tests
 */
afterAll(async () => {
  await closePool();
});

/**
 * Create a test todo
 */
export async function createTestTodo(overrides: any = {}) {
  const result = await query(
    `INSERT INTO todo_app.todos (title, description, priority, due_date, completed)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      overrides.title || 'Test Todo',
      overrides.description || 'Test description',
      overrides.priority || 'medium',
      overrides.due_date || null,
      overrides.completed || false,
    ]
  );
  return result.rows[0];
}

/**
 * Get all todos from database
 */
export async function getAllTodos() {
  const result = await query('SELECT * FROM todo_app.todos ORDER BY created_at DESC');
  return result.rows;
}
