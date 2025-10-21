/**
 * Middleware tests
 */
import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { validateBody, validateQuery, validateParams } from '../src/middleware/validation.js';
import { errorHandler, createError } from '../src/middleware/errorHandler.js';

describe('validation middleware', () => {
  const mockNext = vi.fn();
  const mockRes = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateBody', () => {
    it('should pass validation with valid data', () => {
      const schema = z.object({ name: z.string() });
      const middleware = validateBody(schema);
      const req = { body: { name: 'test' } } as Request;

      middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(req.body).toEqual({ name: 'test' });
    });

    it('should call next with error on invalid data', () => {
      const schema = z.object({ name: z.string() });
      const middleware = validateBody(schema);
      const req = { body: { name: 123 } } as Request;

      middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
    });
  });

  describe('validateQuery', () => {
    it('should pass validation with valid query', () => {
      const schema = z.object({ page: z.string() });
      const middleware = validateQuery(schema);
      const req = { query: { page: '1' } } as unknown as Request;

      middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateParams', () => {
    it('should pass validation with valid params', () => {
      const schema = z.object({ id: z.string().uuid() });
      const middleware = validateParams(schema);
      const req = { params: { id: '123e4567-e89b-12d3-a456-426614174000' } } as unknown as Request;

      middleware(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});

describe('errorHandler', () => {
  const mockNext = vi.fn();
  const mockRes = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  const mockReq = {
    path: '/test',
    method: 'GET',
  } as Request;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle ZodError with 400 status', () => {
    const schema = z.object({ name: z.string() });
    try {
      schema.parse({ name: 123 });
    } catch (error) {
      errorHandler(error as any, mockReq, mockRes, mockNext);
    }

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation failed',
        details: expect.any(Array),
      })
    );
  });

  it('should handle custom API errors', () => {
    const error = createError('Not found', 404);

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Not found',
    });
  });

  it('should handle generic errors with 500 status', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });

  it('should include details if provided', () => {
    const error = createError('Bad request', 400, { field: 'invalid' });

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Bad request',
      details: { field: 'invalid' },
    });
  });
});

describe('createError', () => {
  it('should create error with statusCode', () => {
    const error = createError('Test error', 400);

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
  });

  it('should create error with details', () => {
    const error = createError('Test error', 400, { field: 'test' });

    expect(error.details).toEqual({ field: 'test' });
  });
});
