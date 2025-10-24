import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoList } from './TodoList';
import type { Todo } from '@/types';

const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Todo 1',
    description: 'Description 1',
    completed: false,
    priority: 'high',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Todo 2',
    description: 'Description 2',
    completed: true,
    priority: 'medium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe('TodoList', () => {
  const mockHandlers = {
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onToggle: vi.fn(),
    onClearCompleted: vi.fn(),
  };

  it('should render all todos', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} />);

    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
  });

  it('should display todo count', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} />);

    expect(screen.getByText('Todos (2)')).toBeInTheDocument();
  });

  it('should show empty state when no todos', () => {
    render(<TodoList todos={[]} {...mockHandlers} />);

    expect(screen.getByText('No todos found')).toBeInTheDocument();
    expect(screen.getByText(/get started by creating a new todo/i)).toBeInTheDocument();
  });

  it('should show clear completed button when there are completed todos', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} />);

    expect(screen.getByText('Clear Completed')).toBeInTheDocument();
  });

  it('should not show clear completed button when no completed todos', () => {
    const activeTodos = mockTodos.filter((t) => !t.completed);
    render(<TodoList todos={activeTodos} {...mockHandlers} />);

    expect(screen.queryByText('Clear Completed')).not.toBeInTheDocument();
  });

  it('should call onClearCompleted when button is clicked', async () => {
    const onClearCompleted = vi.fn();
    render(<TodoList todos={mockTodos} {...mockHandlers} onClearCompleted={onClearCompleted} />);

    const clearButton = screen.getByText('Clear Completed');
    await userEvent.click(clearButton);

    expect(onClearCompleted).toHaveBeenCalled();
  });

  it('should render todos with unique keys', () => {
    const { container } = render(<TodoList todos={mockTodos} {...mockHandlers} />);

    const todoItems = container.querySelectorAll('[class*="group border"]');
    expect(todoItems).toHaveLength(2);
  });

  it('should handle single todo', () => {
    const singleTodo = [mockTodos[0]];
    render(<TodoList todos={singleTodo} {...mockHandlers} />);

    expect(screen.getByText('Todos (1)')).toBeInTheDocument();
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
  });

  it('should show empty state icon', () => {
    const { container } = render(<TodoList todos={[]} {...mockHandlers} />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
