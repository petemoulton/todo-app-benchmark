/**
 * Global error handling middleware
 */
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

/**
 * Error handler middleware - must be registered last
 */
export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle database errors
  if (err.message?.includes('duplicate key')) {
    res.status(409).json({ error: 'Resource already exists' });
    return;
  }

  if (err.message?.includes('violates foreign key')) {
    res.status(400).json({ error: 'Invalid reference' });
    return;
  }

  // Handle custom API errors
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(err.details && { details: err.details }),
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(
  req: Request,
  res: Response
): void {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
}

/**
 * Create a custom API error
 */
export function createError(message: string, statusCode: number, details?: any): ApiError {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}
