/**
 * Todo API routes
 */
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { query } from '../utils/db.js';
import {
  createTodoSchema,
  updateTodoSchema,
  listTodosQuerySchema,
  uuidSchema,
  type CreateTodoInput,
  type UpdateTodoInput,
  type ListTodosQuery,
} from '../schemas/todo.schema.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

/**
 * GET /api/todos - List todos with filters
 */
router.get(
  '/',
  validateQuery(listTodosQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { completed, priority, search, page = 1, limit = 50 } = req.query as ListTodosQuery;
      const offset = (page - 1) * limit;

      let sql = 'SELECT * FROM todo_app.todos WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      // Filter by completion status
      if (completed !== undefined) {
        sql += ` AND completed = $${paramIndex}`;
        params.push(completed);
        paramIndex++;
      }

      // Filter by priority
      if (priority) {
        sql += ` AND priority = $${paramIndex}`;
        params.push(priority);
        paramIndex++;
      }

      // Search in title and description
      if (search) {
        sql += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      // Order and pagination
      sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await query(sql, params);

      // Get total count for pagination
      let countSql = 'SELECT COUNT(*) as total FROM todo_app.todos WHERE 1=1';
      const countParams: any[] = [];
      let countIndex = 1;

      if (completed !== undefined) {
        countSql += ` AND completed = $${countIndex}`;
        countParams.push(completed);
        countIndex++;
      }

      if (priority) {
        countSql += ` AND priority = $${countIndex}`;
        countParams.push(priority);
        countIndex++;
      }

      if (search) {
        countSql += ` AND (title ILIKE $${countIndex} OR description ILIKE $${countIndex})`;
        countParams.push(`%${search}%`);
      }

      const countResult = await query<{ total: string }>(countSql, countParams);
      const total = parseInt(countResult.rows[0]?.total || '0', 10);

      res.json({
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/todos - Create a new todo
 */
router.post(
  '/',
  validateBody(createTodoSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as CreateTodoInput;

      const result = await query(
        `INSERT INTO todo_app.todos (title, description, priority, due_date, completed)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          input.title,
          input.description || null,
          input.priority,
          input.due_date || null,
          input.completed,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/todos/:id - Get a single todo
 */
router.get(
  '/:id',
  validateParams(uuidSchema.transform((id) => ({ id }))),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const result = await query(
        'SELECT * FROM todo_app.todos WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        throw createError('Todo not found', 404);
      }

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/todos/:id - Update a todo
 */
router.patch(
  '/:id',
  validateParams(uuidSchema.transform((id) => ({ id }))),
  validateBody(updateTodoSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const input = req.body as UpdateTodoInput;

      // Build dynamic UPDATE query
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (input.title !== undefined) {
        updates.push(`title = $${paramIndex}`);
        params.push(input.title);
        paramIndex++;
      }

      if (input.description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        params.push(input.description);
        paramIndex++;
      }

      if (input.priority !== undefined) {
        updates.push(`priority = $${paramIndex}`);
        params.push(input.priority);
        paramIndex++;
      }

      if (input.due_date !== undefined) {
        updates.push(`due_date = $${paramIndex}`);
        params.push(input.due_date);
        paramIndex++;
      }

      if (input.completed !== undefined) {
        updates.push(`completed = $${paramIndex}`);
        params.push(input.completed);
        paramIndex++;
      }

      if (updates.length === 0) {
        throw createError('No fields to update', 400);
      }

      updates.push(`updated_at = NOW()`);
      params.push(id);

      const result = await query(
        `UPDATE todo_app.todos SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        params
      );

      if (result.rows.length === 0) {
        throw createError('Todo not found', 404);
      }

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/todos/:id - Delete a todo
 */
router.delete(
  '/:id',
  validateParams(uuidSchema.transform((id) => ({ id }))),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const result = await query(
        'DELETE FROM todo_app.todos WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        throw createError('Todo not found', 404);
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/todos/:id/toggle - Toggle completion status
 */
router.post(
  '/:id/toggle',
  validateParams(uuidSchema.transform((id) => ({ id }))),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const result = await query(
        `UPDATE todo_app.todos
         SET completed = NOT completed, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        throw createError('Todo not found', 404);
      }

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/todos - Clear all completed todos
 */
router.delete(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await query<{ count: number }>(
        'DELETE FROM todo_app.todos WHERE completed = true'
      );

      res.json({
        deleted: result.rowCount || 0,
        message: `Deleted ${result.rowCount || 0} completed todos`,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
