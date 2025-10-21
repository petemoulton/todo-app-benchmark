/**
 * Zod schema validation tests
 */
import { describe, it, expect } from 'vitest';
import {
  createTodoSchema,
  updateTodoSchema,
  listTodosQuerySchema,
  uuidSchema,
  priorityEnum,
} from '../src/schemas/todo.schema.js';

describe('createTodoSchema', () => {
  it('should validate minimal valid input', () => {
    const result = createTodoSchema.parse({ title: 'Test' });
    expect(result).toMatchObject({
      title: 'Test',
      priority: 'medium',
      completed: false,
    });
  });

  it('should validate complete input', () => {
    const input = {
      title: 'Test Todo',
      description: 'Description',
      priority: 'high',
      due_date: '2025-12-31T23:59:59.000Z',
      completed: false,
    };
    const result = createTodoSchema.parse(input);
    expect(result).toEqual(input);
  });

  it('should reject missing title', () => {
    expect(() => createTodoSchema.parse({})).toThrow();
  });

  it('should reject empty title', () => {
    expect(() => createTodoSchema.parse({ title: '' })).toThrow();
  });

  it('should reject title too long', () => {
    expect(() => createTodoSchema.parse({ title: 'a'.repeat(501) })).toThrow();
  });

  it('should reject invalid priority', () => {
    expect(() => createTodoSchema.parse({ title: 'Test', priority: 'urgent' })).toThrow();
  });

  it('should reject invalid date format', () => {
    expect(() => createTodoSchema.parse({ title: 'Test', due_date: 'invalid' })).toThrow();
  });

  it('should apply default values', () => {
    const result = createTodoSchema.parse({ title: 'Test' });
    expect(result.priority).toBe('medium');
    expect(result.completed).toBe(false);
  });
});

describe('updateTodoSchema', () => {
  it('should allow partial updates', () => {
    const result = updateTodoSchema.parse({ title: 'Updated' });
    expect(result).toEqual({ title: 'Updated' });
  });

  it('should allow updating to null', () => {
    const result = updateTodoSchema.parse({ description: null });
    expect(result.description).toBeNull();
  });

  it('should allow all fields', () => {
    const input = {
      title: 'Updated',
      description: 'New desc',
      priority: 'low',
      due_date: '2025-12-31T23:59:59.000Z',
      completed: true,
    };
    const result = updateTodoSchema.parse(input);
    expect(result).toEqual(input);
  });

  it('should reject invalid title', () => {
    expect(() => updateTodoSchema.parse({ title: '' })).toThrow();
  });

  it('should allow empty object', () => {
    const result = updateTodoSchema.parse({});
    expect(result).toEqual({});
  });
});

describe('listTodosQuerySchema', () => {
  it('should parse default values', () => {
    const result = listTodosQuerySchema.parse({});
    expect(result).toMatchObject({
      page: 1,
      limit: 50,
    });
  });

  it('should parse completed filter', () => {
    const result = listTodosQuerySchema.parse({ completed: 'true' });
    expect(result.completed).toBe(true);
  });

  it('should parse priority filter', () => {
    const result = listTodosQuerySchema.parse({ priority: 'high' });
    expect(result.priority).toBe('high');
  });

  it('should parse search query', () => {
    const result = listTodosQuerySchema.parse({ search: 'test' });
    expect(result.search).toBe('test');
  });

  it('should convert page and limit to numbers', () => {
    const result = listTodosQuerySchema.parse({ page: '2', limit: '25' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(25);
  });
});

describe('uuidSchema', () => {
  it('should accept valid UUIDs', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    expect(() => uuidSchema.parse(validUuid)).not.toThrow();
  });

  it('should reject invalid UUIDs', () => {
    expect(() => uuidSchema.parse('not-a-uuid')).toThrow();
    expect(() => uuidSchema.parse('123')).toThrow();
  });
});

describe('priorityEnum', () => {
  it('should accept valid priorities', () => {
    expect(() => priorityEnum.parse('low')).not.toThrow();
    expect(() => priorityEnum.parse('medium')).not.toThrow();
    expect(() => priorityEnum.parse('high')).not.toThrow();
  });

  it('should reject invalid priorities', () => {
    expect(() => priorityEnum.parse('urgent')).toThrow();
    expect(() => priorityEnum.parse('')).toThrow();
  });
});
