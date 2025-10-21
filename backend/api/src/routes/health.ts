/**
 * Health check and stats routes
 */
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { query, testConnection } from '../utils/db.js';

const router = Router();

/**
 * GET /api/health - Health check endpoint
 */
router.get('/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dbHealthy = await testConnection();

    const health = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealthy ? 'connected' : 'disconnected',
    };

    res.status(dbHealthy ? 200 : 503).json(health);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats - Get todo statistics
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get overall counts
    const totalResult = await query<{ total: string }>(
      'SELECT COUNT(*) as total FROM todo_app.todos'
    );

    const completedResult = await query<{ completed: string }>(
      'SELECT COUNT(*) as completed FROM todo_app.todos WHERE completed = true'
    );

    // Get counts by priority
    const priorityResult = await query<{ priority: string; count: string }>(
      `SELECT priority, COUNT(*) as count
       FROM todo_app.todos
       GROUP BY priority
       ORDER BY
         CASE priority
           WHEN 'high' THEN 1
           WHEN 'medium' THEN 2
           WHEN 'low' THEN 3
         END`
    );

    // Get overdue count
    const overdueResult = await query<{ overdue: string }>(
      `SELECT COUNT(*) as overdue
       FROM todo_app.todos
       WHERE due_date < NOW() AND completed = false`
    );

    const total = parseInt(totalResult.rows[0]?.total || '0', 10);
    const completed = parseInt(completedResult.rows[0]?.completed || '0', 10);

    const stats = {
      total,
      completed,
      incomplete: total - completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byPriority: priorityResult.rows.reduce((acc, row) => {
        acc[row.priority] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<string, number>),
      overdue: parseInt(overdueResult.rows[0]?.overdue || '0', 10),
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
