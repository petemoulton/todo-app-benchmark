/**
 * Zod validation schemas for Todo API requests
 */
import { z } from 'zod';

/**
 * Priority levels for todos
 */
export const priorityEnum = z.enum(['low', 'medium', 'high']);

/**
 * Schema for creating a new todo
 */
export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().max(5000, 'Description too long').optional(),
  priority: priorityEnum.default('medium'),
  due_date: z.string().datetime().optional(),
  completed: z.boolean().default(false),
});

/**
 * Schema for updating a todo (all fields optional)
 */
export const updateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long').optional(),
  description: z.string().max(5000, 'Description too long').optional().nullable(),
  priority: priorityEnum.optional(),
  due_date: z.string().datetime().optional().nullable(),
  completed: z.boolean().optional(),
});

/**
 * Schema for query parameters when listing todos
 */
export const listTodosQuerySchema = z.object({
  completed: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  priority: priorityEnum.optional(),
  search: z.string().optional(),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('50').transform(Number),
});

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Type exports
 */
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type ListTodosQuery = z.infer<typeof listTodosQuerySchema>;
export type Priority = z.infer<typeof priorityEnum>;
