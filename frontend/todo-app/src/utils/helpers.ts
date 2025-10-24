import type { Todo, TodoFilter, TodoStats } from '@/types';

/**
 * Filter todos based on completion status
 */
export function filterTodos(todos: Todo[], filter: TodoFilter): Todo[] {
  switch (filter) {
    case 'active':
      return todos.filter((todo) => !todo.completed);
    case 'completed':
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

/**
 * Search todos by title or description
 */
export function searchTodos(todos: Todo[], query: string): Todo[] {
  if (!query.trim()) return todos;

  const lowerQuery = query.toLowerCase();
  return todos.filter(
    (todo) =>
      todo.title.toLowerCase().includes(lowerQuery) ||
      (todo.description?.toLowerCase().includes(lowerQuery) ?? false)
  );
}

/**
 * Calculate statistics from todo list
 */
export function calculateStats(todos: Todo[]): TodoStats {
  const completed = todos.filter((t) => t.completed).length;
  const active = todos.length - completed;

  const byPriority = todos.reduce(
    (acc, todo) => {
      acc[todo.priority]++;
      return acc;
    },
    { low: 0, medium: 0, high: 0 }
  );

  return {
    total: todos.length,
    completed,
    active,
    byPriority,
  };
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Check if a todo is overdue
 */
export function isOverdue(todo: Todo): boolean {
  if (!todo.due_date || todo.completed) return false;
  return new Date(todo.due_date) < new Date();
}

/**
 * Get priority badge color
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'text-red-700 bg-red-50 ring-red-600/20';
    case 'medium':
      return 'text-yellow-700 bg-yellow-50 ring-yellow-600/20';
    case 'low':
      return 'text-gray-700 bg-gray-50 ring-gray-600/20';
    default:
      return 'text-gray-700 bg-gray-50 ring-gray-600/20';
  }
}
