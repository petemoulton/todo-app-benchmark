import { describe, it, expect } from 'vitest';
import {
  filterTodos,
  searchTodos,
  calculateStats,
  formatDate,
  isOverdue,
  getPriorityColor,
} from './helpers';
import type { Todo } from '@/types';

const mockTodo: Todo = {
  id: '1',
  title: 'Test Todo',
  description: 'Test Description',
  completed: false,
  priority: 'medium',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('filterTodos', () => {
  const todos: Todo[] = [
    { ...mockTodo, id: '1', completed: false },
    { ...mockTodo, id: '2', completed: true },
    { ...mockTodo, id: '3', completed: false },
  ];

  it('should return all todos when filter is "all"', () => {
    const result = filterTodos(todos, 'all');
    expect(result).toHaveLength(3);
  });

  it('should return only active todos when filter is "active"', () => {
    const result = filterTodos(todos, 'active');
    expect(result).toHaveLength(2);
    expect(result.every((t) => !t.completed)).toBe(true);
  });

  it('should return only completed todos when filter is "completed"', () => {
    const result = filterTodos(todos, 'completed');
    expect(result).toHaveLength(1);
    expect(result.every((t) => t.completed)).toBe(true);
  });
});

describe('searchTodos', () => {
  const todos: Todo[] = [
    { ...mockTodo, id: '1', title: 'Buy groceries', description: 'Milk and eggs' },
    { ...mockTodo, id: '2', title: 'Write code', description: 'Fix bug in auth' },
    { ...mockTodo, id: '3', title: 'Read book', description: undefined },
  ];

  it('should return all todos when query is empty', () => {
    const result = searchTodos(todos, '');
    expect(result).toHaveLength(3);
  });

  it('should filter by title', () => {
    const result = searchTodos(todos, 'code');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Write code');
  });

  it('should filter by description', () => {
    const result = searchTodos(todos, 'bug');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Write code');
  });

  it('should be case insensitive', () => {
    const result = searchTodos(todos, 'GROCERIES');
    expect(result).toHaveLength(1);
  });

  it('should handle todos without description', () => {
    const result = searchTodos(todos, 'book');
    expect(result).toHaveLength(1);
  });
});

describe('calculateStats', () => {
  it('should calculate correct stats', () => {
    const todos: Todo[] = [
      { ...mockTodo, id: '1', completed: true, priority: 'high' },
      { ...mockTodo, id: '2', completed: false, priority: 'high' },
      { ...mockTodo, id: '3', completed: false, priority: 'medium' },
      { ...mockTodo, id: '4', completed: false, priority: 'low' },
    ];

    const stats = calculateStats(todos);

    expect(stats.total).toBe(4);
    expect(stats.completed).toBe(1);
    expect(stats.active).toBe(3);
    expect(stats.byPriority.high).toBe(2);
    expect(stats.byPriority.medium).toBe(1);
    expect(stats.byPriority.low).toBe(1);
  });

  it('should handle empty todo list', () => {
    const stats = calculateStats([]);

    expect(stats.total).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.active).toBe(0);
    expect(stats.byPriority.high).toBe(0);
    expect(stats.byPriority.medium).toBe(0);
    expect(stats.byPriority.low).toBe(0);
  });
});

describe('formatDate', () => {
  it('should format today correctly', () => {
    const today = new Date().toISOString();
    expect(formatDate(today)).toBe('Today');
  });

  it('should format tomorrow correctly', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    expect(formatDate(tomorrow)).toBe('Tomorrow');
  });

  it('should format yesterday correctly', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(formatDate(yesterday)).toBe('Yesterday');
  });

  it('should format future dates within a week', () => {
    const future = new Date(Date.now() + 3 * 86400000).toISOString();
    expect(formatDate(future)).toBe('In 3 days');
  });

  it('should format past dates within a week', () => {
    const past = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(formatDate(past)).toBe('3 days ago');
  });
});

describe('isOverdue', () => {
  it('should return true for overdue todos', () => {
    const overdueTodo: Todo = {
      ...mockTodo,
      due_date: new Date(Date.now() - 86400000).toISOString(),
      completed: false,
    };
    expect(isOverdue(overdueTodo)).toBe(true);
  });

  it('should return false for future todos', () => {
    const futureTodo: Todo = {
      ...mockTodo,
      due_date: new Date(Date.now() + 86400000).toISOString(),
      completed: false,
    };
    expect(isOverdue(futureTodo)).toBe(false);
  });

  it('should return false for completed todos even if overdue', () => {
    const completedTodo: Todo = {
      ...mockTodo,
      due_date: new Date(Date.now() - 86400000).toISOString(),
      completed: true,
    };
    expect(isOverdue(completedTodo)).toBe(false);
  });

  it('should return false for todos without due date', () => {
    const noDueDateTodo: Todo = {
      ...mockTodo,
      due_date: undefined,
    };
    expect(isOverdue(noDueDateTodo)).toBe(false);
  });
});

describe('getPriorityColor', () => {
  it('should return correct color for high priority', () => {
    expect(getPriorityColor('high')).toContain('text-red-700');
  });

  it('should return correct color for medium priority', () => {
    expect(getPriorityColor('medium')).toContain('text-yellow-700');
  });

  it('should return correct color for low priority', () => {
    expect(getPriorityColor('low')).toContain('text-gray-700');
  });

  it('should return default color for unknown priority', () => {
    expect(getPriorityColor('unknown')).toContain('text-gray-700');
  });
});
