/**
 * Type-safe API client for Todo App backend
 * Handles all HTTP requests with proper error handling
 */

import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoFilters,
  TodoListResponse,
  TodoStats,
  HealthResponse,
  ApiError,
} from '@/shared/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Handle non-JSON responses (like 204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new ApiClientError(
        error.message || 'An error occurred',
        response.status,
        error.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network errors or other fetch failures
    throw new ApiClientError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

/**
 * Build query string from filters
 */
function buildQueryString(filters?: TodoFilters): string {
  if (!filters) return '';

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * API client with all endpoints
 */
export const apiClient = {
  // Health check
  health: () => fetchApi<HealthResponse>('/api/health'),

  // Get all todos with optional filters
  getTodos: (filters?: TodoFilters) =>
    fetchApi<TodoListResponse>(`/api/todos${buildQueryString(filters)}`),

  // Get single todo by ID
  getTodo: (id: string) => fetchApi<Todo>(`/api/todos/${id}`),

  // Create new todo
  createTodo: (data: CreateTodoRequest) =>
    fetchApi<Todo>('/api/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update todo (partial update)
  updateTodo: (id: string, data: UpdateTodoRequest) =>
    fetchApi<Todo>(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete todo
  deleteTodo: (id: string) =>
    fetchApi<void>(`/api/todos/${id}`, {
      method: 'DELETE',
    }),

  // Toggle todo completion status
  toggleTodo: (id: string) =>
    fetchApi<Todo>(`/api/todos/${id}/toggle`, {
      method: 'POST',
    }),

  // Delete all completed todos
  deleteCompleted: () =>
    fetchApi<{ deleted: number }>('/api/todos', {
      method: 'DELETE',
    }),

  // Get statistics
  getStats: () => fetchApi<TodoStats>('/api/stats'),
};
