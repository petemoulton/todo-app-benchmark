/**
 * Priority levels for todos
 */
export type TodoPriority = 'low' | 'medium' | 'high';

/**
 * Filter options for todo list
 */
export type TodoFilter = 'all' | 'active' | 'completed';

/**
 * Todo item interface matching backend schema
 */
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TodoPriority;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Form data for creating a new todo
 */
export interface CreateTodoInput {
  title: string;
  description?: string;
  priority: TodoPriority;
  due_date?: string;
}

/**
 * Form data for updating an existing todo
 */
export interface UpdateTodoInput {
  title?: string;
  description?: string;
  priority?: TodoPriority;
  due_date?: string;
  completed?: boolean;
}

/**
 * Statistics for the todo list
 */
export interface TodoStats {
  total: number;
  completed: number;
  active: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}
