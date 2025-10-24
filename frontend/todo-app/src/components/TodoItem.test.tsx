import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from './TodoItem';
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

describe('TodoItem', () => {
  const mockHandlers = {
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onToggle: vi.fn(),
  };

  it('should render todo item correctly', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('should show completed todo with line-through', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoItem todo={completedTodo} {...mockHandlers} />);

    const title = screen.getByText('Test Todo');
    expect(title).toHaveClass('line-through');
  });

  it('should toggle completion when checkbox is clicked', async () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    expect(mockHandlers.onToggle).toHaveBeenCalledWith('1');
  });

  it('should enter edit mode when edit button is clicked', async () => {
    const { container } = render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    // Hover to show buttons
    const todoDiv = container.querySelector('.group');
    if (todoDiv) fireEvent.mouseEnter(todoDiv);

    const editButton = screen.getByLabelText('Edit todo');
    await userEvent.click(editButton);

    // Should show form inputs
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('should save changes when form is submitted', async () => {
    const { container } = render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    // Enter edit mode
    const todoDiv = container.querySelector('.group');
    if (todoDiv) fireEvent.mouseEnter(todoDiv);
    const editButton = screen.getByLabelText('Edit todo');
    await userEvent.click(editButton);

    // Update title
    const titleInput = screen.getByDisplayValue('Test Todo');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Todo');

    // Submit form
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', expect.objectContaining({
      title: 'Updated Todo',
    }));
  });

  it('should cancel editing when cancel button is clicked', async () => {
    const { container } = render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    // Enter edit mode
    const todoDiv = container.querySelector('.group');
    if (todoDiv) fireEvent.mouseEnter(todoDiv);
    const editButton = screen.getByLabelText('Edit todo');
    await userEvent.click(editButton);

    // Cancel
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);

    // Should exit edit mode
    await waitFor(() => {
      expect(screen.queryByDisplayValue('Test Todo')).not.toBeInTheDocument();
    });
  });

  it('should cancel editing when Escape is pressed', async () => {
    const { container } = render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    // Enter edit mode
    const todoDiv = container.querySelector('.group');
    if (todoDiv) fireEvent.mouseEnter(todoDiv);
    const editButton = screen.getByLabelText('Edit todo');
    await userEvent.click(editButton);

    // Press Escape
    fireEvent.keyDown(container, { key: 'Escape' });

    // Should exit edit mode
    await waitFor(() => {
      expect(screen.queryByDisplayValue('Test Todo')).not.toBeInTheDocument();
    });
  });

  it('should call onDelete when delete button is clicked', async () => {
    const { container } = render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    // Hover to show buttons
    const todoDiv = container.querySelector('.group');
    if (todoDiv) fireEvent.mouseEnter(todoDiv);

    const deleteButton = screen.getByLabelText('Delete todo');
    await userEvent.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  it('should display priority badge', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('should display due date when present', () => {
    const todoWithDueDate = {
      ...mockTodo,
      due_date: new Date(Date.now() + 86400000).toISOString(),
    };
    render(<TodoItem todo={todoWithDueDate} {...mockHandlers} />);

    expect(screen.getByText(/Tomorrow|In 1 days/)).toBeInTheDocument();
  });

  it('should show overdue indicator for past due dates', () => {
    const overdueTodo = {
      ...mockTodo,
      due_date: new Date(Date.now() - 86400000).toISOString(),
    };
    render(<TodoItem todo={overdueTodo} {...mockHandlers} />);

    expect(screen.getByText(/⚠️/)).toBeInTheDocument();
  });

  it('should validate title is required', async () => {
    const { container } = render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    // Enter edit mode
    const todoDiv = container.querySelector('.group');
    if (todoDiv) fireEvent.mouseEnter(todoDiv);
    const editButton = screen.getByLabelText('Edit todo');
    await userEvent.click(editButton);

    // Clear title
    const titleInput = screen.getByDisplayValue('Test Todo');
    await userEvent.clear(titleInput);

    // Try to submit
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    expect(mockHandlers.onUpdate).not.toHaveBeenCalled();
  });
});
