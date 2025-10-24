/**
 * Shared TypeScript types for Todo App
 * These types are shared between backend and frontend for type safety
 */

/**
 * Todo priority levels
 */
export type TodoPriority = 'low' | 'medium' | 'high';

/**
 * Todo entity as stored in database
 */
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: TodoPriority;
  due_date: string | null; // ISO 8601 timestamp
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Create todo request payload
 */
export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: TodoPriority;
  due_date?: string; // ISO 8601 timestamp
}

/**
 * Update todo request payload (partial updates)
 */
export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: TodoPriority;
  due_date?: string | null; // ISO 8601 timestamp
}

/**
 * Todo list filters
 */
export interface TodoFilters {
  completed?: boolean;
  priority?: TodoPriority;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Paginated todo list response
 */
export interface TodoListResponse {
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Todo statistics
 */
export interface TodoStats {
  total: number;
  completed: number;
  incomplete: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  database?: 'connected' | 'disconnected';
}
